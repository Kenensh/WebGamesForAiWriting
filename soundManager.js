/**
 * 音效管理器
 * 提供遊戲背景音樂和音效的控制功能
 * 版本: 1.0.0
 * 最後更新: 2025-07-15
 */

class SoundManager {
  constructor() {
    this._isMuted = false;
    this._musicVolume = 0.5;
    this._soundVolume = 0.7;
    this._currentMusic = null;
    this._audioContext = null;
    this._soundCache = {};
    this._musicCache = {};
    
    // 從本地存儲中讀取設置
    this._loadSettings();
    
    // 初始化 Web Audio API
    this._initAudioContext();
  }
  
  /**
   * 初始化 Web Audio API
   * @private
   */
  _initAudioContext() {
    try {
      // 檢查瀏覽器支援
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this._audioContext = new AudioContext();
        console.log("音效管理器初始化成功");
      } else {
        console.warn("您的瀏覽器不支援 Web Audio API");
      }
    } catch (e) {
      console.error("初始化音效管理器時發生錯誤:", e);
    }
  }
  
  /**
   * 從本地存儲加載設置
   * @private
   */
  _loadSettings() {
    try {
      const settings = localStorage.getItem('soundSettings');
      if (settings) {
        const { isMuted, musicVolume, soundVolume } = JSON.parse(settings);
        this._isMuted = isMuted;
        this._musicVolume = musicVolume;
        this._soundVolume = soundVolume;
      }
    } catch (e) {
      console.error("讀取音效設置時發生錯誤:", e);
    }
  }
  
  /**
   * 保存設置到本地存儲
   * @private
   */
  _saveSettings() {
    try {
      const settings = {
        isMuted: this._isMuted,
        musicVolume: this._musicVolume,
        soundVolume: this._soundVolume
      };
      localStorage.setItem('soundSettings', JSON.stringify(settings));
    } catch (e) {
      console.error("保存音效設置時發生錯誤:", e);
    }
  }
  
  /**
   * 確保 AudioContext 已啟動
   * @private
   */
  _ensureAudioContext() {
    if (!this._audioContext) {
      this._initAudioContext();
    } else if (this._audioContext.state === 'suspended') {
      this._audioContext.resume();
    }
    return !!this._audioContext;
  }
  
  /**
   * 創建或獲取音頻緩存
   * @private
   * @param {string} url - 音頻文件URL
   * @param {Object} cache - 緩存對象
   * @returns {Promise<AudioBuffer>} 音頻緩衝區
   */
  async _getAudioBuffer(url, cache) {
    if (!this._ensureAudioContext()) {
      throw new Error("AudioContext不可用");
    }
    
    // 檢查緩存
    if (cache[url]) {
      return cache[url];
    }
    
    try {
      // 獲取音頻文件
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP錯誤: ${response.status}`);
      }
      
      // 解碼音頻數據
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this._audioContext.decodeAudioData(arrayBuffer);
      
      // 存入緩存
      cache[url] = audioBuffer;
      
      return audioBuffer;
    } catch (e) {
      console.error(`載入音頻文件時發生錯誤 ${url}:`, e);
      throw e;
    }
  }
  
  /**
   * 播放音效
   * @param {string} soundUrl - 音效文件URL
   * @param {Object} options - 選項 {volume, loop, playbackRate}
   * @returns {Object} 包含stop方法的控制對象
   */
  async playSound(soundUrl, options = {}) {
    if (this._isMuted || !this._ensureAudioContext()) {
      return { stop: () => {} };
    }
    
    try {
      const audioBuffer = await this._getAudioBuffer(soundUrl, this._soundCache);
      
      // 創建音頻節點
      const source = this._audioContext.createBufferSource();
      const gainNode = this._audioContext.createGain();
      
      // 設置緩衝和選項
      source.buffer = audioBuffer;
      source.loop = options.loop || false;
      source.playbackRate.value = options.playbackRate || 1;
      
      // 設置音量
      const volume = typeof options.volume === 'number' ? 
        options.volume : this._soundVolume;
      gainNode.gain.value = volume;
      
      // 連接節點
      source.connect(gainNode);
      gainNode.connect(this._audioContext.destination);
      
      // 播放
      source.start();
      
      return {
        stop: () => {
          try {
            source.stop();
          } catch (e) {
            // 忽略已停止的音頻源錯誤
          }
        }
      };
    } catch (e) {
      console.error("播放音效時發生錯誤:", e);
      return { stop: () => {} };
    }
  }
  
  /**
   * 播放背景音樂
   * @param {string} musicUrl - 音樂文件URL
   * @param {Object} options - 選項 {volume, fadeIn}
   */
  async playMusic(musicUrl, options = {}) {
    if (this._currentMusic) {
      this.stopMusic(options.fadeOut);
    }
    
    if (this._isMuted || !this._ensureAudioContext()) {
      return;
    }
    
    try {
      const audioBuffer = await this._getAudioBuffer(musicUrl, this._musicCache);
      
      // 創建音頻節點
      const source = this._audioContext.createBufferSource();
      const gainNode = this._audioContext.createGain();
      
      // 設置緩衝和循環
      source.buffer = audioBuffer;
      source.loop = true;
      
      // 設置音量
      const volume = typeof options.volume === 'number' ? 
        options.volume : this._musicVolume;
        
      if (options.fadeIn) {
        gainNode.gain.setValueAtTime(0, this._audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          volume, 
          this._audioContext.currentTime + (options.fadeIn / 1000)
        );
      } else {
        gainNode.gain.value = volume;
      }
      
      // 連接節點
      source.connect(gainNode);
      gainNode.connect(this._audioContext.destination);
      
      // 播放
      source.start();
      
      // 保存當前音樂引用
      this._currentMusic = {
        source,
        gainNode,
        volume
      };
    } catch (e) {
      console.error("播放背景音樂時發生錯誤:", e);
    }
  }
  
  /**
   * 停止當前背景音樂
   * @param {number} fadeOut - 淡出時間(毫秒)
   */
  stopMusic(fadeOut = 0) {
    if (!this._currentMusic) return;
    
    const { source, gainNode } = this._currentMusic;
    
    try {
      if (fadeOut && this._audioContext) {
        gainNode.gain.linearRampToValueAtTime(
          0, 
          this._audioContext.currentTime + (fadeOut / 1000)
        );
        setTimeout(() => source.stop(), fadeOut);
      } else {
        source.stop();
      }
    } catch (e) {
      // 忽略已停止的音頻源錯誤
    }
    
    this._currentMusic = null;
  }
  
  /**
   * 暫停當前背景音樂
   */
  pauseMusic() {
    if (!this._currentMusic || !this._audioContext) return;
    this._audioContext.suspend();
  }
  
  /**
   * 恢復播放背景音樂
   */
  resumeMusic() {
    if (!this._currentMusic || !this._audioContext) return;
    this._audioContext.resume();
  }
  
  /**
   * 設置音效音量
   * @param {number} volume - 音量 (0-1)
   */
  setSoundVolume(volume) {
    this._soundVolume = Math.max(0, Math.min(1, volume));
    this._saveSettings();
  }
  
  /**
   * 設置音樂音量
   * @param {number} volume - 音量 (0-1)
   */
  setMusicVolume(volume) {
    this._musicVolume = Math.max(0, Math.min(1, volume));
    
    // 更新當前音樂音量
    if (this._currentMusic) {
      this._currentMusic.gainNode.gain.value = this._musicVolume;
    }
    
    this._saveSettings();
  }
  
  /**
   * 設置靜音狀態
   * @param {boolean} muted - 是否靜音
   */
  setMuted(muted) {
    this._isMuted = muted;
    
    if (muted) {
      this.stopMusic();
    }
    
    this._saveSettings();
  }
  
  /**
   * 獲取靜音狀態
   * @returns {boolean} 是否靜音
   */
  isMuted() {
    return this._isMuted;
  }
  
  /**
   * 獲取音效音量
   * @returns {number} 音量 (0-1)
   */
  getSoundVolume() {
    return this._soundVolume;
  }
  
  /**
   * 獲取音樂音量
   * @returns {number} 音量 (0-1)
   */
  getMusicVolume() {
    return this._musicVolume;
  }
  
  /**
   * 生成音調
   * @param {number} frequency - 頻率 (Hz)
   * @param {number} duration - 持續時間 (毫秒)
   * @param {Object} options - 選項 {type, volume}
   * @returns {Object} 包含stop方法的控制對象
   */
  generateTone(frequency, duration, options = {}) {
    if (this._isMuted || !this._ensureAudioContext()) {
      return { stop: () => {} };
    }
    
    try {
      // 創建音頻節點
      const oscillator = this._audioContext.createOscillator();
      const gainNode = this._audioContext.createGain();
      
      // 設置選項
      oscillator.type = options.type || 'sine';
      oscillator.frequency.value = frequency;
      
      const volume = typeof options.volume === 'number' ? 
        options.volume : this._soundVolume;
      
      // 設置音量包絡
      gainNode.gain.setValueAtTime(0, this._audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume, 
        this._audioContext.currentTime + 0.05
      );
      
      if (duration) {
        gainNode.gain.linearRampToValueAtTime(
          volume, 
          this._audioContext.currentTime + ((duration - 50) / 1000)
        );
        gainNode.gain.linearRampToValueAtTime(
          0, 
          this._audioContext.currentTime + (duration / 1000)
        );
      }
      
      // 連接節點
      oscillator.connect(gainNode);
      gainNode.connect(this._audioContext.destination);
      
      // 播放
      oscillator.start();
      
      if (duration) {
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch (e) {
            // 忽略已停止的音頻源錯誤
          }
        }, duration);
      }
      
      return {
        stop: () => {
          try {
            gainNode.gain.linearRampToValueAtTime(
              0, 
              this._audioContext.currentTime + 0.05
            );
            setTimeout(() => oscillator.stop(), 50);
          } catch (e) {
            // 忽略已停止的音頻源錯誤
          }
        }
      };
    } catch (e) {
      console.error("生成音調時發生錯誤:", e);
      return { stop: () => {} };
    }
  }
}

// 創建全局單例實例
const soundManager = new SoundManager();
