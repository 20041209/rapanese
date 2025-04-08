// 【Anime日语每日课】键盘快捷键支持

/**
 * 键盘快捷键管理器
 * 为应用添加键盘快捷键支持，提升用户体验
 */
class KeyboardShortcutManager {
  /**
   * 初始化键盘快捷键管理器
   * @param {Object} options - 配置选项
   * @param {Boolean} options.enabled - 是否启用快捷键
   * @param {Object} options.customShortcuts - 自定义快捷键映射
   */
  constructor(options = {}) {
    this.options = {
      enabled: options.enabled !== undefined ? options.enabled : true,
      customShortcuts: options.customShortcuts || {}
    };
    
    // 默认快捷键映射
    this.defaultShortcuts = {
      // 视频控制
      'Space': 'togglePlay',           // 空格键：播放/暂停
      'ArrowLeft': 'seekBackward',     // 左箭头：后退5秒
      'ArrowRight': 'seekForward',     // 右箭头：前进5秒
      'ArrowUp': 'volumeUp',           // 上箭头：增加音量
      'ArrowDown': 'volumeDown',       // 下箭头：减小音量
      'KeyM': 'toggleMute',            // M键：静音/取消静音
      'KeyF': 'toggleFullscreen',      // F键：全屏/退出全屏
      
      // 字幕控制
      'KeyS': 'toggleSubtitle',        // S键：显示/隐藏字幕
      'KeyJ': 'japaneseSubtitle',      // J键：仅显示日语字幕
      'KeyC': 'chineseSubtitle',       // C键：仅显示中文字幕
      'KeyD': 'dualSubtitle',          // D键：显示双语字幕
      
      // 互动功能
      'KeyR': 'slowReplay',            // R键：慢速复读
      'KeyP': 'pronunciationPractice', // P键：跟读练习
      'KeyG': 'gapFillingGame',        // G键：趣味填空游戏
      
      // 其他控制
      'Escape': 'closePopup',          // ESC键：关闭弹出窗口
      'KeyH': 'toggleHelp',            // H键：显示/隐藏帮助
      'KeyQ': 'toggleQuickNote'        // Q键：快速笔记
    };
    
    // 合并自定义快捷键
    this.shortcuts = { ...this.defaultShortcuts, ...this.options.customShortcuts };
    
    // 回调函数映射
    this.callbacks = {};
    
    // 是否已初始化
    this.isInitialized = false;
  }

  /**
   * 初始化快捷键监听
   */
  initialize() {
    if (this.isInitialized) return;
    
    // 添加键盘事件监听器
    document.addEventListener('keydown', this._handleKeyDown.bind(this));
    
    this.isInitialized = true;
    console.log('键盘快捷键管理器已初始化');
  }

  /**
   * 注册快捷键回调函数
   * @param {String} action - 动作名称
   * @param {Function} callback - 回调函数
   */
  registerCallback(action, callback) {
    if (typeof callback !== 'function') {
      console.error(`注册快捷键回调失败: ${action} 的回调不是函数`);
      return;
    }
    
    this.callbacks[action] = callback;
    console.log(`已注册快捷键回调: ${action}`);
  }

  /**
   * 批量注册快捷键回调函数
   * @param {Object} callbackMap - 回调函数映射
   */
  registerCallbacks(callbackMap) {
    if (!callbackMap || typeof callbackMap !== 'object') {
      console.error('注册快捷键回调失败: 回调映射无效');
      return;
    }
    
    for (const [action, callback] of Object.entries(callbackMap)) {
      this.registerCallback(action, callback);
    }
  }

  /**
   * 设置自定义快捷键
   * @param {String} key - 键名
   * @param {String} action - 动作名称
   */
  setCustomShortcut(key, action) {
    this.shortcuts[key] = action;
    console.log(`已设置自定义快捷键: ${key} -> ${action}`);
  }

  /**
   * 重置为默认快捷键
   */
  resetToDefault() {
    this.shortcuts = { ...this.defaultShortcuts };
    console.log('已重置为默认快捷键');
  }

  /**
   * 启用快捷键
   */
  enable() {
    this.options.enabled = true;
    console.log('已启用键盘快捷键');
  }

  /**
   * 禁用快捷键
   */
  disable() {
    this.options.enabled = false;
    console.log('已禁用键盘快捷键');
  }

