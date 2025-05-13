/**
 * 網頁小遊戲合集 - 首頁
 * 負責處理首頁交互和遊戲卡片的動態效果
 */

// 等待 DOM 完全加載
document.addEventListener("DOMContentLoaded", () => {
  // 初始化遊戲卡片
  initGameCards();

  // 為導航連結添加平滑滾動效果
  initSmoothScrolling();

  // 創建遊戲說明模態框
  createAboutModal();

  // 為遊戲卡片添加隨機背景色
  setRandomCardColors();

  // 檢查本地存儲，顯示遊戲最高分數
  displayHighScores();
});

// 初始化遊戲卡片
function initGameCards() {
  const cards = document.querySelectorAll(".game-card");

  cards.forEach((card) => {
    // 添加懸停效果
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px)";
      card.style.boxShadow = "0 15px 20px rgba(0, 0, 0, 0.2)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    });

    // 添加點擊效果
    card.addEventListener("click", (e) => {
      const link = card.querySelector(".game-card-button");
      if (e.target !== link) {
        // 如果點擊的不是按鈕本身，我們也觸發按鈕點擊
        link.click();
      }
    });
  });
}

// 為遊戲卡片添加隨機背景色
function setRandomCardColors() {
  // 定義各種遊戲的主題色
  const gameColors = {
    "guessing-game": "#4CAF50",
    snake: "#2196F3",
    "tic-tac-toe": "#FF5722",
    "click-speed": "#9C27B0",
    sudoku: "#3F51B5",
    "text-adventure": "#FFC107",
    "color-match": "#00BCD4",
    "piano-tiles": "#E91E63",
    "word-scramble": "#FF9800",
    tetris: "#795548",
    2048: "#009688",
    gomoku: "#673AB7",
    minesweeper: "#607D8B",
    breakout: "#8BC34A",
    shooting: "#F44336",
  };

  const images = document.querySelectorAll(".game-card-image");

  images.forEach((img) => {
    const gameType = img.querySelector("img").getAttribute("data-game");
    const color = gameColors[gameType] || "#607D8B"; // 預設顏色

    // 設置漸變背景
    img.style.background = `linear-gradient(135deg, ${color}, ${lightenColor(
      color,
      20
    )})`;

    // 添加遊戲圖示
    addGameIcon(img, gameType);
  });
}

// 添加遊戲圖示
function addGameIcon(container, gameType) {
  // 創建SVG圖示 (簡單版本)
  const iconContent = getGameIconSVG(gameType);
  container.innerHTML += iconContent;
}

