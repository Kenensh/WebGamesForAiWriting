/**
 * 語言管理系統
 * 提供中英文切換功能
 * 版本: 1.0.0
 * 最後更新: 2025-06-11
 */

class LanguageManager {
  constructor() {
    this.currentLanguage = localStorage.getItem("gameLanguage") || "zh-TW";
    this.translations = {
      "zh-TW": {
        // 通用
        "site.title": "網頁小遊戲合集",
        "site.description": "多款經典網頁小遊戲，包含終極密碼、貪食蛇、瑪利歐、打磚塊、打飛機以及塔防遊戲",
        "nav.games": "遊戲列表",
        "nav.about": "關於",
        "nav.profile": "個人檔案",
        "nav.settings": "設定",
        
        // 按鈕
        "btn.start": "開始遊戲",
        "btn.restart": "重新開始",
        "btn.pause": "暫停",
        "btn.resume": "繼續",
        "btn.help": "遊戲說明",
        "btn.back": "返回",
        "btn.home": "返回主選單",
        "btn.close": "關閉",
        "btn.ok": "確定",
        "btn.cancel": "取消",
        
        // 遊戲狀態
        "game.score": "分數",
        "game.level": "等級",
        "game.time": "時間",
        "game.lives": "生命",
        "game.best": "最佳",
        "game.streak": "連勝",
        "game.combo": "連擊",
        "game.accuracy": "準確度",
        
        // 難度
        "difficulty.easy": "簡單",
        "difficulty.normal": "普通",
        "difficulty.medium": "中等",
        "difficulty.hard": "困難",
        "difficulty.expert": "專家",
        "difficulty.extreme": "極限",
        
        // 遊戲結果
        "result.win": "獲勝！",
        "result.lose": "失敗！",
        "result.gameOver": "遊戲結束",
        "result.newRecord": "新紀錄！",
        "result.congratulations": "恭喜！",
        "result.tryAgain": "再試一次",
        
        // 設定
        "settings.theme": "主題",
        "settings.language": "語言",
        "settings.sound": "音效",
        "settings.music": "音樂",
        "settings.volume": "音量",
        
        // 主題
        "theme.light": "明亮模式",
        "theme.dark": "暗黑模式",
        "theme.auto": "自動",
        
        // 語言
        "language.zhTW": "繁體中文",
        "language.enUS": "English",
        
        // 遊戲名稱
        "games.guessing": "終極密碼",
        "games.snake": "貪食蛇",
        "games.mario": "瑪利歐",
        "games.breakout": "打磚塊",
        "games.shooter": "打飛機",
        "games.towerDefense": "塔防遊戲",
        "games.tetris": "俄羅斯方塊",
        "games.2048": "2048",
        "games.memory": "記憶遊戲",
        "games.flappyBird": "Flappy Bird",
        "games.clickSpeed": "點擊速度",
        "games.colorMatch": "顏色配對",
        "games.bubblePop": "泡泡消除",
        "games.rhythmTap": "節奏點擊",
        "games.memorySimon": "記憶反應",
        "games.ballBounce": "彈球保持",
        "games.cursorChase": "游標追蹤",
        "games.timeSpaceTracker": "時空追蹤者",
        
        // 關於
        "about.title": "關於本站",
        "about.description": "這是一個收集了多款經典網頁小遊戲的網站，所有遊戲都使用純JavaScript開發，無需安裝任何外掛程式即可遊玩。",
        "about.features": "功能特色",
        "about.responsive": "響應式設計，支援電腦和手機",
        "about.offline": "支援離線遊玩",
        "about.achievement": "成就系統",
        "about.theme": "明暗主題切換",
        "about.multilang": "多語言支援"
      },
      
      "en-US": {
        // Common
        "site.title": "Web Mini Games Collection",
        "site.description": "Multiple classic web games including Number Guessing, Snake, Mario, Breakout, Shooter and Tower Defense",
        "nav.games": "Games",
        "nav.about": "About",
        "nav.profile": "Profile",
        "nav.settings": "Settings",
        
        // Buttons
        "btn.start": "Start Game",
        "btn.restart": "Restart",
        "btn.pause": "Pause",
        "btn.resume": "Resume",
        "btn.help": "Help",
        "btn.back": "Back",
        "btn.home": "Home",
        "btn.close": "Close",
        "btn.ok": "OK",
        "btn.cancel": "Cancel",
        
        // Game Status
        "game.score": "Score",
        "game.level": "Level",
        "game.time": "Time",
        "game.lives": "Lives",
        "game.best": "Best",
        "game.streak": "Streak",
        "game.combo": "Combo",
        "game.accuracy": "Accuracy",
        
        // Difficulty
        "difficulty.easy": "Easy",
        "difficulty.normal": "Normal",
        "difficulty.medium": "Medium",
        "difficulty.hard": "Hard",
        "difficulty.expert": "Expert",
        "difficulty.extreme": "Extreme",
        
        // Game Results
        "result.win": "You Win!",
        "result.lose": "You Lose!",
        "result.gameOver": "Game Over",
        "result.newRecord": "New Record!",
        "result.congratulations": "Congratulations!",
        "result.tryAgain": "Try Again",
        
        // Settings
        "settings.theme": "Theme",
        "settings.language": "Language",
        "settings.sound": "Sound",
        "settings.music": "Music",
        "settings.volume": "Volume",
        
        // Theme
        "theme.light": "Light Mode",
        "theme.dark": "Dark Mode",
        "theme.auto": "Auto",
        
        // Language
        "language.zhTW": "繁體中文",
        "language.enUS": "English",
        
        // Game Names
        "games.guessing": "Number Guessing",
        "games.snake": "Snake",
        "games.mario": "Mario",
        "games.breakout": "Breakout",
        "games.shooter": "Shooter",
        "games.towerDefense": "Tower Defense",
        "games.tetris": "Tetris",
        "games.2048": "2048",
        "games.memory": "Memory Game",
        "games.flappyBird": "Flappy Bird",
        "games.clickSpeed": "Click Speed",
        "games.colorMatch": "Color Match",
        "games.bubblePop": "Bubble Pop",
        "games.rhythmTap": "Rhythm Tap",
        "games.memorySimon": "Memory Simon",
        "games.ballBounce": "Ball Bounce",
        "games.cursorChase": "Cursor Chase",
        "games.timeSpaceTracker": "Time Space Tracker",
        
        // About
        "about.title": "About",
        "about.description": "This is a collection of classic web games, all developed with pure JavaScript and playable without any plugins.",
        "about.features": "Features",
        "about.responsive": "Responsive design for desktop and mobile",
        "about.offline": "Offline playable",
        "about.achievement": "Achievement system",
        "about.theme": "Light/Dark theme toggle",
        "about.multilang": "Multi-language support"
      }
    };
    
    this.init();
  }
  
