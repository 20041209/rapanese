// 【Anime日语每日课】碎片复习弹幕功能

/**
 * 碎片复习弹幕系统
 * 自动收集每日学习的生词和语法，生成"碎片复习弹幕"随机在视频中飘过
 */
class ReviewDanmakuSystem {
  /**
   * 初始化碎片复习弹幕系统
   * @param {Object} options - 配置选项
   * @param {KnowledgeCollector} options.knowledgeCollector - 知识收集器
   * @param {String} options.containerSelector - 弹幕容器选择器
   * @param {Boolean} options.enabled - 是否启用弹幕
   * @param {Number} options.frequency - 弹幕频率（秒）
   * @param {Number} options.speed - 弹幕速度（秒）
   */
  constructor(options = {}) {
    this.knowledgeCollector = options.knowledgeCollector || null;
    this.options = {
      containerSelector: options.containerSelector || '#danmaku-container',
      enabled: options.enabled !== undefined ? options.enabled : true,
      frequency: options.frequency || 8, // 每8秒发送一条弹幕
      speed: options.speed || 10 // 弹幕从右到左移动的时间（秒）
    };
    
    this.container = null;
    this.reviewItems = []; // 复习项目
    this.isPlaying = false;
    this.timer = null;
    this.isInitialized = false;
  }

  /**
   * 初始化弹幕系统
   * @returns {Boolean} - 是否成功初始化
   */
  initialize() {
    if (this.isInitialized) return true;
    
    // 获取弹幕容器
    this.container = document.querySelector(this.options.containerSelector);
    
    if (!this.container) {
      console.error('未找到弹幕容器元素');
      return false;
    }
    
    // 设置容器样式
    this._setupContainerStyle();
    
    // 加载复习项目
    this._loadReviewItems();
    
    this.isInitialized = true;
    console.log('碎片复习弹幕系统已初始化');
    return true;
  }

  /**
   * 设置容器样式
   * @private
   */
  _setupContainerStyle() {
    if (!this.container) return;
    
    // 设置弹幕容器样式
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.pointerEvents = 'none'; // 不阻挡鼠标事件
    this.container.style.overflow = 'hidden';
    this.container.style.zIndex = '10';
  }

  /**
   * 加载复习项目
   * @private
   */
  _loadReviewItems() {
    if (!this.knowledgeCollector) {
      console.warn('未设置知识收集器，使用模拟数据');
      this._loadMockReviewItems();
      return;
    }
    
    try {
      // 获取收集的单词
      const words = this.knowledgeCollector.getCollectedWords();
      
      // 获取收集的语法点
      const grammar = this.knowledgeCollector.getCollectedGrammar();
      
      // 转换为复习项目
      this.reviewItems = [
        ...words.map(word => ({
          type: 'word',
          content: word.word,
          reading: word.reading,
          meaning: word.meaning,
          level: word.level
        })),
        ...grammar.map(grammar => ({
          type: 'grammar',
          content: grammar.name,
          description: grammar.description,
          level: grammar.level
        }))
      ];
      
      console.log(`已加载 ${this.reviewItems.length} 个复习项目`);
    } catch (error) {
      console.error('加载复习项目失败:', error);
      this._loadMockReviewItems();
    }
  }

  /**
   * 加载模拟复习项目（仅用于演示）
   * @private
   */
  _loadMockReviewItems() {
    // 模拟单词
    const mockWords = [
      { type: 'word', content: '学校', reading: 'がっこう', meaning: '学校', level: 'N5' },
      { type: 'word', content: '先生', reading: 'せんせい', meaning: '老师', level: 'N5' },
      { type: 'word', content: '友達', reading: 'ともだち', meaning: '朋友', level: 'N5' },
      { type: 'word', content: '勉強', reading: 'べんきょう', meaning: '学习', level: 'N5' },
      { type: 'word', content: '日本語', reading: 'にほんご', meaning: '日语', level: 'N5' },
      { type: 'word', content: '教室', reading: 'きょうしつ', meaning: '教室', level: 'N5' },
      { type: 'word', content: '図書館', reading: 'としょかん', meaning: '图书馆', level: 'N4' },
      { type: 'word', content: '宿題', reading: 'しゅくだい', meaning: '家庭作业', level: 'N4' }
    ];
    
    // 模拟语法点
    const mockGrammar = [
      { type: 'grammar', content: '〜される', description: '被动形：表示被动作', level: 'N4' },
      { type: 'grammar', content: '〜てみる', description: '尝试做某事', level: 'N4' },
      { type: 'grammar', content: '〜ことがある', description: '有过...的经历', level: 'N4' },
      { type: 'grammar', content: '〜ようになる', description: '变得能够...', level: 'N4' }
    ];
    
    // 合并复习项目
    this.reviewItems = [...mockWords, ...mockGrammar];
    
    console.log(`已加载 ${this.reviewItems.length} 个模拟复习项目`);
  }

