/**
 * 主題切換系統
 * 提供明亮/暗黑主題切換功能
 * 版本: 2.0.0
 * 最後更新: 2025-06-11
 */

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem("gameTheme") || "light";
    this.systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    // 預設使用系統偏好
    if (!localStorage.getItem("gameTheme")) {
      this.currentTheme = this.systemPrefersDark ? "dark" : "light";
    }

    this.init();
  }

  init() {
    // 應用當前主題
    this.applyTheme();
    
    // 設置主題切換按鈕
    this.setupThemeToggle();
    
    // 監聽系統主題變化
    this.watchSystemTheme();
  }

  applyTheme() {
    // 設置data-theme屬性
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // 更新meta主題色
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = this.currentTheme === 'dark' ? '#1e1b4b' : '#667eea';
    }
  }

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.currentTheme = theme;
      localStorage.setItem('gameTheme', theme);
      this.applyTheme();
      
      // 更新切換按鈕狀態
      this.updateThemeToggleButton();
      
      // 觸發主題改變事件
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: theme }
      }));
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setupThemeToggle() {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      this.updateThemeToggleButton();
      
      toggleButton.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  updateThemeToggleButton() {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    const lightIcon = toggleButton.querySelector('.light-icon');
    const darkIcon = toggleButton.querySelector('.dark-icon');
    
    if (this.currentTheme === 'dark') {
      lightIcon?.classList.remove('active');
      darkIcon?.classList.add('active');
      toggleButton.setAttribute('aria-label', '切換到明亮模式');
    } else {
      lightIcon?.classList.add('active');
      darkIcon?.classList.remove('active');
      toggleButton.setAttribute('aria-label', '切換到暗黑模式');
    }
  }

  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // 只有在沒有手動設置主題時才跟隨系統
        if (!localStorage.getItem('gameTheme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // 便捷方法
  isDark() {
    return this.currentTheme === 'dark';
  }

  isLight() {
    return this.currentTheme === 'light';
  }
}

// 全局實例
window.themeManager = new ThemeManager();
