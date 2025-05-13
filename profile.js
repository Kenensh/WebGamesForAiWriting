/**
 * 個人檔案頁面功能
 * 展示使用者遊戲數據、成就和設定
 * 版本: 1.0.0
 * 最後更新: 2025-05-14
 */

document.addEventListener("DOMContentLoaded", function () {
  // 初始化各個系統
  const themeManager = new ThemeManager();
  const achievementSystem = new AchievementSystem();
  const gameStats = new GameStats();
  const pwaInstaller = new PWAInstaller();

  // 處理 Tab 切換
  setupTabs();

  // 加載頁面數據
  loadStatistics(gameStats);
  loadAchievements(achievementSystem);
  loadSettings(themeManager);

  // 設定頁面的事件監聽器
  setupEventListeners(themeManager, gameStats, achievementSystem);

  // 初始化 URL hash 處理，以便直接連接到特定 tab
  handleUrlHash();
});

// 設置頁籤切換邏輯
function setupTabs() {
  const tabs = document.querySelectorAll(".profile-tab");
  const sections = document.querySelectorAll(".profile-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      // 切換活動頁籤
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // 切換活動區塊
      sections.forEach((section) => {
        section.classList.remove("active");
        if (section.id === targetTab) {
          section.classList.add("active");
          // 更改 URL hash，但不需重新加載頁面
          history.pushState(null, null, `#${targetTab}`);
        }
      });
    });
  });
}

// 處理直接通過 URL hash 訪問特定頁籤
function handleUrlHash() {
  const hash = window.location.hash.substring(1);
  if (hash) {
    const targetTab = document.querySelector(
      `.profile-tab[data-tab="${hash}"]`
    );
    if (targetTab) {
      targetTab.click();
    }
  }
}

