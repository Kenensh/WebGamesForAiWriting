/**
 * 主題切換系統
 * 提供明亮/暗黑主題切換功能
 * 版本: 1.0.0
 * 最後更新: 2025-05-13
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

    this.themes = {
      light: {
        "--background-color": "#f8f9fa",
        "--text-color": "#212529",
        "--primary-color": "#007bff",
        "--primary-hover": "#0056b3",
        "--secondary-color": "#6c757d",
        "--card-background": "#ffffff",
        "--card-shadow": "0 4px 6px rgba(0, 0, 0, 0.1)",
        "--header-background": "#ffffff",
        "--footer-background": "#f1f3f5",
        "--border-color": "#dee2e6",
        "--input-background": "#ffffff",
        "--button-text": "#ffffff",
        "--game-container-bg": "#ffffff",
        "--modal-background": "rgba(0, 0, 0, 0.7)",
      },
      dark: {
        "--background-color": "#121212",
        "--text-color": "#e0e0e0",
        "--primary-color": "#0d6efd",
        "--primary-hover": "#0b5ed7",
        "--secondary-color": "#adb5bd",
        "--card-background": "#1e1e1e",
        "--card-shadow": "0 4px 6px rgba(0, 0, 0, 0.3)",
        "--header-background": "#1e1e1e",
        "--footer-background": "#1e1e1e",
        "--border-color": "#2d2d2d",
        "--input-background": "#2d2d2d",
        "--button-text": "#ffffff",
        "--game-container-bg": "#1e1e1e",
        "--modal-background": "rgba(0, 0, 0, 0.85)",
      },
    };

    this.initialize();
  }

  initialize() {
    // 設定初始主題
    this.applyTheme(this.currentTheme);

    // 創建切換按鈕
    this.createThemeToggle();

    // 監聽系統主題變更
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          // 只在未手動設定主題時跟隨系統
          if (!localStorage.getItem("gameThemeManual")) {
            this.systemPrefersDark = e.matches;
            this.currentTheme = this.systemPrefersDark ? "dark" : "light";
            this.applyTheme(this.currentTheme);
            this.updateToggleButton();
          }
        });
    }
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName] || this.themes["light"];
    const root = document.documentElement;

    // 設置 CSS 變量
    for (const [property, value] of Object.entries(theme)) {
      root.style.setProperty(property, value);
    }

    // 更新 body 類別
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${themeName}`);

    // 保存主題設置
    localStorage.setItem("gameTheme", themeName);
    this.currentTheme = themeName;
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);

    // 標記為手動設定，避免跟隨系統偏好變更
    localStorage.setItem("gameThemeManual", "true");

    this.updateToggleButton();
    return newTheme;
  }

  createThemeToggle() {
    // 檢查是否已存在
    let themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) {
      // 創建切換按鈕
      themeToggle = document.createElement("button");
      themeToggle.id = "themeToggle";
      themeToggle.className = "theme-toggle";
      this.updateToggleButtonContent(themeToggle);

      themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });

      // 位置：在網站頁首右側
      const headerNav = document.querySelector(".site-nav ul");

      if (headerNav) {
        const li = document.createElement("li");
        li.appendChild(themeToggle);
        headerNav.appendChild(li);
      } else {
        // 如果沒有導航，放在頂部
        document.body.insertBefore(themeToggle, document.body.firstChild);
      }
    }
  }

  updateToggleButton() {
    const button = document.getElementById("themeToggle");
    if (button) {
      this.updateToggleButtonContent(button);
    }
  }

  updateToggleButtonContent(button) {
    button.innerHTML =
      this.currentTheme === "light" ? "<span>🌙</span>" : "<span>☀️</span>";

    button.setAttribute(
      "aria-label",
      this.currentTheme === "light" ? "切換到深色模式" : "切換到淺色模式"
    );
  }

  // 獲取當前主題
  getCurrentTheme() {
    return this.currentTheme;
  }
}

// 創建全局主題管理實例
const themeManager = new ThemeManager();
