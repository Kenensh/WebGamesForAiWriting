/**
 * PWA 功能設定
 * 提供離線訪問和應用程式安裝功能
 * 版本: 1.0.0
 * 最後更新: 2025-05-13
 */

// 如果瀏覽器支援 Service Worker，註冊它
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker 註冊成功, scope: ", registration.scope);

        // 檢查網路狀態
        checkNetworkAndSync();

        // 監聽網路狀態變化
        window.addEventListener("online", checkNetworkAndSync);
        window.addEventListener("offline", notifyOfflineStatus);
      })
      .catch((error) => {
        console.log("ServiceWorker 註冊失敗: ", error);
      });
  });
}

// 檢查網路狀態並同步數據
function checkNetworkAndSync() {
  if (navigator.onLine) {
    // 如果自定義 UI 離線提示存在，則移除它
    const offlineAlert = document.getElementById("offline-alert");
    if (offlineAlert) {
      offlineAlert.classList.remove("show");
      setTimeout(() => {
        offlineAlert.remove();
      }, 300);
    }

    // 如果在線，嘗試同步數據
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register("sync-game-data").catch((err) => {
          console.log("後台同步註冊失敗:", err);
        });
      });
    }
  }
}

// 顯示離線狀態提示
function notifyOfflineStatus() {
  // 避免重複創建提示
  if (document.getElementById("offline-alert")) return;

  const offlineAlert = document.createElement("div");
  offlineAlert.id = "offline-alert";
  offlineAlert.className = "offline-alert";

  offlineAlert.innerHTML = `
    <div class="offline-alert-content">
      <div class="offline-alert-icon">📶</div>
      <div class="offline-alert-text">您已離線，部分功能可能受限</div>
      <button class="offline-alert-close">✕</button>
    </div>
  `;

  document.body.appendChild(offlineAlert);

  // 添加關閉按鈕事件
  offlineAlert
    .querySelector(".offline-alert-close")
    .addEventListener("click", () => {
      offlineAlert.classList.remove("show");
      setTimeout(() => {
        offlineAlert.remove();
      }, 300);
    });

  // 延遲顯示以便添加過渡效果
  setTimeout(() => {
    offlineAlert.classList.add("show");
  }, 10);
}

// 處理 PWA 應用程式安裝
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;

    // 監聽安裝提示事件
    window.addEventListener("beforeinstallprompt", (e) => {
      // 防止 Chrome 67 及更早版本自動顯示安裝提示
      e.preventDefault();
      // 保存事件以便稍後觸發
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // 監聽安裝完成事件
    window.addEventListener("appinstalled", () => {
      // 隱藏安裝按鈕
      this.hideInstallButton();
      // 清除提示
      this.deferredPrompt = null;
      // 記錄安裝事件
      console.log("PWA 已安裝");
    });

    // 初始化
    this.initialize();
  }

  initialize() {
    // 檢查是否已經作為獨立應用程式運行
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      // 已安裝，不顯示安裝按鈕
      return;
    }

    // 創建安裝按鈕（如果尚未存在）
    if (!this.installButton) {
      const button = document.createElement("button");
      button.id = "pwaInstallButton";
      button.className = "pwa-install-button";
      button.innerHTML = "安裝應用";
      button.style.display = "none";

      // 添加點擊事件
      button.addEventListener("click", () => {
        this.installPWA();
      });

      // 添加到頁面
      const headerNav = document.querySelector(".site-nav ul");
      if (headerNav) {
        const li = document.createElement("li");
        li.appendChild(button);
        headerNav.appendChild(li);
      } else {
        document.body.appendChild(button);
      }

      this.installButton = button;
    }
  }

  showInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = "block";
    }
  }

  hideInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = "none";
    }
  }

  async installPWA() {
    if (!this.deferredPrompt) return;

    // 顯示安裝提示
    this.deferredPrompt.prompt();

    // 等待用戶回應提示
    const { outcome } = await this.deferredPrompt.userChoice;

    // 不論結果如何，都不能再次使用該提示
    this.deferredPrompt = null;

    if (outcome === "accepted") {
      console.log("用戶接受安裝 PWA");
    } else {
      console.log("用戶拒絕安裝 PWA");
    }
  }
}

// 創建 PWA 安裝管理器實例
const pwaInstaller = new PWAInstaller();
