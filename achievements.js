/**
 * 成就系統
 * 實現跨遊戲成就獎勵機制
 * 版本: 1.0.0
 * 最後更新: 2025-05-13
 */

class AchievementSystem {
  constructor() {
    this.achievements = {
      // 通用成就
      first_game: {
        id: "first_game",
        name: "初次體驗",
        description: "首次遊玩任何遊戲",
        icon: "🎮",
        unlockedAt: null,
        category: "general",
      },
      game_master: {
        id: "game_master",
        name: "遊戲大師",
        description: "遊玩所有遊戲至少一次",
        icon: "👑",
        unlockedAt: null,
        requiredGames: [
          "guessing-game",
          "snake",
          "tetris",
          "breakout",
          "shooter",
          "tower-defense",
          "2048",
          "gomoku",
          "minesweeper",
          "tic-tac-toe",
          "click-speed",
          "sudoku",
          "text-adventure",
          "color-match",
          "piano-tiles",
          "word-scramble",
        ],
        progress: [],
        category: "general",
      },
      high_score_king: {
        id: "high_score_king",
        name: "高分王者",
        description: "在5個不同的遊戲中達到較高分數",
        icon: "🏆",
        unlockedAt: null,
        requiredCount: 5,
        progress: [],
        category: "general",
      },
      persistent_player: {
        id: "persistent_player",
        name: "執著玩家",
        description: "總遊戲時間超過1小時",
        icon: "⏰",
        unlockedAt: null,
        totalTime: 0,
        category: "general",
      },

      // 特定遊戲成就
      snake_50: {
        id: "snake_50",
        name: "貪吃蛇大師",
        description: "在貪吃蛇遊戲中得分超過50分",
        icon: "🐍",
        unlockedAt: null,
        gameId: "snake",
        category: "game-specific",
      },
      tetris_1000: {
        id: "tetris_1000",
        name: "俄羅斯方塊專家",
        description: "在俄羅斯方塊遊戲中得分超過1000分",
        icon: "🧱",
        unlockedAt: null,
        gameId: "tetris",
        category: "game-specific",
      },
      "2048_reached": {
        id: "2048_reached",
        name: "2048達人",
        description: "在2048遊戲中成功合成2048方塊",
        icon: "🔢",
        unlockedAt: null,
        gameId: "2048",
        category: "game-specific",
      },
      word_master: {
        id: "word_master",
        name: "文字達人",
        description: "在單字拼圖中完成10個單字",
        icon: "📝",
        unlockedAt: null,
        gameId: "word-scramble",
        requiredCount: 10,
        progress: 0,
        category: "game-specific",
      },
      fast_clicker: {
        id: "fast_clicker",
        name: "急速點擊",
        description: "在點擊速度遊戲中達到每秒8次點擊",
        icon: "👆",
        unlockedAt: null,
        gameId: "click-speed",
        category: "game-specific",
      },
      sudoku_master: {
        id: "sudoku_master",
        name: "數獨大師",
        description: "完成5次數獨遊戲",
        icon: "🧩",
        unlockedAt: null,
        gameId: "sudoku",
        requiredCount: 5,
        progress: 0,
        category: "game-specific",
      },
      gomoku_win_streak: {
        id: "gomoku_win_streak",
        name: "五子連勝",
        description: "在五子棋遊戲中連續勝利3次",
        icon: "⭕",
        unlockedAt: null,
        gameId: "gomoku",
        requiredCount: 3,
        progress: 0,
        category: "game-specific",
      },
      memory_king: {
        id: "memory_king",
        name: "記憶王者",
        description: "在顏色配對遊戲中以最少嘗試次數完成遊戲",
        icon: "🎨",
        unlockedAt: null,
        gameId: "color-match",
        category: "game-specific",
      },
    };

    this.loadAchievements();
    this.setupFirstGameCheck();
  }

  // 載入已解鎖成就
  loadAchievements() {
    const savedAchievements = localStorage.getItem("gameAchievements");
    if (savedAchievements) {
      const parsedAchievements = JSON.parse(savedAchievements);

      // 合併已儲存的成就資料到當前成就定義中
      for (const id in parsedAchievements) {
        if (this.achievements[id]) {
          this.achievements[id] = {
            ...this.achievements[id],
            ...parsedAchievements[id],
          };
        }
      }
    }
  }

  // 儲存成就狀態
  saveAchievements() {
    localStorage.setItem("gameAchievements", JSON.stringify(this.achievements));
  }

  // 解鎖成就
  unlockAchievement(id) {
    if (this.achievements[id] && !this.achievements[id].unlockedAt) {
      this.achievements[id].unlockedAt = Date.now();
      this.saveAchievements();
      this.showAchievementNotification(this.achievements[id]);
      return true;
    }
    return false;
  }