  /**
   * 处理键盘按下事件
   * @private
   * @param {KeyboardEvent} event - 键盘事件
   */
  _handleKeyDown(event) {
    // 如果禁用了快捷键，直接返回
    if (!this.options.enabled) return;
    
    // 如果用户正在输入文本，不触发快捷键
    if (this._isUserTyping(event.target)) return;
    
    // 获取按键标识符
    const key = this._getKeyIdentifier(event);
    
    // 查找对应的动作
    const action = this.shortcuts[key];
    
    if (action && this.callbacks[action]) {
      // 阻止默认行为
      event.preventDefault();
      
      // 执行回调函数
      this.callbacks[action](event);
      
      console.log(`触发快捷键: ${key} -> ${action}`);
    }
  }

  /**
   * 获取按键标识符
   * @private
   * @param {KeyboardEvent} event - 键盘事件
   * @returns {String} - 按键标识符
   */
  _getKeyIdentifier(event) {
    // 组合键处理
    let identifier = '';
    
    if (event.ctrlKey) identifier += 'Ctrl+';
    if (event.altKey) identifier += 'Alt+';
    if (event.shiftKey) identifier += 'Shift+';
    if (event.metaKey) identifier += 'Meta+'; // Windows键或Mac的Command键
    
    // 添加主键
    if (event.code) {
      identifier += event.code;
    } else {
      // 兼容性处理
      identifier += event.key;
    }
    
    return identifier;
  }

  /**
   * 检查用户是否正在输入文本
   * @private
   * @param {HTMLElement} target - 事件目标元素
   * @returns {Boolean} - 是否正在输入文本
   */
  _isUserTyping(target) {
    // 检查元素是否为输入框、文本区域或可编辑元素
    const isInputElement = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;
    
    return isInputElement;
  }

  /**
   * 获取快捷键帮助信息
   * @returns {Object} - 快捷键帮助信息
   */
  getShortcutsHelp() {
    // 快捷键分类
    const categories = {
      '视频控制': ['togglePlay', 'seekBackward', 'seekForward', 'volumeUp', 'volumeDown', 'toggleMute', 'toggleFullscreen'],
      '字幕控制': ['toggleSubtitle', 'japaneseSubtitle', 'chineseSubtitle', 'dualSubtitle'],
      '互动功能': ['slowReplay', 'pronunciationPractice', 'gapFillingGame'],
      '其他控制': ['closePopup', 'toggleHelp', 'toggleQuickNote']
    };
    
    // 动作描述
    const actionDescriptions = {
      'togglePlay': '播放/暂停',
      'seekBackward': '后退5秒',
      'seekForward': '前进5秒',
      'volumeUp': '增加音量',
      'volumeDown': '减小音量',
      'toggleMute': '静音/取消静音',
      'toggleFullscreen': '全屏/退出全屏',
      'toggleSubtitle': '显示/隐藏字幕',
      'japaneseSubtitle': '仅显示日语字幕',
      'chineseSubtitle': '仅显示中文字幕',
      'dualSubtitle': '显示双语字幕',
      'slowReplay': '慢速复读',
      'pronunciationPractice': '跟读练习',
      'gapFillingGame': '趣味填空游戏',
      'closePopup': '关闭弹出窗口',
      'toggleHelp': '显示/隐藏帮助',
      'toggleQuickNote': '快速笔记'
    };
    
    // 反向映射：动作 -> 按键
    const actionToKey = {};
    for (const [key, action] of Object.entries(this.shortcuts)) {
      actionToKey[action] = key;
    }
    
    // 生成帮助信息
    const help = {};
    
    for (const [category, actions] of Object.entries(categories)) {
      help[category] = actions.map(action => ({
        action,
        description: actionDescriptions[action] || action,
        key: actionToKey[action] || '未设置'
      }));
    }
    
    return help;
  }

  /**
   * 生成快捷键帮助HTML
   * @returns {String} - 快捷键帮助HTML
   */
  generateHelpHTML() {
    const help = this.getShortcutsHelp();
    
    let html = `
      <div class="shortcuts-help">
        <h3>键盘快捷键</h3>
    `;
    
    for (const [category, shortcuts] of Object.entries(help)) {
      html += `
        <div class="shortcuts-category">
          <h4>${category}</h4>
          <table class="shortcuts-table">
            <thead>
              <tr>
                <th>快捷键</th>
                <th>功能</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      shortcuts.forEach(shortcut => {
        html += `
          <tr>
            <td class="shortcut-key">${this._formatKeyForDisplay(shortcut.key)}</td>
            <td class="shortcut-description">${shortcut.description}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    }
    
    html += `
      </div>
    `;
    
    return html;
  }

