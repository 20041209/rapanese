// 【Anime日语每日课】生词和语法自动收集系统

/**
 * 知识收集器
 * 自动收集用户学习过程中的生词和语法点
 */
class KnowledgeCollector {
  /**
   * 初始化知识收集器
   * @param {Object} options - 配置选项
   * @param {Object} options.database - 数据库连接对象
   * @param {String} options.userId - 用户ID
   * @param {Number} options.collectionThreshold - 收集阈值（点击次数）
   */
  constructor(options = {}) {
    this.options = {
      database: options.database || null,
      userId: options.userId || null,
      collectionThreshold: options.collectionThreshold || 2
    };
    
    this.clickedWords = new Map(); // 单词 -> 点击次数
    this.collectedWords = new Set(); // 已收集的单词
    this.grammarPoints = new Map(); // 语法点 -> 使用次数
    this.collectedGrammar = new Set(); // 已收集的语法点
  }

  /**
   * 记录单词点击
   * @param {Object} wordInfo - 单词信息
   * @returns {Boolean} - 是否触发收集
   */
  recordWordClick(wordInfo) {
    if (!wordInfo || !wordInfo.word) {
      console.error('无效的单词信息');
      return false;
    }
    
    // 如果已经收集过，直接返回
    if (this.collectedWords.has(wordInfo.word)) {
      return false;
    }
    
    // 更新点击次数
    const currentCount = this.clickedWords.get(wordInfo.word) || 0;
    const newCount = currentCount + 1;
    this.clickedWords.set(wordInfo.word, newCount);
    
    // 检查是否达到收集阈值
    if (newCount >= this.options.collectionThreshold) {
      // 收集单词
      this._collectWord(wordInfo);
      return true;
    }
    
    return false;
  }

  /**
   * 记录语法点使用
   * @param {Object} grammarInfo - 语法点信息
   * @returns {Boolean} - 是否触发收集
   */
  recordGrammarUse(grammarInfo) {
    if (!grammarInfo || !grammarInfo.name) {
      console.error('无效的语法点信息');
      return false;
    }
    
    // 如果已经收集过，直接返回
    if (this.collectedGrammar.has(grammarInfo.name)) {
      return false;
    }
    
    // 更新使用次数
    const currentCount = this.grammarPoints.get(grammarInfo.name) || 0;
    const newCount = currentCount + 1;
    this.grammarPoints.set(grammarInfo.name, newCount);
    
    // 检查是否达到收集阈值
    if (newCount >= this.options.collectionThreshold) {
      // 收集语法点
      this._collectGrammar(grammarInfo);
      return true;
    }
    
    return false;
  }

  /**
   * 直接收集单词（跳过阈值检查）
   * @param {Object} wordInfo - 单词信息
   * @returns {Boolean} - 是否成功收集
   */
  collectWordDirectly(wordInfo) {
    if (!wordInfo || !wordInfo.word) {
      console.error('无效的单词信息');
      return false;
    }
    
    return this._collectWord(wordInfo);
  }

  /**
   * 直接收集语法点（跳过阈值检查）
   * @param {Object} grammarInfo - 语法点信息
   * @returns {Boolean} - 是否成功收集
   */
  collectGrammarDirectly(grammarInfo) {
    if (!grammarInfo || !grammarInfo.name) {
      console.error('无效的语法点信息');
      return false;
    }
    
    return this._collectGrammar(grammarInfo);
  }

  /**
   * 收集单词
   * @private
   * @param {Object} wordInfo - 单词信息
   * @returns {Boolean} - 是否成功收集
   */
  _collectWord(wordInfo) {
    try {
      // 标记为已收集
      this.collectedWords.add(wordInfo.word);
      
      // 保存到本地存储
      this._saveToLocalStorage('collectedWords', wordInfo);
      
      // 如果有数据库连接，保存到数据库
      if (this.options.database && this.options.userId) {
        this._saveWordToDatabase(wordInfo);
      }
      
      console.log(`已收集单词: ${wordInfo.word}`);
      return true;
    } catch (error) {
      console.error('收集单词失败:', error);
      return false;
    }
  }

