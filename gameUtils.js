/**
 * 通用遊戲工具庫
 * 提供所有遊戲共同使用的基礎功能
 * 包含模態框、分數管理、遊戲控制器和通用工具函數
 * 版本: 1.1.0
 * 最後更新: 2025-05-12
 */

// 模態框控制
class Modal {
  constructor(id, title, content) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.modalElement = null;
    this.createModal();
  }

  createModal() {
    // 檢查是否已存在相同ID的模態框
    const existingModal = document.getElementById(this.id);
    if (existingModal) {
      existingModal.remove();
    }

    // 創建模態框元素
    const modal = document.createElement("div");
    modal.id = this.id;
    modal.className = "game-modal";
    modal.style.display = "none";

    // 創建模態框內容
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${this.title}</h2>
          <span class="close-button">&times;</span>
        </div>
        <div class="modal-body">
          ${this.content}
        </div>
        <div class="modal-footer">
          <button class="modal-button">確定</button>
        </div>
      </div>
    `;

    // 添加到頁面
    document.body.appendChild(modal);
    this.modalElement = modal;

    // 添加事件監聽器
    const closeButton = modal.querySelector(".close-button");
    const confirmButton = modal.querySelector(".modal-button");

    closeButton.addEventListener("click", () => this.hide());
    confirmButton.addEventListener("click", () => this.hide());

    // 點擊模態框外部時關閉
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.hide();
      }
    });
  }

  show() {
    if (this.modalElement) {
      this.modalElement.style.display = "flex";
      return new Promise((resolve) => {
        const confirmBtn = this.modalElement.querySelector(".modal-button");
        const closeBtn = this.modalElement.querySelector(".close-button");

        const handleClick = () => {
          confirmBtn.removeEventListener("click", handleClick);
          closeBtn.removeEventListener("click", handleClick);
          resolve();
        };

        confirmBtn.addEventListener("click", handleClick);
        closeBtn.addEventListener("click", handleClick);
      });
    }
  }

  hide() {
    if (this.modalElement) {
      this.modalElement.style.display = "none";
    }
  }

  updateContent(title, content) {
    if (this.modalElement) {
      this.title = title;
      this.content = content;
      const titleElement = this.modalElement.querySelector(".modal-header h2");
      const bodyElement = this.modalElement.querySelector(".modal-body");

      if (titleElement) titleElement.textContent = title;
      if (bodyElement) bodyElement.innerHTML = content;
    }
  }
}

// 分數管理
class ScoreManager {
  constructor(elementId, initialScore = 0) {
    this.score = initialScore;
    this.elementId = elementId;
    this.highScore = this.loadHighScore();
    this.updateDisplay();
  }

  add(points) {
    this.score += points;
    this.updateDisplay();
    this.checkHighScore();
  }

  reset() {
    this.score = 0;
    this.updateDisplay();
  }

  updateDisplay() {
    const element = document.getElementById(this.elementId);
    if (element) {
      element.textContent = this.score;
    }
  }

  checkHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  loadHighScore() {
    const gameId =
      document.querySelector('meta[name="game-id"]')?.content ||
      window.location.pathname.split("/").pop().replace(".html", "");
    const storedScore = localStorage.getItem(`highScore_${gameId}`);
    return storedScore ? parseInt(storedScore) : 0;
  }

  saveHighScore() {
    const gameId =
      document.querySelector('meta[name="game-id"]')?.content ||
      window.location.pathname.split("/").pop().replace(".html", "");
    localStorage.setItem(`highScore_${gameId}`, this.highScore.toString());
  }

  set(value) {
    this.score = value;
    this.updateDisplay();
    this.checkHighScore();
  }

  getHighScore() {
    return this.highScore;
  }

  getCurrentScore() {
    return this.score;
  }
}

// 遊戲控制器
class GameController {
  constructor() {
    this.paused = false;
    this.gameOver = false;
    this.initialized = false;
    this.animationFrameId = null;
    this.setupControlButtons();
  }

  setupControlButtons() {
    // 設置按鈕事件監聽器
    const pauseBtn = document.getElementById("pauseButton");
    const restartBtn = document.getElementById("restartButton");
    const homeBtn = document.getElementById("homeButton");
    const helpBtn = document.getElementById("helpButton");

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => this.togglePause());
    }

    if (restartBtn) {
      restartBtn.addEventListener("click", () => this.restart());
    }

    if (homeBtn) {
      homeBtn.addEventListener(
        "click",
        () => (window.location.href = "index.html")
      );
    }

    if (helpBtn) {
      helpBtn.addEventListener("click", () => {
        const helpModal = document.getElementById("helpModal");
        if (helpModal && typeof helpModal.show === "function") {
          helpModal.show();
        } else {
          alert("遊戲說明未載入，請重新整理頁面。");
        }
      });
    }
  }

  togglePause() {
    this.paused = !this.paused;
    const pauseBtn = document.getElementById("pauseButton");

    if (pauseBtn) {
      pauseBtn.textContent = this.paused ? "繼續" : "暫停";
    }

    if (this.paused) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // 顯示暫停訊息
      this.showMessage("遊戲已暫停", "點擊繼續按鈕恢復遊戲");
    } else {
      // 隱藏暫停訊息
      this.hideMessage();

      // 恢復遊戲循環
      if (typeof this.gameLoop === "function") {
        this.startGameLoop();
      }
    }

    return this.paused;
  }

  restart() {
    // 重置遊戲狀態
    this.paused = false;
    this.gameOver = false;

    // 更新暫停按鈕文字
    const pauseBtn = document.getElementById("pauseButton");
    if (pauseBtn) {
      pauseBtn.textContent = "暫停";
    }

    // 隱藏訊息
    this.hideMessage();

    // 如果有註冊重置函數，則調用它
    if (typeof this.onRestart === "function") {
      this.onRestart();
    }
  }

  setGameLoop(gameLoopFunction) {
    this.gameLoop = gameLoopFunction;
  }

  startGameLoop() {
    if (typeof this.gameLoop !== "function") {
      console.error("未設置遊戲循環函數！");
      return;
    }

    const loop = () => {
      if (!this.paused && !this.gameOver) {
        this.gameLoop();
      }

      if (!this.gameOver) {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stopGameLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  setRestartHandler(handler) {
    this.onRestart = handler;
  }

  setPauseHandler(handler) {
    this.onPause = handler;
  }

  setResumeHandler(handler) {
    this.onResume = handler;
  }

  togglePause() {
    this.paused = !this.paused;
    const pauseBtn = document.getElementById("pauseButton");
    const gamePaused = document.getElementById("gamePaused");

    if (pauseBtn) {
      pauseBtn.textContent = this.paused ? "繼續" : "暫停";
    }

    if (gamePaused) {
      gamePaused.style.display = this.paused ? "flex" : "none";
    }

    if (this.paused) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // 執行暫停回調
      if (typeof this.onPause === "function") {
        this.onPause();
      }
    } else {
      // 執行恢復回調
      if (typeof this.onResume === "function") {
        this.onResume();
      }

      // 恢復遊戲循環
      if (typeof this.gameLoop === "function") {
        this.startGameLoop();
      }
    }

    return this.paused;
  }

  endGame(score, message = "遊戲結束") {
    this.gameOver = true;
    this.stopGameLoop();

    // 顯示遊戲結束訊息和分數
    const gameId =
      document.querySelector('meta[name="game-id"]')?.content ||
      window.location.pathname.split("/").pop().replace(".html", "");

    const highScore = localStorage.getItem(`highScore_${gameId}`) || 0;

    let content = `
      <div class="game-over-container">
        <p>${message}</p>
        <p>你的分數: <span class="highlight-score">${score}</span></p>
        <p>最高分: <span class="highlight-score">${highScore}</span></p>
        <button id="gameOverRestartBtn" class="primary-button">再玩一次</button>
        <button id="gameOverHomeBtn" class="secondary-button">返回首頁</button>
      </div>
    `;

    this.showMessage("遊戲結束", content);

    // 添加按鈕事件
    setTimeout(() => {
      const restartBtn = document.getElementById("gameOverRestartBtn");
      const homeBtn = document.getElementById("gameOverHomeBtn");

      if (restartBtn) {
        restartBtn.addEventListener("click", () => {
          this.hideMessage();
          this.restart();
        });
      }

      if (homeBtn) {
        homeBtn.addEventListener("click", () => {
          window.location.href = "index.html";
        });
      }
    }, 100);
  }

  showMessage(title, content) {
    let messageContainer = document.getElementById("gameMessageContainer");

    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "gameMessageContainer";
      messageContainer.className = "game-message-container";
      document.body.appendChild(messageContainer);
    }

    messageContainer.innerHTML = `
      <div class="game-message">
        <h2>${title}</h2>
        <div class="game-message-content">${content}</div>
      </div>
    `;

    messageContainer.style.display = "flex";

    // 添加動畫效果
    const messageElement = messageContainer.querySelector(".game-message");
    messageElement.style.animation = "fadeInDown 0.5s forwards";
  }

  hideMessage() {
    const messageContainer = document.getElementById("gameMessageContainer");
    if (messageContainer) {
      // 添加淡出動畫
      const messageElement = messageContainer.querySelector(".game-message");
      if (messageElement) {
        messageElement.style.animation = "fadeOutUp 0.5s forwards";

        setTimeout(() => {
          messageContainer.style.display = "none";
        }, 500);
      } else {
        messageContainer.style.display = "none";
      }
    }
  }

  showStartAnimation(callback) {
    // 創建開始動畫元素
    let animContainer = document.getElementById("gameStartAnimation");

    if (!animContainer) {
      animContainer = document.createElement("div");
      animContainer.id = "gameStartAnimation";
      animContainer.className = "game-start-animation";
      document.body.appendChild(animContainer);
    }

    // 獲取遊戲名稱
    const gameName =
      document.querySelector("title")?.textContent ||
      document.querySelector('meta[name="game-name"]')?.content ||
      "遊戲開始！";

    animContainer.innerHTML = `
      <div class="start-animation-content">
        <h1>${gameName}</h1>
        <div class="countdown">3</div>
      </div>
    `;

    animContainer.style.display = "flex";

    // 倒數計時動畫
    const countdown = animContainer.querySelector(".countdown");
    let count = 3;

    const countdownInterval = setInterval(() => {
      count--;

      if (count > 0) {
        countdown.textContent = count;
        countdown.style.animation = "none";
        void countdown.offsetWidth; // 重置動畫
        countdown.style.animation = "pulse 1s";
      } else if (count === 0) {
        countdown.textContent = "開始!";
        countdown.style.animation = "none";
        void countdown.offsetWidth;
        countdown.style.animation = "zoomIn 0.5s";
      } else {
        clearInterval(countdownInterval);

        // 隱藏動畫容器
        animContainer.style.animation = "fadeOut 0.5s forwards";

        setTimeout(() => {
          animContainer.style.display = "none";

          // 調用回調函數開始遊戲
          if (typeof callback === "function") {
            callback();
          }
        }, 500);
      }
    }, 1000);
  }
}

// 通用工具函數
const Utils = {
  /**
   * 創建一個指定範圍內的隨機數
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} - 隨機數
   */
  randomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * 檢測兩個矩形是否碰撞
   * @param {object} rect1 - 第一個矩形 {x, y, width, height}
   * @param {object} rect2 - 第二個矩形 {x, y, width, height}
   * @returns {boolean} - 是否碰撞
   */
  rectCollision: (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  },

  /**
   * 防抖函數
   * @param {function} func - 要執行的函數
   * @param {number} wait - 等待時間（毫秒）
   * @returns {function} - 防抖處理後的函數
   */
  debounce: (func, wait) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  },

  /**
   * 節流函數
   * @param {function} func - 要執行的函數
   * @param {number} limit - 限制時間（毫秒）
   * @returns {function} - 節流處理後的函數
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function (...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * 複製文本到剪貼板
   * @param {string} text - 要複製的文本
   * @returns {Promise} - 複製結果
   */
  copyToClipboard: (text) => {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    } else {
      // 兼容舊瀏覽器
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textarea);
      return Promise.resolve(result);
    }
  },

  /**
   * 將時間（秒）格式化為 MM:SS 格式
   * @param {number} seconds - 秒數
   * @returns {string} - 格式化後的時間
   */
  formatTime: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  },

  /**
   * 移動監聽器（PC鍵盤和移動設備觸摸）
   * @param {HTMLElement} element - 要監聽的元素
   * @param {function} callback - 回調函數，接收 x, y 及事件類型
   * @returns {object} - 監聽器控制對象
   */
  moveListener: (element, callback) => {
    let isActive = false;

    // 鍵盤事件處理
    const keyState = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };

    const keydownHandler = (e) => {
      if (Object.keys(keyState).includes(e.key)) {
        keyState[e.key] = true;
        updateMovement();
      }
    };

    const keyupHandler = (e) => {
      if (Object.keys(keyState).includes(e.key)) {
        keyState[e.key] = false;
        updateMovement();
      }
    };

    const updateMovement = () => {
      let dx = 0,
        dy = 0;
      if (keyState.ArrowLeft) dx -= 1;
      if (keyState.ArrowRight) dx += 1;
      if (keyState.ArrowUp) dy -= 1;
      if (keyState.ArrowDown) dy += 1;

      if (dx !== 0 || dy !== 0) {
        callback(dx, dy, "keyboard");
      }
    };

    // 觸摸事件處理
    let lastX = 0,
      lastY = 0;

    const touchStartHandler = (e) => {
      const touch = e.touches[0];
      lastX = touch.clientX;
      lastY = touch.clientY;
    };

    const touchMoveHandler = (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - lastX;
      const dy = touch.clientY - lastY;
      lastX = touch.clientX;
      lastY = touch.clientY;

      callback(dx, dy, "touch");
    };

    // 啟動監聽
    const start = () => {
      if (isActive) return;
      isActive = true;

      // 鍵盤事件
      window.addEventListener("keydown", keydownHandler);
      window.addEventListener("keyup", keyupHandler);

      // 觸摸事件
      element.addEventListener("touchstart", touchStartHandler);
      element.addEventListener("touchmove", touchMoveHandler);
    };

    // 停止監聽
    const stop = () => {
      if (!isActive) return;
      isActive = false;

      // 移除鍵盤事件
      window.removeEventListener("keydown", keydownHandler);
      window.removeEventListener("keyup", keyupHandler);

      // 移除觸摸事件
      element.removeEventListener("touchstart", touchStartHandler);
      element.removeEventListener("touchmove", touchMoveHandler);
    };

    // 返回控制接口
    return { start, stop };
  },
};

// 遊戲音頻管理器
class AudioManager {
  constructor() {
    // 檢查瀏覽器音頻支持
    this.audioContext = null;
    this.sounds = {};
    this.music = null;
    this.musicVolume = 0.5;
    this.soundVolume = 0.8;
    this.muted = false;

    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser");
    }
  }

  /**
   * 載入音效
   * @param {string} id - 音效ID
   * @param {string} url - 音效文件URL
   * @returns {Promise} - 載入結果
   */
  loadSound(id, url) {
    if (!this.audioContext) return Promise.resolve();

    return fetch(url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        this.sounds[id] = audioBuffer;
      })
      .catch((e) => console.error(`Error loading sound ${id}:`, e));
  }

  /**
   * 播放音效
   * @param {string} id - 音效ID
   * @param {number} volume - 音量 (0-1)
   * @param {boolean} loop - 是否循環播放
   * @returns {object} - 音效控制對象
   */
  playSound(id, volume = null, loop = false) {
    if (!this.audioContext || this.muted) return { stop: () => {} };

    const buffer = this.sounds[id];
    if (!buffer) {
      console.warn(`Sound ${id} not found`);
      return { stop: () => {} };
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    source.buffer = buffer;
    source.loop = loop;

    gainNode.gain.value = volume !== null ? volume : this.soundVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);

    return {
      stop: () => {
        try {
          source.stop(0);
        } catch (e) {
          console.warn("Error stopping sound:", e);
        }
      },
      setVolume: (vol) => {
        gainNode.gain.value = vol;
      },
    };
  }

  /**
   * 設置全局音效音量
   * @param {number} volume - 音量 (0-1)
   */
  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 靜音切換
   * @param {boolean} muted - 是否靜音
   */
  setMuted(muted) {
    this.muted = muted;
    if (this.music && this.music.setVolume) {
      this.music.setVolume(muted ? 0 : this.musicVolume);
    }
  }
}

// 導出工具類
window.GameUtils = {
  Modal,
  ScoreManager,
  GameController,
  Utils,
  AudioManager,
};
