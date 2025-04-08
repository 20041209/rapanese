// 【Anime日语每日课】点击查词功能

/**
 * 点击查词功能
 * 实现鼠标悬停日语台词时，自动显示假名/中文释义/例句
 */
class WordLookupTool {
  /**
   * 初始化点击查词工具
   * @param {Object} options - 配置选项
   * @param {String} options.containerSelector - 字幕容器选择器
   * @param {String} options.popupClass - 弹出框CSS类名
   * @param {Object} options.dictionary - 词典对象或API
   */
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || '.subtitle-jp',
      popupClass: options.popupClass || 'word-lookup-popup',
      dictionary: options.dictionary || null
    };
    
    this.currentPopup = null;
    this.isInitialized = false;
  }

  /**
   * 初始化点击查词功能
   */
  initialize() {
    if (this.isInitialized) return;
    
    // 创建弹出框元素
    this._createPopupElement();
    
    // 添加事件监听器
    this._addEventListeners();
    
    this.isInitialized = true;
    console.log('点击查词功能已初始化');
  }

  /**
   * 创建弹出框元素
   * @private
   */
  _createPopupElement() {
    // 检查是否已存在
    let popup = document.querySelector(`.${this.options.popupClass}`);
    
    if (!popup) {
      // 创建弹出框
      popup = document.createElement('div');
      popup.className = this.options.popupClass;
      popup.style.display = 'none';
      popup.style.position = 'absolute';
      popup.style.zIndex = '1000';
      popup.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      popup.style.border = '1px solid #ddd';
      popup.style.borderRadius = '4px';
      popup.style.padding = '8px 12px';
      popup.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
      popup.style.maxWidth = '300px';
      popup.style.fontSize = '14px';
      popup.style.lineHeight = '1.5';
      popup.style.color = '#333';
      
      // 添加到文档
      document.body.appendChild(popup);
    }
    
    this.currentPopup = popup;
  }

  /**
   * 添加事件监听器
   * @private
   */
  _addEventListeners() {
    // 使用事件委托，监听字幕容器内的鼠标事件
    document.addEventListener('mouseover', this._handleMouseOver.bind(this));
    document.addEventListener('mouseout', this._handleMouseOut.bind(this));
    document.addEventListener('click', this._handleClick.bind(this));
    
    // 监听窗口大小变化，调整弹出框位置
    window.addEventListener('resize', this._handleResize.bind(this));
    
    // 监听滚动事件，调整弹出框位置
    window.addEventListener('scroll', this._handleScroll.bind(this));
  }

  /**
   * 处理鼠标悬停事件
   * @private
   * @param {MouseEvent} event - 鼠标事件
   */
  async _handleMouseOver(event) {
    // 检查是否在字幕容器内
    const subtitleElement = this._findParentSubtitle(event.target);
    if (!subtitleElement) return;
    
    // 获取悬停的文本
    const text = this._getHoveredText(event.target);
    if (!text || text.length < 1 || text.length > 20) return;
    
    // 查询词典
    const wordInfo = await this._lookupWord(text);
    if (!wordInfo) return;
    
    // 显示弹出框
    this._showPopup(wordInfo, event.clientX, event.clientY);
  }

  /**
   * 处理鼠标移出事件
   * @private
   * @param {MouseEvent} event - 鼠标事件
   */
  _handleMouseOut(event) {
    // 检查是否从弹出框移出
    if (event.relatedTarget && (event.relatedTarget === this.currentPopup || this.currentPopup.contains(event.relatedTarget))) {
      return;
    }
    
    // 隐藏弹出框
    this._hidePopup();
  }

  /**
   * 处理点击事件
   * @private
   * @param {MouseEvent} event - 鼠标事件
   */
  async _handleClick(event) {
    // 检查是否在字幕容器内
    const subtitleElement = this._findParentSubtitle(event.target);
    if (!subtitleElement) {
      // 如果点击在弹出框外，隐藏弹出框
      if (this.currentPopup && !this.currentPopup.contains(event.target)) {
        this._hidePopup();
      }
      return;
    }
    
    // 获取点击的文本
    const text = this._getHoveredText(event.target);
    if (!text || text.length < 1 || text.length > 20) return;
    
    // 查询词典
    const wordInfo = await this._lookupWord(text);
    if (!wordInfo) return;
    
    // 显示弹出框，并标记为固定（点击外部才关闭）
    this._showPopup(wordInfo, event.clientX, event.clientY, true);
    
    // 阻止事件冒泡
    event.stopPropagation();
  }

  /**
   * 处理窗口大小变化事件
   * @private
   */
  _handleResize() {
    // 如果弹出框可见，调整位置
    if (this.currentPopup && this.currentPopup.style.display !== 'none') {
      const rect = this.currentPopup.getBoundingClientRect();
      this._adjustPopupPosition(rect.left, rect.top);
    }
  }

  /**
   * 处理滚动事件
   * @private
   */
  _handleScroll() {
    // 如果弹出框可见，调整位置
    if (this.currentPopup && this.currentPopup.style.display !== 'none') {
      const rect = this.currentPopup.getBoundingClientRect();
      this._adjustPopupPosition(rect.left, rect.top);
    }
  }

  /**
   * 查找父级字幕元素
   * @private
   * @param {HTMLElement} element - 当前元素
   * @returns {HTMLElement|null} - 字幕元素或null
   */
  _findParentSubtitle(element) {
    let current = element;
    
    // 向上查找匹配选择器的父元素
    while (current && !current.matches(this.options.containerSelector)) {
      current = current.parentElement;
    }
    
    return current;
  }

  /**
   * 获取悬停的文本
   * @private
   * @param {HTMLElement} element - 悬停元素
   * @returns {String} - 悬停文本
   */
  _getHoveredText(element) {
    // 如果是文本节点，获取其文本内容
    if (element.nodeType === Node.TEXT_NODE) {
      return element.textContent.trim();
    }
    
    // 如果是元素节点，获取其文本内容
    if (element.nodeType === Node.ELEMENT_NODE) {
      // 如果是ruby元素，获取rb元素的内容
      if (element.tagName.toLowerCase() === 'ruby') {
        const rb = element.querySelector('rb');
        return rb ? rb.textContent.trim() : element.textContent.trim();
      }
      
      // 其他元素，获取文本内容
      return element.textContent.trim();
    }
    
    return '';
  }

  /**
   * 查询词典
   * @private
   * @param {String} text - 查询文本
   * @returns {Promise<Object|null>} - 词条信息或null
   */
  async _lookupWord(text) {
    try {
      // 如果有词典对象，使用它
      if (this.options.dictionary) {
        return await this.options.dictionary.lookup(text);
      }
      
      // 否则使用模拟数据（实际应用中应连接真实词典API）
      return this._getMockDictionaryData(text);
    } catch (error) {
      console.error('查询词典失败:', error);
      return null;
    }
  }

  /**
   * 获取模拟词典数据（仅用于演示）
   * @private
   * @param {String} text - 查询文本
   * @returns {Object|null} - 模拟词条信息
   */
  _getMockDictionaryData(text) {
    // 模拟词典数据
    const mockDictionary = {
      '学校': {
        word: '学校',
        reading: 'がっこう',
        meaning: '学校',
        level: 'N5',
        examples: [
          { jp: '私は学校に行きます。', cn: '我去学校。' }
        ]
      },
      '先生': {
        word: '先生',
        reading: 'せんせい',
        meaning: '老师',
        level: 'N5',
        examples: [
          { jp: '田中先生は日本語の先生です。', cn: '田中老师是日语老师。' }
        ]
      },
      '勉強': {
        word: '勉強',
        reading: 'べんきょう',
        meaning: '学习',
        level: 'N5',
        examples: [
          { jp: '毎日日本語を勉強しています。', cn: '我每天都在学习日语。' }
        ]
      },
      '日本語': {
        word: '日本語',
        reading: 'にほんご',
        meaning: '日语',
        level: 'N5',
        examples: [
          { jp: '日本語が好きです。', cn: '我喜欢日语。' }
        ]
      },
      '私': {
        word: '私',
        reading: 'わたし',
        meaning: '我',
        level: 'N5',
        examples: [
          { jp: '私は学生です。', cn: '我是学生。' }
        ]
      },
      '友達': {
        word: '友達',
        reading: 'ともだち',
        meaning: '朋友',
        level: 'N5',
        examples: [
          { jp: '彼は私の友達です。', cn: '他是我的朋友。' }
        ]
      },
      'される': {
        word: 'される',
        reading: 'される',
        meaning: '被...（被动形）',
        level: 'N4',
        examples: [
          { jp: 'この本は多くの人に読まれています。', cn: '这本书被很多人阅读。' }
        ]
      }
    };
    
    // 查找完全匹配
    if (mockDictionary[text]) {
      return mockDictionary[text];
    }
    
    // 查找部分匹配
    for (const key in mockDictionary) {
      if (text.includes(key)) {
        return mockDictionary[key];
      }
    }
    
    return null;
  }

  /**
   * 显示弹出框
   * @private
   * @param {Object} wordInfo - 词条信息
   * @param {Number} x - 鼠标X坐标
   * @param {Number} y - 鼠标Y坐标
   * @param {Boolean} fixed - 是否固定显示
   */
  _showPopup(wordInfo, x, y, fixed = false) {
    if (!this.currentPopup) return;
    
    // 生成弹出框内容
    const content = this._generatePopupContent(wordInfo);
    
    // 更新弹出框内容
    this.currentPopup.innerHTML = content;
    
    // 显示弹出框
    this.currentPopup.style.display = 'block';
    
    // 设置固定属性
    this.currentPopup.setAttribute('data-fixed', fixed ? 'true' : 'false');
    
    // 调整弹出框位置
    this._adjustPopupPosition(x, y);
  }

  /**
   * 隐藏弹出框
   * @private
   */
  _hidePopup() {
    if (!this.currentPopup) return;
    
    // 如果弹出框是固定的，不隐藏
    if (this.currentPopup.getAttribute('data-fixed') === 'true') {
      return;
    }
    
    // 隐藏弹出框
    this.currentPopup.style.display = 'none';
  }

  /**
   * 调整弹出框位置
   * @private
   * @param {Number} x - 鼠标X坐标
   * @param {Number} y - 鼠标Y坐标
   */
  _adjustPopupPosition(x, y) {
    if (!this.currentPopup) return;
    
    // 获取弹出框尺寸
    const popupWidth = this.currentPopup.offsetWidth;
    const popupHeight = this.currentPopup.offsetHeight;
    
    // 获取视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 计算弹出框位置
    let left = x + 10; // 鼠标右侧10px
    let top = y + 10; // 鼠标下方10px
    
    // 确保弹出框不超出视口右侧
    if (left + popupWidth > viewportWidth) {
      left = x - popupWidth - 10; // 鼠标左侧
    }
    
    // 确保弹出框不超出视口底部
    if (top + popupHeight > viewportHeight) {
      top = y - popupHeight - 10; // 鼠标上方
    }
    
    // 确保弹出框不超出视口左侧和顶部
    left = Math.max(10, left);
    top = Math.max(10, top);
    
    // 设置弹出框位置
    this.currentPopup.style.left = `${left}px`;
    this.currentPopup.style.top = `${top}px`;
  }

  /**
   * 生成弹出框内容
   * @private
   * @param {Object} wordInfo - 词条信息
   * @returns {String} - HTML内容
   */
  _generatePopupContent(wordInfo) {
    if (!wordInfo) return '';
    
    let content = `
      <div class="word-lookup-header">
        <div class="word-lookup-word">${wordInfo.word}</div>
        <div class="word-lookup-reading">${wordInfo.reading}</div>
        <div class="word-lookup-level">${wordInfo.level}</div>
      </div>
      <div class="word-lookup-meaning">${wordInfo.meaning}</div>
    `;
    
    // 添加例句
    if (wordInfo.examples && wordInfo.examples.length > 0) {
      content += '<div class="word-lookup-examples">';
      
      wordInfo.examples.forEach(example => {
        content += `
          <div class="word-lookup-example">
            <div class="example-jp">${example.jp}</div>
            <div class="example-cn">${example.cn}</div>
          </div>
        `;
      });
      
      content += '</div>';
    }
    
    return content;
  }

  /**
   * 销毁点击查词功能
   */
  destroy() {
    if (!this.isInitialized) return;
    
    // 移除事件监听器
    document.removeEventListener('mouseover', this._handleMouseOver);
    document.removeEventListener('mouseout', this._handleMouseOut);
    document.removeEventListener('click', this._handleClick);
    window.removeEventListener('resize', this._handleResize);
    window.removeEventListener('scroll', this._handleScroll);
    
    // 移除弹出框
    if (this.currentPopup && this.currentPopup.parentNode) {
      this.currentPopup.parentNode.removeChild(this.currentPopup);
    }
    
    this.currentPopup = null;
    this.isInitialized = false;
    
    console.log('点击查词功能已销毁');
  }
}

// 导出模块
module.exports = {
  WordLookupTool
};