// 獲取遊戲SVG圖示
function getGameIconSVG(gameType) {
  const iconSize = 64;
  const icons = {
    "guessing-game": `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>`,
    snake: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M20 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0zM6.34 17.66a8 8 0 0 1 0-11.32l9.9 9.9a8 8 0 0 1-9.9 1.42zM7 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"/></svg>`,
    "tic-tac-toe": `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm2 2h2v2H5zm10-2h6v6h-6zm2 2h2v2h-2zM11 3h2v18h-2z"/><path d="M3 11h18v2H3z"/></svg>`,
    "click-speed": `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M15 1H9v2h6V1zm-6 13h1.5v1.5H9V14zm0-4.5h1.5V11H9V9.5zm3 6h1.5V17H12v-1.5zm0-3h1.5V14H12v-1.5zm0-3h1.5V11H12V9.5zm0-3h1.5V8H12V6.5zm3 6h1.5V14H15v-1.5zm0-3h1.5V11H15V9.5zm0-3h1.5V8H15V6.5zm0-3h1.5V5H15V3.5zm-9 9h1.5V14H6v-1.5zm0-3h1.5V11H6V9.5zm0-3h1.5V8H6V6.5zm0-3h1.5V5H6V3.5zm12 12h-9v6h9v-6zm-10 1H7v4H8v-4z"/></svg>`,
    sudoku: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 2v4h4V5H5m6 0v4h4V5h-4m6 0v4h4V5h-4m-12 6v4h4v-4H5m6 0v4h4v-4h-4m6 0v4h4v-4h-4m-12 6v4h4v-4H5m6 0v4h4v-4h-4m6 0v4h4v-4h-4z"/></svg>`,
    "text-adventure": `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M13 18l-.4-.42L7.75 13h-5v-2h5L13 6.42l.41-.41.9.9-4.21 4.1 4.2 4.1-.9.9M19 6h-8v2h8v-2m0 10h-8v2h8v-2m0-5h-8v2h8v-2z"/></svg>`,
    "color-match": `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zM7.83 14c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 2.87.43-.02.79.32.79.75 0 .4-.32.73-.72.75-2.13.13-4.62-1.09-5.19-4.12a.75.75 0 01.74-.87z"/></svg>`,
    "piano-tiles": `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M4 3h2v12H4zm14 0h2v12h-2zm-7 0h2v12h-2zm-3.5 0h2v12h-2zm7 0h2v12h-2z"/><path d="M0 15h24v3H0zm0 3h24v3H0z"/></svg>`,
    "word-scramble": `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M3 17h18v-2H3v2zm0-5h18v-2H3v2zm0-5h18V5H3v2z"/><path d="M5 21h14q.825 0 1.413-.588Q21 19.825 21 19v-6l-3-3V4q0-.825-.588-1.413Q16.825 2 16 2H8q-.825 0-1.413.588Q6 3.175 6 4v6l-3 3v6q0 .825.588 1.413Q4.175 21 5 21zM8 4h8v4.85L16.15 8H7.85L8 8.85V4zm-2 7h12v8H6v-8z"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>`,
    tetris: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M2 2h8v8H2zm12 0h8v8h-8zM2 14h8v8H2zm12 0h8v8h-8z"/></svg>`,
    2048: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>`,
    gomoku: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/></svg>`,
    minesweeper: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M22 13v-2h-2.03A8.93 8.93 0 0019 8.2V5H5v3.2a8.93 8.93 0 00-.97 2.8H2v2h2.03c.15.97.46 1.89.97 2.71V19h14v-3.09a8.93 8.93 0 00.97-2.71H22m-5-9l1-2h-6l1 2h4M7 10a1 1 0 111-1 1 1 0 01-1 1m5 0a1 1 0 111-1 1 1 0 01-1 1m5 0a1 1 0 111-1 1 1 0 01-1 1m-9.5 6a1 1 0 111-1 1 1 0 01-1 1m4.5 0a1 1 0 111-1 1 1 0 01-1 1m4.5 0a1 1 0 111-1 1 1 0 01-1 1z"/></svg>`,
    breakout: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M4 5h16v3H4zm0 5h16v3H4zm0 5h16v3H4zM3 21h18v-1H3v1z"/></svg>`,
    shooting: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31c-1.35 1.06-3.05 1.69-4.9 1.69zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg>`,
  };

  return icons[gameType] || "";
}

// 創建遊戲說明模態框
function createAboutModal() {
  const modalContent = `
    <p>歡迎來到網頁小遊戲合集！這裡有多款由純 JavaScript 開發的經典小遊戲：</p>
    <ul style="margin-left: 20px; margin-top: 10px;">
      <li><strong>終極密碼</strong>：猜數字遊戲，系統會隨機產生一個數字，玩家需要在有限次數內猜出這個數字</li>
      <li><strong>貪食蛇</strong>：經典的貪食蛇遊戲，使用方向鍵控制蛇移動吃食物</li>
      <li><strong>井字遊戲</strong>：經典的雙人井字棋遊戲，輪流在九宮格中放置X或O</li>
      <li><strong>點擊速度</strong>：測試你的點擊速度，在限定時間內盡可能多地點擊按鈕</li>
      <li><strong>數獨</strong>：邏輯數字遊戲，填寫9x9的格子使每行、每列和每個3x3宮格都包含1-9的數字</li>
      <li><strong>文字冒險</strong>：互動式文字遊戲，根據劇情選擇不同的選項來推進故事</li>
      <li><strong>顏色配對</strong>：記憶和匹配遊戲，找出所有顏色相同的卡片對</li>
      <li><strong>音樂鋼琴</strong>：點擊落下的黑色方塊以演奏音樂</li>
      <li><strong>單字拼圖</strong>：將打亂的字母重新排列組成單詞的益智遊戲</li>
      <li><strong>俄羅斯方塊</strong>：經典的俄羅斯方塊遊戲，旋轉和移動方塊以完成行</li>
      <li><strong>2048</strong>：滑動數字合併相同的數值，目標是得到2048的方塊</li>
      <li><strong>五子棋</strong>：策略性棋盤遊戲，先連成五個棋子的玩家獲勝</li>
      <li><strong>踩地雷</strong>：邏輯遊戲，避開隱藏的地雷，根據數字線索找出安全區域</li>
      <li><strong>打磚塊</strong>：控制底部平台反彈小球，擊破上方所有磚塊</li>
      <li><strong>射擊遊戲</strong>：太空射擊遊戲，控制飛船躲避敵人攻擊並射擊敵方飛船</li>
    </ul>
    <p style="margin-top: 10px;">每個遊戲都有：</p>
    <ul style="margin-left: 20px;">
      <li>遊戲說明</li>
      <li>分數統計</li>
      <li>暫停功能</li>
      <li>重新開始按鈕</li>
      <li>返回首頁選項</li>
    </ul>
    <p style="margin-top: 10px;">點擊任何遊戲卡片開始遊玩吧！</p>
  `;

  const aboutModal = new window.GameUtils.Modal(
    "aboutModal",
    "關於遊戲合集",
    modalContent
  );

  // 添加查看關於按鈕事件
  const aboutLink = document.querySelector('a[href="#about"]');
  if (aboutLink) {
    aboutLink.addEventListener("click", (e) => {
      e.preventDefault();
      aboutModal.show();
    });
  }
}

// 為導航連結添加平滑滾動效果
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll(".site-nav a");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      if (targetId === "#about") {
        // 特殊情況：#about 連結顯示模態框
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // 減去頂部導航條的高度
          behavior: "smooth",
        });
      }
    });
  });
}

// 顯示遊戲最高分數
function displayHighScores() {
  const games = [
    "guessing-game",
    "snake",
    "tic-tac-toe",
    "click-speed",
    "sudoku",
    "text-adventure",
    "color-match",
    "piano-tiles",
    "word-scramble",
    "tetris",
    "2048",
    "gomoku",
    "minesweeper",
    "breakout",
    "shooting",
  ];
  const cards = document.querySelectorAll(".game-card");

  games.forEach((game, index) => {
    if (cards[index]) {
      const highScore = localStorage.getItem(`highScore_${game}`);

      if (highScore) {
        // 如果有最高分，在卡片上添加最高分顯示
        const content = cards[index].querySelector(".game-card-content");
        const scorePara = document.createElement("p");
        scorePara.className = "high-score";
        scorePara.style.fontSize = "0.9rem";
        scorePara.style.color = "#ff5722";
        scorePara.style.fontWeight = "bold";
        scorePara.style.marginBottom = "10px";
        scorePara.textContent = `最高分: ${highScore}`;

        // 插入到描述後，按鈕前
        const description = content.querySelector(".game-card-description");
        description.after(scorePara);
      }
    }
  });
}

// 輔助函數 - 調亮顏色
function lightenColor(hex, percent) {
  // 從十六進制轉換為RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // 調亮
  r = Math.min(255, Math.floor(r * (1 + percent / 100)));
  g = Math.min(255, Math.floor(g * (1 + percent / 100)));
  b = Math.min(255, Math.floor(b * (1 + percent / 100)));

  // 轉回十六進制
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