  /**
   * 收集语法点
   * @private
   * @param {Object} grammarInfo - 语法点信息
   * @returns {Boolean} - 是否成功收集
   */
  _collectGrammar(grammarInfo) {
    try {
      // 标记为已收集
      this.collectedGrammar.add(grammarInfo.name);
      
      // 保存到本地存储
      this._saveToLocalStorage('collectedGrammar', grammarInfo);
      
      // 如果有数据库连接，保存到数据库
      if (this.options.database && this.options.userId) {
        this._saveGrammarToDatabase(grammarInfo);
      }
      
      console.log(`已收集语法点: ${grammarInfo.name}`);
      return true;
    } catch (error) {
      console.error('收集语法点失败:', error);
      return false;
    }
  }

  /**
   * 保存到本地存储
   * @private
   * @param {String} key - 存储键名
   * @param {Object} data - 存储数据
   */
  _saveToLocalStorage(key, data) {
    try {
      // 获取现有数据
      const existingDataStr = localStorage.getItem(key);
      const existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
      
      // 添加新数据
      existingData.push({
        ...data,
        collectedAt: new Date().toISOString()
      });
      
      // 保存回本地存储
      localStorage.setItem(key, JSON.stringify(existingData));
    } catch (error) {
      console.error(`保存到本地存储失败 (${key}):`, error);
    }
  }

  /**
   * 保存单词到数据库
   * @private
   * @param {Object} wordInfo - 单词信息
   */
  async _saveWordToDatabase(wordInfo) {
    try {
      if (!this.options.database || !this.options.userId) {
        throw new Error('数据库连接或用户ID未设置');
      }
      
      // 更新用户词汇库
      await this.options.database.collection('users').updateOne(
        { _id: this.options.userId },
        { 
          $push: { 
            vocabulary_bank: {
              word: wordInfo.word,
              reading: wordInfo.reading,
              meaning: wordInfo.meaning,
              level: wordInfo.level,
              mastery: 0.3, // 初始掌握度
              last_reviewed: new Date(),
              collected_at: new Date()
            }
          }
        }
      );
    } catch (error) {
      console.error('保存单词到数据库失败:', error);
    }
  }

  /**
   * 保存语法点到数据库
   * @private
   * @param {Object} grammarInfo - 语法点信息
   */
  async _saveGrammarToDatabase(grammarInfo) {
    try {
      if (!this.options.database || !this.options.userId) {
        throw new Error('数据库连接或用户ID未设置');
      }
      
      // 更新用户语法掌握度
      await this.options.database.collection('users').updateOne(
        { _id: this.options.userId },
        { 
          $push: { 
            grammar_mastery: {
              grammar_point: grammarInfo.name,
              mastery: 0.3, // 初始掌握度
              last_reviewed: new Date(),
              collected_at: new Date()
            }
          }
        }
      );
    } catch (error) {
      console.error('保存语法点到数据库失败:', error);
    }
  }

  /**
   * 获取收集的单词
   * @returns {Array} - 收集的单词数组
   */
  getCollectedWords() {
    try {
      // 从本地存储获取
      const dataStr = localStorage.getItem('collectedWords');
      return dataStr ? JSON.parse(dataStr) : [];
    } catch (error) {
      console.error('获取收集的单词失败:', error);
      return [];
    }
  }

  /**
   * 获取收集的语法点
   * @returns {Array} - 收集的语法点数组
   */
  getCollectedGrammar() {
    try {
      // 从本地存储获取
      const dataStr = localStorage.getItem('collectedGrammar');
      return dataStr ? JSON.parse(dataStr) : [];
    } catch (error) {
      console.error('获取收集的语法点失败:', error);
      return [];
    }
  }

  /**
   * 从数据库获取用户的词汇库
   * @returns {Promise<Array>} - 用户词汇库
   */
  async getVocabularyBankFromDatabase() {
    try {
      if (!this.options.database || !this.options.userId) {
        throw new Error('数据库连接或用户ID未设置');
      }
      
      // 查询用户数据
      const user = await this.options.database.collection('users').findOne(
        { _id: this.options.userId },
        { projection: { vocabulary_bank: 1 } }
      );
      
      return user && user.vocabulary_bank ? user.vocabulary_bank : [];
    } catch (error) {
      console.error('从数据库获取词汇库失败:', error);
      return [];
    }
  }