  /**
   * 开始播放弹幕
   */
  start() {
    if (!this.isInitialized || this.isPlaying || !this.options.enabled) return;
    
    // 如果没有复习项目，重新加载
    if (this.reviewItems.length === 0) {
      this._loadReviewItems();
    }
    
    this.isPlaying = true;
    
    // 立即发送一条弹幕
    this._sendDanmaku();
    
    // 设置定时器，定期发送弹幕
    this.timer = setInterval(() => {
      this._sendDanmaku();
    }, this.options.frequency * 1000);
    
    console.log('碎片复习弹幕已开始播放');
  }

  /**
   * 停止播放弹幕
   */
  stop() {
    if (!this.isPlaying) return;
    
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.isPlaying = false;
    
    console.log('碎片复习弹幕已停止播放');
  }

  /**
   * 发送弹幕
   * @private
   */
  _sendDanmaku() {
    if (!this.container || this.reviewItems.length === 0) return;
    
    // 随机选择一个复习项目
    const item = this.reviewItems[Math.floor(Math.random() * this.reviewItems.length)];
    
    // 创建弹幕元素
    const danmaku = document.createElement('div');
    danmaku.className = `danmaku-item ${item.type}-danmaku`;
    
    // 设置弹幕内容
    if (item.type === 'word') {
      danmaku.innerHTML = `
        <span class="danmaku-content">${item.content}</span>
        <span class="danmaku-reading">${item.reading}</span>
        <span class="danmaku-meaning">${item.meaning}</span>
      `;
    } else if (item.type === 'grammar') {
      danmaku.innerHTML = `
        <span class="danmaku-content">${item.content}</span>
        <span class="danmaku-description">${item.description}</span>
      `;
    }
    
    // 设置弹幕样式
    this._styleDanmaku(danmaku, item);
    
    // 添加到容器
    this.container.appendChild(danmaku);
    
    // 设置动画
    this._animateDanmaku(danmaku);
  }

  /**
   * 设置弹幕样式
   * @private
   * @param {HTMLElement} danmaku - 弹幕元素
   * @param {Object} item - 复习项目
   */
  _styleDanmaku(danmaku, item) {
    // 基本样式
    danmaku.style.position = 'absolute';
    danmaku.style.right = '-300px'; // 从右侧开始
    danmaku.style.whiteSpace = 'nowrap';
    danmaku.style.padding = '4px 8px';
    danmaku.style.borderRadius = '4px';
    danmaku.style.fontSize = '16px';
    danmaku.style.fontWeight = 'bold';
    danmaku.style.opacity = '0.85';
    danmaku.style.pointerEvents = 'none'; // 不阻挡鼠标事件
    
    // 随机垂直位置
    const containerHeight = this.container.offsetHeight;
    const maxTop = containerHeight - 40; // 留出一些边距
    const top = Math.floor(Math.random() * maxTop);
    danmaku.style.top = `${top}px`;
    
    // 根据类型设置不同样式
    if (item.type === 'word') {
      danmaku.style.backgroundColor = 'rgba(65, 105, 225, 0.7)'; // 蓝色
      danmaku.style.color = 'white';
      
      // 根据级别设置边框
      if (item.level === 'N5') {
        danmaku.style.border = '1px solid rgba(144, 238, 144, 0.8)'; // 浅绿色
      } else if (item.level === 'N4') {
        danmaku.style.border = '1px solid rgba(255, 215, 0, 0.8)'; // 金色
      } else if (item.level === 'N3') {
        danmaku.style.border = '1px solid rgba(255, 165, 0, 0.8)'; // 橙色
      } else {
        danmaku.style.border = '1px solid rgba(255, 255, 255, 0.8)'; // 白色
      }
    } else if (item.type === 'grammar') {
      danmaku.style.backgroundColor = 'rgba(50, 205, 50, 0.7)'; // 绿色
      danmaku.style.color = 'white';
      
      // 根据级别设置边框
      if (item.level === 'N5') {
        danmaku.style.border = '1px solid rgba(144, 238, 144, 0.8)'; // 浅绿色
      } else if (item.level === 'N4') {
        danmaku.style.border = '1px solid rgba(255, 215, 0, 0.8)'; // 金色
      } else if (item.level === 'N3') {
        danmaku.style.border = '1px solid rgba(255, 165, 0, 0.8)'; // 橙色
      } else {
        danmaku.style.border = '1px solid rgba(255, 255, 255, 0.8)'; // 白色
      }
    }
    
    // 设置内部元素样式
    const content = danmaku.querySelector('.danmaku-content');
    if (content) {
      content.style.marginRight = '8px';
    }
    
    const reading = danmaku.querySelector('.danmaku-reading');
    if (reading) {
      reading.style.fontSize = '14px';
      reading.style.marginRight = '8px';
      reading.style.opacity = '0.9';
    }
    
    const meaning = danmaku.querySelector('.danmaku-meaning');
    if (meaning) {
      meaning.style.fontSize = '14px';
      meaning.style.opacity = '0.9';
    }
    
    const description = danmaku.querySelector('.danmaku-description');
    if (description) {
      description.style.fontSize = '14px';
      description.style.marginLeft = '8px';
      description.style.opacity = '0.9';
    }
  }

