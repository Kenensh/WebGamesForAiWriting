/**
 * 遊戲數據統計分析系統
 * 收集和展示所有遊戲的遊玩數據和統計信息
 * 版本: 1.0.0
 * 最後更新: 2025-05-13
 */

class GameStats {
  constructor() {
    this.stats = this.loadStats();
    this.initializeDefaultStats();
  }

  loadStats() {
    const savedStats = localStorage.getItem("gameStats");
    return savedStats
      ? JSON.parse(savedStats)
      : {
          totalGamesPlayed: 0,
          totalPlayTime: 0, // 分鐘
          lastPlayed: null,
          favoriteGame: null,
          gameData: {},
        };
  }

  saveStats() {
    localStorage.setItem("gameStats", JSON.stringify(this.stats));
  }

  initializeDefaultStats() {
    // 檢查是否需要初始化每個遊戲的數據
    const gameIds = [
      "guessing-game",
      "snake",
      "tetris",
      "breakout",
      "shooter",
      "tower-defense",
      "2048",
      "gomoku",
      "minesweeper",
      "memory-card",
      "tic-tac-toe",
      "click-speed",
      "sudoku",
      "text-adventure",
      "color-match",
      "piano-tiles",
      "word-scramble",
    ];

    gameIds.forEach((gameId) => {
      if (!this.stats.gameData[gameId]) {
        this.stats.gameData[gameId] = {
          name: this.getGameName(gameId),
          timesPlayed: 0,
          totalScore: 0,
          highScore: 0,
          averageScore: 0,
          totalPlayTime: 0, // 分鐘
          lastPlayed: null,
        };
      }
    });

    this.saveStats();
  }

  getGameName(gameId) {
    const gameNames = {
      "guessing-game": "終極密碼",
      snake: "貪食蛇",
      tetris: "俄羅斯方塊",
      breakout: "打磚塊",
      shooter: "打飛機",
      "tower-defense": "塔防遊戲",
      2048: "2048",
      gomoku: "五子棋",
      minesweeper: "踩地雷",
      "memory-card": "記憶翻牌",
      "tic-tac-toe": "井字遊戲",
      "click-speed": "點擊速度",
      sudoku: "數獨",
      "text-adventure": "文字冒險",
      "color-match": "顏色配對",
      "piano-tiles": "音樂鋼琴",
      "word-scramble": "單字拼圖",
    };

    return gameNames[gameId] || gameId;
  }

  recordGameStart(gameId) {
    // 獲取遊戲名稱
    const gameName =
      document.querySelector('meta[name="game-name"]')?.content ||
      this.getGameName(gameId);

    // 更新遊戲數據
    if (!this.stats.gameData[gameId]) {
      this.stats.gameData[gameId] = {
        name: gameName,
        timesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        averageScore: 0,
        totalPlayTime: 0,
        lastPlayed: null,
      };
    }

    // 記錄開始時間
    this.gameStartTime = Date.now();

    // 更新遊戲次數
    this.stats.gameData[gameId].timesPlayed++;
    this.stats.gameData[gameId].lastPlayed = new Date().toISOString();

    // 更新總遊戲次數
    this.stats.totalGamesPlayed++;
    this.stats.lastPlayed = new Date().toISOString();

    // 確定最愛的遊戲
    let favoriteGame = null;
    let maxPlayed = 0;

    for (const id in this.stats.gameData) {
      if (this.stats.gameData[id].timesPlayed > maxPlayed) {
        favoriteGame = id;
        maxPlayed = this.stats.gameData[id].timesPlayed;
      }
    }

    this.stats.favoriteGame = favoriteGame;

    // 保存更新
    this.saveStats();
  }

  recordGameEnd(gameId, score) {
    if (!this.gameStartTime || !this.stats.gameData[gameId]) return;

    // 計算遊戲時間（分鐘）
    const playTime = (Date.now() - this.gameStartTime) / 60000;

    // 更新遊戲數據
    const gameData = this.stats.gameData[gameId];
    gameData.totalPlayTime += playTime;

    // 更新分數相關數據
    if (typeof score === "number") {
      gameData.totalScore += score;
      gameData.highScore = Math.max(gameData.highScore, score);
      gameData.averageScore = gameData.totalScore / gameData.timesPlayed;
    }

    // 更新總遊戲時間
    this.stats.totalPlayTime += playTime;

    // 保存更新
    this.saveStats();

    // 重置開始時間
    this.gameStartTime = null;
  }