  /**
   * 格式化按键显示
   * @private
   * @param {String} key - 按键标识符
   * @returns {String} - 格式化后的按键显示
   */
  _formatKeyForDisplay(key) {
    // 替换常见按键为更友好的显示
    return key
      .replace('Space', '空格')
      .replace('ArrowLeft', '←')
      .replace('ArrowRight', '→')
      .replace('ArrowUp', '↑')
      .replace('ArrowDown', '↓')
      .replace('Key', '')
      .replace('Escape', 'ESC')
      .replace('Ctrl+', 'Ctrl + ')
      .replace('Alt+', 'Alt + ')
      .replace('Shift+', 'Shift + ')
      .replace('Meta+', '⌘ + ');
  }

  /**
   * 销毁快捷键管理器
   */
  destroy() {
    if (!this.isInitialized) return;
    
    // 移除键盘事件监听器
    document.removeEventListener('keydown', this._handleKeyDown);
    
    // 清空回调函数
    this.callbacks = {};
    
    this.isInitialized = false;
    console.log('键盘快捷键管理器已销毁');
  }
}

/**
 * 快捷键帮助UI控制器
 * 管理快捷键帮助的用户界面交互
 */
class ShortcutHelpController {
  /**
   * 初始化快捷键帮助控制器
   * @param {Object} options - 配置选项
   * @param {KeyboardShortcutManager} options.shortcutManager - 快捷键管理器
   * @param {String} options.containerSelector - 帮助容器选择器
   */
  constructor(options = {}) {
    this.shortcutManager = options.shortcutManager;
    this.options = {
      containerSelector: options.containerSelector || '#shortcut-help-container'
    };
    
    this.container = null;
    this.isVisible = false;
    this.isInitialized = false;
  }

  /**
   * 初始化控制器
   * @returns {Boolean} - 是否成功初始化
   */
  initialize() {
    if (this.isInitialized) return true;
    
    // 获取帮助容器
    this.container = document.querySelector(this.options.containerSelector);
    
    if (!this.container) {
      // 创建帮助容器
      this.container = document.createElement('div');
      this.container.id = this.options.containerSelector.replace('#', '');
      this.container.className = 'shortcut-help-container';
      this.container.style.display = 'none';
      document.body.appendChild(this.container);
    }
    
    // 注册快捷键回调
    if (this.shortcutManager) {
      this.shortcutManager.registerCallback('toggleHelp', this.toggleHelp.bind(this));
      this.shortcutManager.registerCallback('closePopup', this.hide.bind(this));
    }
    
    this.isInitialized = true;
    console.log('快捷键帮助控制器已初始化');
    return true;
  }

  /**
   * 显示帮助
   */
  show() {
    if (!this.container) return;
    
    // 生成帮助内容
    const helpHTML = this.shortcutManager ? this.shortcutManager.generateHelpHTML() : '未找到快捷键管理器';
    
    // 添加关闭按钮
    const html = `
      <div class="shortcut-help-dialog">
        <div class="shortcut-help-header">
          <h3>键盘快捷键帮助</h3>
          <button class="close-button">×</button>
        </div>
        <div class="shortcut-help-content">
          ${helpHTML}
        </div>
      </div>
    `;
    
    // 更新容器内容
    this.container.innerHTML = html;
    
    // 显示容器
    this.container.style.display = 'flex';
    this.isVisible = true;
    
    // 添加关闭按钮事件监听器
    const closeButton = this.container.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', this.hide.bind(this));
    }
    
    // 添加点击外部关闭事件
    this.container.addEventListener('click', (event) => {
      if (event.target === this.container) {
        this.hide();
      }
    });
  }

  /**
   * 隐藏帮助
   */
  hide() {
    if (!this.container) return;
    
    this.container.style.display = 'none';
    this.isVisible = false;
  }

  /**
   * 切换帮助显示状态
   */
  toggleHelp() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 销毁控制器
   */
  destroy() {
    if (!this.isInitialized) return;
    
    // 移除容器
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.container = null;
    this.isVisible = false;
    this.isInitialized = false;
    
    console.log('快捷键帮助控制器已销毁');
  }
}

// 导出模块
module.exports = {
  KeyboardShortcutManager,
  ShortcutHelpController
};