  /**
   * 设置弹幕动画
   * @private
   * @param {HTMLElement} danmaku - 弹幕元素
   */
  _animateDanmaku(danmaku) {
    // 获取容器宽度
    const containerWidth = this.container.offsetWidth;
    
    // 获取弹幕宽度
    const danmakuWidth = danmaku.offsetWidth;
    
    // 计算总移动距离
    const distance = containerWidth + danmakuWidth;
    
    // 设置动画
    danmaku.style.transition = `transform ${this.options.speed}s linear`;
    danmaku.style.transform = `translateX(-${distance}px)`;
    
    // 动画结束后移除弹幕
    setTimeout(() => {
      if (danmaku.parentNode) {
        danmaku.parentNode.removeChild(danmaku);
      }
    }, this.options.speed * 1000);
  }

  /**
   * 设置弹幕启用状态
   * @param {Boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.options.enabled = enabled;
    
    if (enabled) {
      if (!this.isPlaying) {
        this.start();
      }
    } else {
      if (this.isPlaying) {
        this.stop();
      }
    }
    
    console.log(`碎片复习弹幕已${enabled ? '启用' : '禁用'}`);
  }

  /**
   * 设置弹幕频率
   * @param {Number} frequency - 频率（秒）
   */
  setFrequency(frequency) {
    if (frequency < 1) {
      console.warn('弹幕频率不能小于1秒');
      return;
    }
    
    this.options.frequency = frequency;
    
    // 如果正在播放，重新启动
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
    
    console.log(`弹幕频率已设置为 ${frequency} 秒`);
  }

  /**
   * 设置弹幕速度
   * @param {Number} speed - 速度（秒）
   */
  setSpeed(speed) {
    if (speed < 1) {
      console.warn('弹幕速度不能小于1秒');
      return;
    }
    
    this.options.speed = speed;
    console.log(`弹幕速度已设置为 ${speed} 秒`);
  }

  /**
   * 刷新复习项目
   */
  refreshReviewItems() {
    this._loadReviewItems();
    
    // 如果正在播放，重新启动
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
    
    console.log('复习项目已刷新');
  }

  /**
   * 销毁弹幕系统
   */
  destroy() {
    if (!this.isInitialized) return;
    
    // 停止播放
    this.stop();
    
    // 清空容器
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.container = null;
    this.reviewItems = [];
    this.isInitialized = false;
    
    console.log('碎片复习弹幕系统已销毁');
  }
}

/**
 * 碎片复习弹幕控制器
 * 管理碎片复习弹幕的用户界面交互
 */
class ReviewDanmakuController {
  /**
   * 初始化碎片复习弹幕控制器
   * @param {Object} options - 配置选项
   * @param {ReviewDanmakuSystem} options.danmakuSystem - 弹幕系统
   * @param {String} options.toggleButtonSelector - 开关按钮选择器
   * @param {String} options.settingsButtonSelector - 设置按钮选择器
   */
  constructor(options = {}) {
    this.danmakuSystem = options.danmakuSystem || null;
    this.options = {
      toggleButtonSelector: options.toggleButtonSelector || '#danmaku-toggle',
      settingsButtonSelector: options.settingsButtonSelector || '#danmaku-settings'
    };
    
    this.toggleButton = null;
    this.settingsButton = null;
    this.settingsPanel = null;
    this.isInitialized = false;
  }