  // 更新成就進度
  updateProgress(id, value) {
    if (!this.achievements[id] || this.achievements[id].unlockedAt)
      return false;

    if (this.achievements[id].requiredCount) {
      // 如果是計數型成就
      if (Array.isArray(this.achievements[id].progress)) {
        // 如果是追蹤多個項目的進度（例如遊戲大師）
        if (!this.achievements[id].progress.includes(value)) {
          this.achievements[id].progress.push(value);

          if (
            this.achievements[id].progress.length >=
            this.achievements[id].requiredCount
          ) {
            this.unlockAchievement(id);
          } else {
            this.saveAchievements();
          }
        }
      } else {
        // 如果是簡單計數
        this.achievements[id].progress += value;

        if (
          this.achievements[id].progress >= this.achievements[id].requiredCount
        ) {
          this.unlockAchievement(id);
        } else {
          this.saveAchievements();
        }
      }
      return true;
    }

    return false;
  }

  // 檢查是否達成特定遊戲成就
  checkGameAchievement(gameId, score) {
    // 遊戲特定成就檢查
    switch (gameId) {
      case "snake":
        if (score >= 50) this.unlockAchievement("snake_50");
        break;
      case "tetris":
        if (score >= 1000) this.unlockAchievement("tetris_1000");
        break;
      case "click-speed":
        if (score >= 8) this.unlockAchievement("fast_clicker");
        break;
      // 其他遊戲成就檢查...
    }

    // 記錄這個遊戲被遊玩
    this.updateProgress("game_master", gameId);

    // 增加遊戲時間
    this.trackPlayTime(5); // 假設增加5分鐘遊戲時間
  }

  // 追蹤遊戲時間
  trackPlayTime(minutes) {
    const totalTime = this.achievements["persistent_player"].totalTime || 0;
    this.achievements["persistent_player"].totalTime = totalTime + minutes;

    // 檢查是否達到1小時
    if (
      this.achievements["persistent_player"].totalTime >= 60 &&
      !this.achievements["persistent_player"].unlockedAt
    ) {
      this.unlockAchievement("persistent_player");
    } else {
      this.saveAchievements();
    }
  }

  // 設置首次遊戲檢查
  setupFirstGameCheck() {
    if (!this.achievements["first_game"].unlockedAt) {
      // 在遊戲開始時解鎖"初次體驗"成就
      this.unlockAchievement("first_game");
    }
  }

  // 顯示成就解鎖通知
  showAchievementNotification(achievement) {
    // 創建通知元素
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">成就解鎖！</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
      </div>
    `;

    // 添加到頁面
    document.body.appendChild(notification);

    // 添加動畫類別
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // 幾秒後隱藏通知
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 5000);
  }

  // 獲取所有已解鎖成就
  getUnlockedAchievements() {
    return Object.values(this.achievements).filter(
      (achievement) => achievement.unlockedAt !== null
    );
  }

  // 獲取所有成就
  getAllAchievements() {
    return Object.values(this.achievements);
  }

  // 獲取特定類別的成就
  getAchievementsByCategory(category) {
    return Object.values(this.achievements).filter(
      (achievement) => achievement.category === category
    );
  }

  // 渲染成就面板
  renderAchievementsPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 依照類別分組成就
    const categories = {
      general: {
        title: "通用成就",
        achievements: this.getAchievementsByCategory("general"),
      },
      "game-specific": {
        title: "遊戲特定成就",
        achievements: this.getAchievementsByCategory("game-specific"),
      },
    };

    // 清空容器
    container.innerHTML = "";

    // 為每個類別創建區段
    for (const key in categories) {
      const categoryData = categories[key];

      // 創建類別標題
      const categoryTitle = document.createElement("h3");
      categoryTitle.textContent = categoryData.title;
      container.appendChild(categoryTitle);

      // 創建成就列表
      const achievementsList = document.createElement("div");
      achievementsList.className = "achievements-list";

      // 添加每個成就
      categoryData.achievements.forEach((achievement) => {
        const achievementItem = document.createElement("div");
        achievementItem.className = `achievement-item ${
          achievement.unlockedAt ? "unlocked" : "locked"
        }`;

        // 計算進度顯示
        let progressDisplay = "";
        if (!achievement.unlockedAt && achievement.requiredCount) {
          const progress = Array.isArray(achievement.progress)
            ? achievement.progress.length
            : achievement.progress;
          const total = achievement.requiredCount;
          progressDisplay = `<div class="achievement-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(
                100,
                (progress / total) * 100
              )}%"></div>
            </div>
            <div class="progress-text">${progress}/${total}</div>
          </div>`;
        }

        achievementItem.innerHTML = `
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-details">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${
              achievement.description
            }</div>
            ${progressDisplay}
          </div>
          <div class="achievement-status">${
            achievement.unlockedAt ? "✓" : "🔒"
          }</div>
        `;

        achievementsList.appendChild(achievementItem);
      });

      container.appendChild(achievementsList);
    }
  }
}

// 創建全局成就系統實例
const achievementSystem = new AchievementSystem();