  // 獲取總遊戲統計
  getTotalStats() {
    return {
      totalGamesPlayed: this.stats.totalGamesPlayed,
      totalPlayTime: Math.round(this.stats.totalPlayTime),
      favoriteGame: this.stats.gameData[this.stats.favoriteGame]?.name || "無",
      lastPlayed: this.stats.lastPlayed
        ? new Date(this.stats.lastPlayed)
        : null,
      gamesCount: Object.keys(this.stats.gameData).length,
    };
  }

  // 獲取特定遊戲的統計數據
  getGameStats(gameId) {
    return this.stats.gameData[gameId] || null;
  }

  // 獲取所有遊戲的統計數據
  getAllGameStats() {
    return this.stats.gameData;
  }

  // 獲取排名最高的遊戲（基於遊玩次數）
  getTopGames(limit = 5) {
    return Object.values(this.stats.gameData)
      .sort((a, b) => b.timesPlayed - a.timesPlayed)
      .slice(0, limit);
  }

  // 獲取最近遊玩的遊戲
  getRecentlyPlayedGames(limit = 5) {
    return Object.values(this.stats.gameData)
      .filter((game) => game.lastPlayed)
      .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
      .slice(0, limit);
  }

  // 渲染統計儀表板
  renderStatsDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalStats = this.getTotalStats();
    const topGames = this.getTopGames(5);
    const recentGames = this.getRecentlyPlayedGames(5);

    let lastPlayedText = "從未遊玩";
    if (totalStats.lastPlayed) {
      lastPlayedText = totalStats.lastPlayed.toLocaleString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    container.innerHTML = `
      <div class="stats-dashboard">
        <div class="stats-overview">
          <div class="stats-card">
            <div class="stats-icon">🎮</div>
            <div class="stats-value">${totalStats.totalGamesPlayed}</div>
            <div class="stats-label">總遊玩次數</div>
          </div>
          
          <div class="stats-card">
            <div class="stats-icon">⏱️</div>
            <div class="stats-value">${totalStats.totalPlayTime}</div>
            <div class="stats-label">遊玩總時間（分鐘）</div>
          </div>
          
          <div class="stats-card">
            <div class="stats-icon">❤️</div>
            <div class="stats-value">${totalStats.favoriteGame}</div>
            <div class="stats-label">最愛的遊戲</div>
          </div>
          
          <div class="stats-card">
            <div class="stats-icon">📅</div>
            <div class="stats-value">${lastPlayedText}</div>
            <div class="stats-label">最後遊玩時間</div>
          </div>
        </div>
        
        <div class="stats-details">
          <div class="stats-section">
            <h3>熱門遊戲排行</h3>
            <div class="stats-table">
              <div class="stats-row header">
                <div class="stats-cell">遊戲名稱</div>
                <div class="stats-cell">遊玩次數</div>
                <div class="stats-cell">最高分</div>
              </div>
              ${topGames
                .map(
                  (game) => `
                <div class="stats-row">
                  <div class="stats-cell">${game.name}</div>
                  <div class="stats-cell">${game.timesPlayed}</div>
                  <div class="stats-cell">${game.highScore}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          
          <div class="stats-section">
            <h3>最近遊玩</h3>
            <div class="stats-table">
              <div class="stats-row header">
                <div class="stats-cell">遊戲名稱</div>
                <div class="stats-cell">遊玩時間</div>
              </div>
              ${recentGames
                .map((game) => {
                  const playDate = new Date(game.lastPlayed).toLocaleString(
                    "zh-TW",
                    {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );
                  return `
                  <div class="stats-row">
                    <div class="stats-cell">${game.name}</div>
                    <div class="stats-cell">${playDate}</div>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// 創建全局遊戲統計實例
const gameStats = new GameStats();