  /**
   * 初始化控制器
   * @returns {Boolean} - 是否成功初始化
   */
  initialize() {
    if (this.isInitialized) return true;
    
    // 获取按钮元素
    this.toggleButton = document.querySelector(this.options.toggleButtonSelector);
    this.settingsButton = document.querySelector(this.options.settingsButtonSelector);
    
    if (!this.toggleButton) {
      console.error('未找到弹幕开关按钮元素');
      return false;
    }
    
    // 初始化弹幕系统
    if (!this.danmakuSystem) {
      console.error('未设置弹幕系统');
      return false;
    }
    
    const danmakuInitialized = this.danmakuSystem.initialize();
    if (!danmakuInitialized) {
      console.error('初始化弹幕系统失败');
      return false;
    }
    
    // 添加按钮事件监听器
    this._setupEventListeners();
    
    // 创建设置面板
    this._createSettingsPanel();
    
    // 更新按钮状态
    this._updateToggleButtonState();
    
    this.isInitialized = true;
    console.log('碎片复习弹幕控制器已初始化');
    return true;
  }

  /**
   * 设置事件监听器
   * @private
   */
  _setupEventListeners() {
    // 开关按钮点击事件
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', this._handleToggleClick.bind(this));
    }
    
    // 设置按钮点击事件
    if (this.settingsButton) {
      this.settingsButton.addEventListener('click', this._handleSettingsClick.bind(this));
    }
  }

  /**
   * 创建设置面板
   * @private
   */
  _createSettingsPanel() {
    // 创建设置面板元素
    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'danmaku-settings-panel';
    this.settingsPanel.style.display = 'none';
    
    // 设置面板内容
    this.settingsPanel.innerHTML = `
      <div class="settings-header">
        <h3>弹幕设置</h3>
        <button class="close-button">×</button>
      </div>
      <div class="settings-content">
        <div class="settings-item">
          <label for="danmaku-frequency">弹幕频率（秒）</label>
          <input type="range" id="danmaku-frequency" min="2" max="20" step="1" value="${this.danmakuSystem.options.frequency}">
          <span class="value-display">${this.danmakuSystem.options.frequency}</span>
        </div>
        <div class="settings-item">
          <label for="danmaku-speed">弹幕速度（秒）</label>
          <input type="range" id="danmaku-speed" min="5" max="20" step="1" value="${this.danmakuSystem.options.speed}">
          <span class="value-display">${this.danmakuSystem.options.speed}</span>
        </div>
        <div class="settings-item">
          <button id="refresh-danmaku">刷新复习项目</button>
        </div>
      </div>
    `;
    
    // 添加到文档
    document.body.appendChild(this.settingsPanel);
    
    // 添加事件监听器
    const closeButton = this.settingsPanel.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.settingsPanel.style.display = 'none';
      });
    }
    
    const frequencySlider = this.settingsPanel.querySelector('#danmaku-frequency');
    if (frequencySlider) {
      frequencySlider.addEventListener('input', (event) => {
        const value = parseInt(event.target.value);
        this.danmakuSystem.setFrequency(value);
        
        // 更新显示值
        const valueDisplay = event.target.nextElementSibling;
        if (valueDisplay) {
          valueDisplay.textContent = value;
        }
      });
    }
    
    const speedSlider = this.settingsPanel.querySelector('#danmaku-speed');
    if (speedSlider) {
      speedSlider.addEventListener('input', (event) => {
        const value = parseInt(event.target.value);
        this.danmakuSystem.setSpeed(value);
        
        // 更新显示值
        const valueDisplay = event.target.nextElementSibling;
        if (valueDisplay) {
          valueDisplay.textContent = value;
        }
      });
    }
    
    const refreshButton = this.settingsPanel.querySelector('#refresh-danmaku');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.danmakuSystem.refreshReviewItems();
      });
    }
  }

  /**
   * 处理开关按钮点击
   * @private
   */
  _handleToggleClick() {
    if (!this.danmakuSystem) return;
    
    // 切换启用状态
    const newState = !this.danmakuSystem.options.enabled;
    this.danmakuSystem.setEnabled(newState);
    
    // 更新按钮状态
    this._updateToggleButtonState();
  }

  /**
   * 处理设置按钮点击
   * @private
   */
  _handleSettingsClick() {
    if (!this.settingsPanel) return;
    
    // 显示设置面板
    this.settingsPanel.style.display = 'block';
  }

  /*
(Content truncated due to size limit. Use line ranges to read in chunks)