  /**
   * 从数据库获取用户的语法掌握度
   * @returns {Promise<Array>} - 用户语法掌握度
   */
  async getGrammarMasteryFromDatabase() {
    try {
      if (!this.options.database || !this.options.userId) {
        throw new Error('数据库连接或用户ID未设置');
      }
      
      // 查询用户数据
      const user = await this.options.database.collection('users').findOne(
        { _id: this.options.userId },
        { projection: { grammar_mastery: 1 } }
      );
      
      return user && user.grammar_mastery ? user.grammar_mastery : [];
    } catch (error) {
      console.error('从数据库获取语法掌握度失败:', error);
      return [];
    }
  }

  /**
   * 清除本地收集数据
   */
  clearLocalData() {
    try {
      localStorage.removeItem('collectedWords');
      localStorage.removeItem('collectedGrammar');
      
      this.clickedWords.clear();
      this.collectedWords.clear();
      this.grammarPoints.clear();
      this.collectedGrammar.clear();
      
      console.log('已清除本地收集数据');
    } catch (error) {
      console.error('清除本地收集数据失败:', error);
    }
  }
}

/**
 * 知识收集UI控制器
 * 管理知识收集的用户界面交互
 */
class KnowledgeCollectorController {
  /**
   * 初始化知识收集控制器
   * @param {Object} options - 配置选项
   * @param {KnowledgeCollector} options.collector - 知识收集器
   * @param {String} options.notificationSelector - 通知区域选择器
   */
  constructor(options = {}) {
    this.collector = options.collector || new KnowledgeCollector();
    this.options = {
      notificationSelector: options.notificationSelector || '#knowledge-notification'
    };
    
    this.notificationArea = null;
    this.isInitialized = false;
  }

  /**
   * 初始化控制器
   * @returns {Boolean} - 是否成功初始化
   */
  initialize() {
    if (this.isInitialized) return true;
    
    // 获取通知区域
    this.notificationArea = document.querySelector(this.options.notificationSelector);
    
    if (!this.notificationArea) {
      // 创建通知区域
      this.notificationArea = document.createElement('div');
      this.notificationArea.id = this.options.notificationSelector.replace('#', '');
      this.notificationArea.className = 'knowledge-notification';
      this.notificationArea.style.display = 'none';
      document.body.appendChild(this.notificationArea);
    }
    
    this.isInitialized = true;
    console.log('知识收集控制器已初始化');
    return true;
  }

  /**
   * 处理单词点击
   * @param {Object} wordInfo - 单词信息
   */
  handleWordClick(wordInfo) {
    if (!this.isInitialized || !this.collector) return;
    
    // 记录单词点击
    const collected = this.collector.recordWordClick(wordInfo);
    
    // 如果触发了收集，显示通知
    if (collected) {
      this._showCollectionNotification('word', wordInfo);
    }
  }

  /**
   * 处理语法点使用
   * @param {Object} grammarInfo - 语法点信息
   */
  handleGrammarUse(grammarInfo) {
    if (!this.isInitialized || !this.collector) return;
    
    // 记录语法点使用
    const collected = this.collector.recordGrammarUse(grammarInfo);
    
    // 如果触发了收集，显示通知
    if (collected) {
      this._showCollectionNotification('grammar', grammarInfo);
    }
  }

