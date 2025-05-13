/**
 * 移動設備觸控和手勢控制模塊
 * 為遊戲提供觸控屏幕支持
 * 版本: 1.0.0
 * 最後更新: 2025-05-13
 */

class TouchControls {
  constructor(options = {}) {
    this.options = {
      swipeThreshold: 50, // 滑動需要超過的最小距離
      longPressThreshold: 500, // 長按需要的最小時間(毫秒)
      doubleTapThreshold: 300, // 雙擊間的最大間隔時間(毫秒)
      ...options,
    };

    this.element = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.touchStartTime = 0;
    this.lastTapTime = 0;
    this.isLongPressing = false;
    this.longPressTimer = null;

    // 回調函數
    this.callbacks = {
      tap: null,
      doubleTap: null,
      longPress: null,
      swipeLeft: null,
      swipeRight: null,
      swipeUp: null,
      swipeDown: null,
      pinchIn: null,
      pinchOut: null,
      rotate: null,
    };

    // 多點觸控支持
    this.touches = [];
    this.pinchStartDistance = 0;
    this.initialRotation = 0;
  }

  // 綁定到元素
  bindTo(element) {
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;

    if (!this.element) {
      console.error("TouchControls: Invalid element");
      return this;
    }

    // 添加觸控事件監聽器
    this.element.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      false
    );
    this.element.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      false
    );
    this.element.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      false
    );

    return this;
  }

  // 移除綁定
  unbind() {
    if (!this.element) return this;

    this.element.removeEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      false
    );
    this.element.removeEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      false
    );
    this.element.removeEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      false
    );

    this.element = null;
    return this;
  }

  // 註冊回調函數
  on(eventName, callback) {
    if (typeof callback !== "function") {
      console.error(
        `TouchControls: Callback for ${eventName} must be a function`
      );
      return this;
    }

    if (this.callbacks.hasOwnProperty(eventName)) {
      this.callbacks[eventName] = callback;
    } else {
      console.error(`TouchControls: Unknown event ${eventName}`);
    }

    return this;
  }

  // 處理觸摸開始
  handleTouchStart(event) {
    // 防止默認行為，避免滾動或縮放
    event.preventDefault();

    this.touchStartTime = Date.now();

    // 記錄觸摸點
    if (event.touches.length === 1) {
      // 單點觸控
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;

      // 設置長按計時器
      this.longPressTimer = setTimeout(() => {
        if (this.callbacks.longPress) {
          this.isLongPressing = true;
          this.callbacks.longPress({
            x: this.touchStartX,
            y: this.touchStartY,
            originalEvent: event,
          });
        }
      }, this.options.longPressThreshold);
    } else if (event.touches.length === 2) {
      // 雙點觸控，用於縮放或旋轉
      this.touches = [];
      for (let i = 0; i < event.touches.length; i++) {
        this.touches.push({
          x: event.touches[i].clientX,
          y: event.touches[i].clientY,
        });
      }

      // 計算初始兩點之間距離（用於縮放）
      this.pinchStartDistance = this.calculateDistance(
        this.touches[0].x,
        this.touches[0].y,
        this.touches[1].x,
        this.touches[1].y
      );

      // 計算初始角度（用於旋轉）
      this.initialRotation = this.calculateAngle(
        this.touches[0].x,
        this.touches[0].y,
        this.touches[1].x,
        this.touches[1].y
      );
    }
  }

  // 處理觸摸移動
  handleTouchMove(event) {
    // 如果移動，取消長按計時器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (event.touches.length === 2) {
      // 雙點觸控，處理縮放或旋轉
      const currentTouches = [
        { x: event.touches[0].clientX, y: event.touches[0].clientY },
        { x: event.touches[1].clientX, y: event.touches[1].clientY },
      ];

      // 計算當前兩點之間距離
      const currentDistance = this.calculateDistance(
        currentTouches[0].x,
        currentTouches[0].y,
        currentTouches[1].x,
        currentTouches[1].y
      );

      // 處理縮放
      if (Math.abs(currentDistance - this.pinchStartDistance) > 10) {
        if (
          currentDistance > this.pinchStartDistance &&
          this.callbacks.pinchOut
        ) {
          this.callbacks.pinchOut({
            scale: currentDistance / this.pinchStartDistance,
            center: {
              x: (currentTouches[0].x + currentTouches[1].x) / 2,
              y: (currentTouches[0].y + currentTouches[1].y) / 2,
            },
            originalEvent: event,
          });
        } else if (
          currentDistance < this.pinchStartDistance &&
          this.callbacks.pinchIn
        ) {
          this.callbacks.pinchIn({
            scale: currentDistance / this.pinchStartDistance,
            center: {
              x: (currentTouches[0].x + currentTouches[1].x) / 2,
              y: (currentTouches[0].y + currentTouches[1].y) / 2,
            },
            originalEvent: event,
          });
        }

        this.pinchStartDistance = currentDistance;
      }

      // 計算當前角度
      const currentRotation = this.calculateAngle(
        currentTouches[0].x,
        currentTouches[0].y,
        currentTouches[1].x,
        currentTouches[1].y
      );

      // 處理旋轉
      const rotationDelta = currentRotation - this.initialRotation;
      if (Math.abs(rotationDelta) > 5 && this.callbacks.rotate) {
        this.callbacks.rotate({
          rotation: rotationDelta,
          center: {
            x: (currentTouches[0].x + currentTouches[1].x) / 2,
            y: (currentTouches[0].y + currentTouches[1].y) / 2,
          },
          originalEvent: event,
        });
      }

      this.initialRotation = currentRotation;
    }
  }

  // 處理觸摸結束
  handleTouchEnd(event) {
    // 清除長按計時器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // 如果是長按，不處理點擊或滑動
    if (this.isLongPressing) {
      this.isLongPressing = false;
      return;
    }

    // 單點觸控結束
    this.touchEndX = event.changedTouches[0].clientX;
    this.touchEndY = event.changedTouches[0].clientY;

    // 計算觸摸時間
    const touchDuration = Date.now() - this.touchStartTime;

    // 計算X和Y方向的移動距離
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 如果移動距離小於閾值，視為點擊
    if (distance < this.options.swipeThreshold) {
      const now = Date.now();

      // 檢查是否為雙擊
      if (now - this.lastTapTime < this.options.doubleTapThreshold) {
        if (this.callbacks.doubleTap) {
          this.callbacks.doubleTap({
            x: this.touchEndX,
            y: this.touchEndY,
            originalEvent: event,
          });
        }
        this.lastTapTime = 0; // 重置避免連續雙擊
      } else {
        // 單擊
        if (this.callbacks.tap) {
          this.callbacks.tap({
            x: this.touchEndX,
            y: this.touchEndY,
            originalEvent: event,
          });
        }
        this.lastTapTime = now;
      }
    } else {
      // 如果移動距離大於閾值，視為滑動
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);

      // 確定滑動方向
      if (absoluteX > absoluteY) {
        // 水平滑動
        if (deltaX > 0) {
          // 向右滑動
          if (this.callbacks.swipeRight) {
            this.callbacks.swipeRight({
              distance: deltaX,
              originalEvent: event,
            });
          }
        } else {
          // 向左滑動
          if (this.callbacks.swipeLeft) {
            this.callbacks.swipeLeft({
              distance: -deltaX,
              originalEvent: event,
            });
          }
        }
      } else {
        // 垂直滑動
        if (deltaY > 0) {
          // 向下滑動
          if (this.callbacks.swipeDown) {
            this.callbacks.swipeDown({
              distance: deltaY,
              originalEvent: event,
            });
          }
        } else {
          // 向上滑動
          if (this.callbacks.swipeUp) {
            this.callbacks.swipeUp({
              distance: -deltaY,
              originalEvent: event,
            });
          }
        }
      }
    }
  }

  // 計算兩點之間的距離
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  // 計算兩點形成的角度
  calculateAngle(x1, y1, x2, y2) {
    return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  }
}