  init() {
    // 應用當前語言
    this.applyLanguage();
    
    // 更新HTML lang屬性
    document.documentElement.lang = this.currentLanguage;
    
    // 設置語言切換按鈕
    this.setupLanguageToggle();
  }
  
  applyLanguage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.getTranslation(key);
      if (translation) {
        if (element.tagName === 'INPUT' && element.type === 'submit') {
          element.value = translation;
        } else if (element.hasAttribute('placeholder')) {
          element.placeholder = translation;
        } else if (element.hasAttribute('title')) {
          element.title = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
    
    // 更新meta標籤
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = this.getTranslation('site.description');
    }
    
    // 更新title
    document.title = this.getTranslation('site.title');
  }
  
  getTranslation(key) {
    return this.translations[this.currentLanguage]?.[key] || this.translations['zh-TW']?.[key] || key;
  }
  
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('gameLanguage', language);
      document.documentElement.lang = language;
      this.applyLanguage();
      
      // 觸發語言改變事件
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: language }
      }));
    }
  }
  
  setupLanguageToggle() {
    const toggleButton = document.getElementById('language-toggle');
    if (toggleButton) {
      this.updateLanguageToggleButton(toggleButton);
      
      toggleButton.addEventListener('click', () => {
        const newLanguage = this.currentLanguage === 'zh-TW' ? 'en-US' : 'zh-TW';
        this.setLanguage(newLanguage);
        this.updateLanguageToggleButton(toggleButton);
      });
    }
  }
  
  updateLanguageToggleButton(button) {
    const zhIcon = button.querySelector('.lang-zh');
    const enIcon = button.querySelector('.lang-en');
    
    if (this.currentLanguage === 'zh-TW') {
      zhIcon?.classList.add('active');
      enIcon?.classList.remove('active');
      button.setAttribute('aria-label', '切換到英文');
    } else {
      zhIcon?.classList.remove('active');
      enIcon?.classList.add('active');
      button.setAttribute('aria-label', 'Switch to Chinese');
    }
  }
  
  // 便捷方法
  t(key) {
    return this.getTranslation(key);
  }
}

// 全局實例
window.languageManager = new LanguageManager();