  /**
   * 显示收集通知
   * @private
   * @param {String} type - 收集类型 (word|grammar)
   * @param {Object} info - 收集的信息
   */
  _showCollectionNotification(type, info) {
    if (!this.notificationArea) return;
    
    // 构建通知HTML
    let html = '';
    
    if (type === 'word') {
      html = `
        <div class="collection-notification word-collection">
          <div class="notification-icon">📝</div>
          <div class="notification-content">
            <div class="notification-title">已收集新单词</div>
            <div class="notification-detail">
              <div class="word-info">
                <span class="word-text">${info.word}</span>
                <span class="word-reading">${info.reading}</span>
              </div>
              <div class="word-meaning">${info.meaning}</div>
            </div>
          </div>
          <button class="close-button">×</button>
        </div>
      `;
    } else if (type === 'grammar') {
      html = `
        <div class="collection-notification grammar-collection">
          <div class="notification-icon">📚</div>
          <div class="notification-content">
            <div class="notification-title">已收集新语法点</div>
            <div class="notification-detail">
              <div class="grammar-name">${info.name}</div>
              <div class="grammar-description">${info.description || ''}</div>
            </div>
          </div>
          <button class="close-button">×</button>
        </div>
      `;
    }
    
    // 更新通知区域
    this.notificationArea.innerHTML = html;
    this.notificationArea.style.display = 'block';
    
    // 添加关闭按钮事件监听器
    const closeButton = this.notificationArea.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.notificationArea.style.display = 'none';
      });
    }
    
    // 5秒后自动隐藏
    setTimeout(() => {
      if (this.notificationArea) {
        this.notificationArea.style.display = 'none';
      }
    }, 5000);
  }

  /**
   * 显示收集统计
   * @param {String} containerSelector - 统计容器选择器
   */
  showCollectionStats(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container || !this.collector) return;
    
    // 获取收集的数据
    const words = this.collector.getCollectedWords();
    const grammar = this.collector.getCollectedGrammar();
    
    // 构建统计HTML
    const html = `
      <div class="collection-stats">
        <h3>知识收集统计</h3>
        <div class="stats-summary">
          <div class="stats-item">
            <div class="stats-value">${words.length}</div>
            <div class="stats-label">收集的单词</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">${grammar.length}</div>
            <div class="stats-label">收集的语法点</div>
          </div>
        </div>
        <div class="stats-details">
          <div class="words-section">
            <h4>单词列表</h4>
            <div class="words-list">
              ${words.length > 0 ? this._generateWordsList(words) : '<p>暂无收集的单词</p>'}
            </div>
          </div>
          <div class="grammar-section">
            <h4>语法点列表</h4>
            <div class="grammar-list">
              ${grammar.length > 0 ? this._generateGrammarList(grammar) : '<p>暂无收集的语法点</p>'}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 更新容器内容
    container.innerHTML = html;
  }

  /**
   * 生成单词列表HTML
   * @private
   * @param {Array} words - 单词数组
   * @returns {String} - HTML内容
   */
  _generateWordsList(words) {
    let html = '<ul class="collected-words-list">';
    
    words.forEach(word => {
      html += `
        <li class="word-item">
          <div class="word-header">
            <span class="word-text">${word.word}</span>
            <span class="word-reading">${word.reading}</span>
            <span class="word-level">${word.level || 'N?'}</span>
          </div>
          <div class="word-meaning">${word.meaning}</div>
          ${word.collectedAt ? `<div class="collected-time">收集于: ${new Date(word.collectedAt).toLocaleString()}</div>` : ''}
        </li>
      `;
    });
    
    html += '</ul>';
    return html;
  }

  /**
   * 生成语法点列表HTML
   * @private
   * @param {Array} grammarPoints - 语法点数组
   * @returns {String} - HTML内容
   */
  _generateGrammarList(grammarPoints) {
    let html = '<ul class="collected-grammar-list">';
    
    grammarPoints.forEach(grammar => {
      html += `
        <li class="grammar-item">
          <div class="grammar-header">
            <span class="grammar-name">${grammar.name}</span>
            <span class="grammar-level">${grammar.level || 'N?'}</span>
          </div>
          <div class="grammar-description">${grammar.description || ''}</div>
          ${grammar.collectedAt ? `<div class="collected-time">收集于: ${new Date(grammar.collectedAt).toLocaleString()}</div>` : ''}
        </li>
      `;
    });
    
    html += '</ul>';
    return html;
  }

  /**
   * 销毁控制器
   */
  destroy() {
    if (!this.isInitialized) return;
    
    // 移除通知区域
    if (this.notificationArea && this.notificationArea.parentNode) {
      this.notificationArea.parentNode.removeChild(this.notificationArea);
    }
    
    this.notificationArea = null;
    this.isInitialized = false;
    
    console.log('知识收集控制器已销毁');
  }
}

// 导出模块
module.exports = {
  KnowledgeCollector,
  KnowledgeCollectorController
};
