/**
 * 離線頁面功能
 * 處理離線頁面的遊戲顯示和網絡狀態檢測
 * 版本: 1.0.0
 * 最後更新: 2025-05-14
 */

class OfflineManager {
  constructor() {
    this.gameListContainer = document.getElementById("offline-game-list");
    this.retryButton = document.getElementById("retry-connection");

    // 初始化主題
    this.themeManager = new ThemeManager();

    // 設置網絡狀態監聽器
    this.setupNetworkListeners();

    // 設置按鈕點擊事件
    this.setupButtonEvents();

    // 載入可用遊戲
    this.loadAvailableGames();
  }

  // 設置網絡狀態監聽器
  setupNetworkListeners() {
    // 當網絡恢復時自動刷新頁面
    window.addEventListener("online", this.handleNetworkOnline.bind(this));

    // 檢查初始網絡狀態
    this.checkInitialNetworkStatus();
  }

  // 處理恢復在線狀態
  handleNetworkOnline() {
    // 顯示通知
    const onlineNotification = document.createElement("div");
    onlineNotification.className = "online-notification";
    onlineNotification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">🌐</div>
        <div class="notification-text">網絡連接已恢復！</div>
      </div>
    `;

    document.body.appendChild(onlineNotification);

    // 顯示動畫
    setTimeout(() => {
      onlineNotification.classList.add("show");
    }, 10);

    // 3秒後重定向回主頁
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  }

  // 檢查初始網絡狀態
  checkInitialNetworkStatus() {
    // 如果已經在線，提示用戶可以返回主頁
    if (navigator.onLine) {
      const offlineTitle = document.querySelector(".offline-title");
      const offlineMessage = document.querySelector(".offline-message");

      if (offlineTitle) {
        offlineTitle.textContent = "您目前可以訪問網絡";
      }

      if (offlineMessage) {
        offlineMessage.textContent =
          "看起來您的網絡連接正常工作。您可以返回主頁繼續瀏覽所有遊戲和功能。";
      }
    }
  }

  // 設置按鈕點擊事件
  setupButtonEvents() {
    if (this.retryButton) {
      this.retryButton.addEventListener("click", () => {
        // 顯示加載指示器
        this.retryButton.disabled = true;
        this.retryButton.textContent = "正在檢查連接...";

        // 嘗試加載主頁
        fetch("index.html", { method: "HEAD" })
          .then((response) => {
            if (response.ok) {
              window.location.href = "index.html";
            } else {
              throw new Error("無法連接到主頁");
            }
          })
          .catch((error) => {
            console.log("連接測試失敗:", error);
            this.retryButton.disabled = false;
            this.retryButton.textContent = "重試連接";

            // 顯示錯誤通知
            const errorNotification = document.createElement("div");
            errorNotification.className = "error-notification";
            errorNotification.textContent = "仍然無法連接，請稍後再試";

            document
              .querySelector(".offline-actions")
              .appendChild(errorNotification);

            // 2秒後移除通知
            setTimeout(() => {
              errorNotification.remove();
            }, 2000);
          });
      });
    }
  }

  // 載入可用的離線遊戲
  loadAvailableGames() {
    if (!this.gameListContainer) return;

    // 檢查Service Worker緩存的遊戲列表
    if ("caches" in window) {
      caches.open("mini-games-v1").then((cache) => {
        cache.keys().then((keys) => {
          // 過濾出HTML遊戲文件
          const gameFiles = keys
            .map((request) => request.url)
            .filter(
              (url) =>
                url.endsWith(".html") &&
                !url.includes("index.html") &&
                !url.includes("offline.html") &&
                !url.includes("profile.html")
            );

          // 如果沒有找到遊戲，顯示提示
          if (gameFiles.length === 0) {
            this.gameListContainer.innerHTML =
              '<div class="no-games">找不到可用的離線遊戲</div>';
            return;
          }

          // 清空容器
          this.gameListContainer.innerHTML = "";

          // 遍歷找到的遊戲文件
          gameFiles.forEach((gameUrl) => {
            // 從URL提取遊戲名稱
            const gameFile = gameUrl.substring(gameUrl.lastIndexOf("/") + 1);
            const gameId = gameFile.replace(".html", "");

            // 創建遊戲卡片
            const gameCard = document.createElement("div");
            gameCard.className = "offline-game-card";

            // 獲取遊戲顯示名稱
            const gameName = this.getGameDisplayName(gameId);

            gameCard.innerHTML = `
              <div class="offline-game-title">${gameName}</div>
              <a href="${gameFile}" class="offline-game-button">開始遊戲</a>
            `;

            this.gameListContainer.appendChild(gameCard);
          });
        });
      });
    } else {
      // 瀏覽器不支持Cache API
      this.gameListContainer.innerHTML =
        '<div class="no-games">您的瀏覽器不支持離線功能</div>';
    }
  }

  // 獲取遊戲顯示名稱
  getGameDisplayName(gameId) {
    const gameNames = {
      tetris: "俄羅斯方塊",
      2048: "2048",
      snake: "貪食蛇",
      breakout: "打磚塊",
      minesweeper: "踩地雷",
      gomoku: "五子棋",
      "memory-card": "記憶翻牌",
      "tic-tac-toe": "井字遊戲",
      "guessing-game": "終極密碼",
      shooter: "太空射擊",
      "tower-defense": "塔防遊戲",
    };

    return gameNames[gameId] || gameId;
  }
}

// 當DOM加載完成後初始化
document.addEventListener("DOMContentLoaded", () => {
  new OfflineManager();
});