// 創建遊戲手勢控制器（專為遊戲設計的便捷接口）
class GameTouchController {
  constructor(element, options = {}) {
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;

    if (!this.element) {
      console.error("GameTouchController: Invalid element");
      return;
    }

    this.options = {
      enableKeyboardFallback: true, // 在非觸控設備上啟用鍵盤回調
      ...options,
    };

    this.touchControls = new TouchControls().bindTo(this.element);

    this.keyMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
      " ": "action",
      Enter: "action",
    };

    this.callbackMap = {
      up: null,
      down: null,
      left: null,
      right: null,
      action: null,
      tap: null,
      doubleTap: null,
      longPress: null,
    };

    // 初始化觸控事件
    this.setupTouchEvents();

    // 如果啟用鍵盤回調，設置鍵盤事件
    if (this.options.enableKeyboardFallback) {
      this.setupKeyboardEvents();
    }

    // 檢測是否為觸控設備
    this.isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // 創建虛擬按鍵（如果需要）
    if (this.isTouchDevice && this.options.addVirtualControls) {
      this.setupVirtualControls();
    }
  }

  // 設置觸控事件
  setupTouchEvents() {
    this.touchControls.on("swipeLeft", (e) => {
      if (this.callbackMap.left) this.callbackMap.left(e);
    });

    this.touchControls.on("swipeRight", (e) => {
      if (this.callbackMap.right) this.callbackMap.right(e);
    });

    this.touchControls.on("swipeUp", (e) => {
      if (this.callbackMap.up) this.callbackMap.up(e);
    });

    this.touchControls.on("swipeDown", (e) => {
      if (this.callbackMap.down) this.callbackMap.down(e);
    });

    this.touchControls.on("tap", (e) => {
      if (this.callbackMap.tap) this.callbackMap.tap(e);
      // 也觸發動作回調
      if (this.callbackMap.action) this.callbackMap.action(e);
    });

    this.touchControls.on("doubleTap", (e) => {
      if (this.callbackMap.doubleTap) this.callbackMap.doubleTap(e);
    });

    this.touchControls.on("longPress", (e) => {
      if (this.callbackMap.longPress) this.callbackMap.longPress(e);
    });
  }

  // 設置鍵盤事件
  setupKeyboardEvents() {
    document.addEventListener("keydown", (e) => {
      const action = this.keyMap[e.key];
      if (action && this.callbackMap[action]) {
        this.callbackMap[action]({
          originalEvent: e,
          source: "keyboard",
        });
      }
    });
  }

  // 設置虛擬控制器
  setupVirtualControls() {
    // 創建虛擬D-pad和操作按鈕
    const dpad = document.createElement("div");
    dpad.className = "virtual-dpad";
    dpad.innerHTML = `
      <div class="dpad-button up" data-direction="up">▲</div>
      <div class="dpad-button left" data-direction="left">◀</div>
      <div class="dpad-button right" data-direction="right">▶</div>
      <div class="dpad-button down" data-direction="down">▼</div>
    `;

    const actionBtn = document.createElement("div");
    actionBtn.className = "virtual-action-button";
    actionBtn.innerText = "A";

    // 添加到頁面
    document.body.appendChild(dpad);
    document.body.appendChild(actionBtn);

    // 為D-pad按鈕添加事件
    const dpadButtons = dpad.querySelectorAll(".dpad-button");
    dpadButtons.forEach((button) => {
      button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const direction = button.dataset.direction;
        if (this.callbackMap[direction]) {
          this.callbackMap[direction]({
            originalEvent: e,
            source: "virtualDpad",
          });
        }
      });
    });

    // 為操作按鈕添加事件
    actionBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (this.callbackMap.action) {
        this.callbackMap.action({
          originalEvent: e,
          source: "virtualButton",
        });
      }
    });

    // 保存引用以便稍後可能需要移除
    this.virtualControls = {
      dpad,
      actionBtn,
    };
  }

  // 註冊控制回調
  on(action, callback) {
    if (this.callbackMap.hasOwnProperty(action)) {
      this.callbackMap[action] = callback;
    } else {
      console.error(`GameTouchController: Unknown action "${action}"`);
    }
    return this;
  }

  // 設置全部方向控制
  setDirectionalControls(callbacks) {
    const { up, down, left, right } = callbacks || {};
    if (up) this.callbackMap.up = up;
    if (down) this.callbackMap.down = down;
    if (left) this.callbackMap.left = left;
    if (right) this.callbackMap.right = right;
    return this;
  }

  // 移除和清理
  unbind() {
    this.touchControls.unbind();

    if (this.options.enableKeyboardFallback) {
      // 移除鍵盤事件（這裡我們不能使用綁定函數的引用，所以無法直接移除）
    }

    // 移除虛擬控制器
    if (this.virtualControls) {
      document.body.removeChild(this.virtualControls.dpad);
      document.body.removeChild(this.virtualControls.actionBtn);
    }
  }
}

// 導出
window.TouchControls = TouchControls;
window.GameTouchController = GameTouchController;
