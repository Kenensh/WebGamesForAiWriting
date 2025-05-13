/**
 * Service Worker 設定檔
 * 實現 PWA 功能，緩存資源和離線訪問
 * 版本: 1.0.0
 * 最後更新: 2025-05-13
 */

const CACHE_NAME = "mini-games-v1";
const OFFLINE_URL = "/offline.html";

// 需要緩存的資源清單
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/index.js",
  "/gameUtils.js",
  "/themeManager.js",
  "/achievements.js",
  "/gameStats.js",
  "/touchControls.js",
  "/notification-styles.css",
  "/profile-styles.css",
  "/profile.js",
  "/profile.html",
  "/pwa.js",
  "/manifest.json",
  "/images/placeholder.svg",
  "/offline.html",
  "/guessing-game.html",
  "/snake.html",
  "/tetris.html",
  "/breakout.html",
  "/shooter.html",
  "/tower-defense.html",
  "/2048.html",
  "/gomoku.html",
  "/minesweeper.html",
  "/memory-card.html",
  "/tic-tac-toe.html",
  "/click-speed.html",
  "/sudoku.html",
  "/text-adventure.html",
  "/color-match.html",
  "/piano-tiles.html",
  "/word-scramble.html",
  OFFLINE_URL,
];

// 安裝 Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache opened");
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        // 強制接管當前頁面
        return self.skipWaiting();
      })
  );
});

// 清理舊版緩存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 確保 Service Worker 立即生效
        return self.clients.claim();
      })
  );
});

// 處理請求
self.addEventListener("fetch", (event) => {
  // 跳過不需要緩存的請求
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/") ||
    event.request.url.startsWith("chrome-extension://") ||
    event.request.url.includes("extension")
  ) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 緩存命中，直接返回緩存的資源
      if (response) {
        return response;
      }

      // 緩存未命中，發送網絡請求
      return fetch(event.request)
        .then((response) => {
          // 檢查回應是否有效
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // 克隆回應，因為回應是流，只能消費一次
          const responseToCache = response.clone();

          // 加入緩存
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 網絡請求失敗，處理不同離線情況
          if (event.request.headers.get("accept").includes("text/html")) {
            // 頁面導航請求，返回離線頁面
            return caches.match(OFFLINE_URL);
          } else if (
            event.request.url.includes(".js") ||
            event.request.url.includes(".css") ||
            event.request.url.includes(".json") ||
            event.request.url.includes("image")
          ) {
            // 對於關鍵資源，嘗試提供空響應而不是失敗
            return new Response("", {
              status: 200,
              statusText: "OK",
              headers: new Headers({
                "Content-Type": event.request.url.endsWith(".js")
                  ? "application/javascript"
                  : event.request.url.endsWith(".css")
                  ? "text/css"
                  : event.request.url.endsWith(".json")
                  ? "application/json"
                  : "text/plain",
              }),
            });
          }
        });
    })
  );
});

// 後台同步
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-game-data") {
    event.waitUntil(syncGameData());
  }
});

// 推送通知
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification("網頁小遊戲", {
      body: data.message,
      icon: "/images/icon-192x192.png",
      badge: "/images/badge-72x72.png",
    })
  );
});

// 通知點擊
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientsList) => {
      const hadWindowToFocus = clientsList.some((windowClient) => {
        if (windowClient.url === "/" || windowClient.url === "/index.html") {
          return windowClient.focus();
        }
      });

      if (!hadWindowToFocus) {
        clients.openWindow("/").then((windowClient) => {
          if (windowClient) {
            windowClient.focus();
          }
        });
      }
    })
  );
});

// 同步遊戲數據
function syncGameData() {
  return new Promise((resolve) => {
    // 這裡可以實現與後端同步數據的邏輯
    // 例如將本地存儲的遊戲分數和統計上傳到雲端

    // 由於我們目前沒有後端，所以這只是一個假的實現
    console.log("同步遊戲數據");
    resolve();
  });
}