// 加載統計數據
function loadStatistics(gameStats) {
  const stats = gameStats.stats;

  // 更新摘要數據
  document.getElementById("total-games-played").textContent =
    stats.totalGamesPlayed;
  document.getElementById("total-play-time").textContent = formatPlayTime(
    stats.totalPlayTime
  );
  document.getElementById("favorite-game").textContent = stats.favoriteGame
    ? gameStats.getGameName(stats.favoriteGame)
    : "-";

  // 填充詳細遊戲統計表格
  const tableBody = document.getElementById("game-stats-body");
  tableBody.innerHTML = "";

  Object.keys(stats.gameData).forEach((gameId) => {
    const game = stats.gameData[gameId];
    if (game.timesPlayed > 0) {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${game.name}</td>
        <td>${game.timesPlayed}</td>
        <td>${game.highScore}</td>
        <td>${game.averageScore.toFixed(1)}</td>
        <td>${formatPlayTime(game.totalPlayTime)}</td>
        <td>${game.lastPlayed ? formatDate(game.lastPlayed) : "-"}</td>
      `;

      tableBody.appendChild(row);
    }
  });

  // 如果沒有遊戲數據，顯示提示
  if (tableBody.children.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="no-data">尚無遊戲數據</td>`;
    tableBody.appendChild(row);
  }
}

// 加載成就數據
function loadAchievements(achievementSystem) {
  const achievements = achievementSystem.achievements;
  const container = document.getElementById("achievement-container");
  container.innerHTML = "";

  // 計算成就解鎖進度
  let totalCount = 0;
  let unlockedCount = 0;

  Object.keys(achievements).forEach((achievementId) => {
    totalCount++;
    if (achievements[achievementId].unlockedAt) {
      unlockedCount++;
    }
  });

  // 更新成就摘要
  document.getElementById("unlocked-count").textContent = unlockedCount;
  document.getElementById("total-count").textContent = totalCount;

  // 計算並設定進度條
  const progressPercent =
    totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  document.getElementById(
    "achievement-progress-bar"
  ).style.width = `${progressPercent}%`;

  // 填充成就列表
  Object.keys(achievements).forEach((id) => {
    const achievement = achievements[id];
    const isUnlocked = achievement.unlockedAt !== null;
    const achievementElement = document.createElement("div");
    achievementElement.className = `achievement-item ${
      isUnlocked ? "unlocked" : "locked"
    }`;
    achievementElement.dataset.category = achievement.category || "general";
    achievementElement.dataset.status = isUnlocked ? "unlocked" : "locked";

    achievementElement.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-details">
        <h3 class="achievement-name">${achievement.name}</h3>
        <p class="achievement-description">${achievement.description}</p>
        ${
          isUnlocked
            ? `<span class="achievement-unlock-date">解鎖於：${formatDate(
                achievement.unlockedAt
              )}</span>`
            : `<span class="achievement-progress">${renderAchievementProgress(
                achievement
              )}</span>`
        }
      </div>
    `;

    container.appendChild(achievementElement);
  });

  // 設置成就篩選器
  setupAchievementFilters();
}

// 渲染成就進度（如果有）
function renderAchievementProgress(achievement) {
  if (
    achievement.progress &&
    Array.isArray(achievement.progress) &&
    achievement.requiredGames
  ) {
    return `進度：${achievement.progress.length} / ${achievement.requiredGames.length}`;
  } else if (
    achievement.totalTime !== undefined &&
    achievement.requiredTime !== undefined
  ) {
    return `進度：${formatPlayTime(achievement.totalTime)} / ${formatPlayTime(
      achievement.requiredTime
    )}`;
  } else if (
    achievement.progress !== undefined &&
    achievement.requiredCount !== undefined
  ) {
    return `進度：${
      Array.isArray(achievement.progress)
        ? achievement.progress.length
        : achievement.progress
    } / ${achievement.requiredCount}`;
  }

  return "";
}

// 設置成就篩選器
function setupAchievementFilters() {
  const filters = document.querySelectorAll(".achievement-filter");
  const achievements = document.querySelectorAll(".achievement-item");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      // 切換活動篩選器
      filters.forEach((f) => f.classList.remove("active"));
      filter.classList.add("active");

      const filterType = filter.dataset.filter;

      // 根據篩選類型顯示/隱藏成就
      achievements.forEach((item) => {
        const category = item.dataset.category;
        const status = item.dataset.status;

        if (
          filterType === "all" ||
          (filterType === "general" && category === "general") ||
          (filterType === "game-specific" && category !== "general") ||
          (filterType === "unlocked" && status === "unlocked") ||
          (filterType === "locked" && status === "locked")
        ) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  });
}

// 加載設定
function loadSettings(themeManager) {
  // 設置主題選擇器
  const themeSelect = document.getElementById("theme-select");

  // 根據當前值設置
  if (localStorage.getItem("themePreference") === "light") {
    themeSelect.value = "light";
  } else if (localStorage.getItem("themePreference") === "dark") {
    themeSelect.value = "dark";
  } else {
    themeSelect.value = "auto";
  }

  // 設置觸控控制開關
  const touchControlsToggle = document.getElementById("touch-controls-toggle");
  touchControlsToggle.checked =
    localStorage.getItem("touchControlsEnabled") !== "false";

  // 設置觸控靈敏度
  const touchSensitivity = document.getElementById("touch-sensitivity");
  const sensitivityValue = localStorage.getItem("touchSensitivity") || 5;
  touchSensitivity.value = sensitivityValue;
  document.getElementById("sensitivity-value").textContent = sensitivityValue;

  // 設置離線模式開關
  const offlineToggle = document.getElementById("offline-toggle");
  offlineToggle.checked = localStorage.getItem("offlineEnabled") !== "false";
}

// 設置設定相關的事件監聽器
function setupEventListeners(themeManager, gameStats, achievementSystem) {
  // 主題切換
  const themeSelect = document.getElementById("theme-select");
  themeSelect.addEventListener("change", () => {
    if (themeSelect.value === "light") {
      themeManager.setTheme("light");
      localStorage.setItem("themePreference", "light");
    } else if (themeSelect.value === "dark") {
      themeManager.setTheme("dark");
      localStorage.setItem("themePreference", "dark");
    } else {
      themeManager.setThemeBySystemPreference();
      localStorage.removeItem("themePreference");
    }
  });

  // 觸控控制開關
  const touchControlsToggle = document.getElementById("touch-controls-toggle");
  touchControlsToggle.addEventListener("change", () => {
    localStorage.setItem("touchControlsEnabled", touchControlsToggle.checked);
  });

  // 觸控靈敏度
  const touchSensitivity = document.getElementById("touch-sensitivity");
  touchSensitivity.addEventListener("input", () => {
    const value = touchSensitivity.value;
    document.getElementById("sensitivity-value").textContent = value;
    localStorage.setItem("touchSensitivity", value);
  });

  // 離線模式開關
  const offlineToggle = document.getElementById("offline-toggle");
  offlineToggle.addEventListener("change", () => {
    localStorage.setItem("offlineEnabled", offlineToggle.checked);
  });

  // 資料管理按鈕
  document
    .getElementById("export-data")
    .addEventListener("click", () =>
      exportUserData(gameStats, achievementSystem)
    );
  document
    .getElementById("import-data")
    .addEventListener("click", () =>
      importUserData(gameStats, achievementSystem)
    );
  document
    .getElementById("reset-data")
    .addEventListener("click", () =>
      resetUserData(gameStats, achievementSystem)
    );
}

// 匯出用戶數據
function exportUserData(gameStats, achievementSystem) {
  const exportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    gameStats: gameStats.stats,
    achievements: achievementSystem.achievements,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "minigames-userdata.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

// 匯入用戶數據
function importUserData(gameStats, achievementSystem) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // 驗證數據格式
        if (data.gameStats && data.achievements && data.version) {
          // 更新數據
          localStorage.setItem("gameStats", JSON.stringify(data.gameStats));
          localStorage.setItem(
            "achievements",
            JSON.stringify(data.achievements)
          );

          // 重新加載頁面以更新顯示
          alert("數據匯入成功！頁面將重新載入。");
          location.reload();
        } else {
          alert("無效的數據格式！請確保檔案包含有效的遊戲數據。");
        }
      } catch (error) {
        alert("讀取檔案時發生錯誤：" + error.message);
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// 重置用戶數據
function resetUserData(gameStats, achievementSystem) {
  if (
    confirm(
      "確定要重置所有遊戲數據嗎？這將清除您的所有成就和統計數據，且無法恢復。"
    )
  ) {
    // 清除數據
    localStorage.removeItem("gameStats");
    localStorage.removeItem("achievements");

    // 重新加載頁面以更新顯示
    alert("所有數據已重置！頁面將重新載入。");
    location.reload();
  }
}

// 時間格式化函數
function formatPlayTime(minutes) {
  if (minutes < 60) {
    return `${minutes} 分鐘`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} 小時`;
    } else {
      return `${hours} 小時 ${remainingMinutes} 分鐘`;
    }
  }
}

// 日期格式化函數
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
