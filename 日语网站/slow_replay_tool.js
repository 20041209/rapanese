// 【Anime日语每日课】AI慢速复读功能

/**
 * AI慢速复读功能
 * 一键生成角色台词慢速版音频（保持原声情感）
 */
class SlowReplayGenerator {
  /**
   * 初始化慢速复读生成器
   * @param {Object} options - 配置选项
   * @param {Number} options.defaultSlowRate - 默认减速比例(0.5-0.8)
   * @param {Boolean} options.preserveEmotion - 是否保留情感
   * @param {String} options.apiEndpoint - 语音处理API端点
   */
  constructor(options = {}) {
    this.options = {
      defaultSlowRate: options.defaultSlowRate || 0.7, // 默认减速到70%
      preserveEmotion: options.preserveEmotion !== undefined ? options.preserveEmotion : true,
      apiEndpoint: options.apiEndpoint || '/api/slow-replay'
    };
    
    this.audioContext = null;
    this.isProcessing = false;
    this.cachedAudio = new Map(); // 缓存已处理的音频
  }

  /**
   * 初始化音频上下文
   * @private
   */
  _initAudioContext() {
    if (!this.audioContext) {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        console.log('音频上下文已初始化');
      } catch (error) {
        console.error('初始化音频上下文失败:', error);
        throw new Error('您的浏览器不支持Web Audio API');
      }
    }
  }

  /**
   * 生成慢速复读音频
   * @param {Object} subtitle - 字幕对象
   * @param {Number} slowRate - 减速比例(0.5-0.8)
   * @returns {Promise<Object>} - 处理结果
   */
  async generateSlowReplay(subtitle, slowRate = this.options.defaultSlowRate) {
    if (!subtitle || !subtitle.jp_text) {
      throw new Error('无效的字幕数据');
    }
    
    if (this.isProcessing) {
      throw new Error('正在处理中，请稍后再试');
    }
    
    // 检查缓存
    const cacheKey = `${subtitle.jp_text}_${slowRate}`;
    if (this.cachedAudio.has(cacheKey)) {
      console.log('使用缓存的慢速音频');
      return this.cachedAudio.get(cacheKey);
    }
    
    try {
      this.isProcessing = true;
      
      // 初始化音频上下文
      this._initAudioContext();
      
      // 在实际应用中，这里应该调用AI语音处理API
      // 这里使用模拟实现
      const result = await this._processAudioWithAI(subtitle, slowRate);
      
      // 缓存结果
      this.cachedAudio.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('生成慢速复读失败:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 使用AI处理音频（模拟实现）
   * @private
   * @param {Object} subtitle - 字幕对象
   * @param {Number} slowRate - 减速比例
   * @returns {Promise<Object>} - 处理结果
   */
  async _processAudioWithAI(subtitle, slowRate) {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 在实际应用中，这里应该调用真实的AI语音处理API
    // 返回模拟结果
    return {
      originalText: subtitle.jp_text,
      slowRate: slowRate,
      audioUrl: this._createDummyAudioUrl(subtitle.jp_text, slowRate),
      duration: this._calculateSlowDuration(subtitle.end_time - subtitle.start_time, slowRate),
      preservedEmotion: this.options.preserveEmotion
    };
  }

  /**
   * 创建模拟音频URL（仅用于演示）
   * @private
   * @param {String} text - 文本内容
   * @param {Number} slowRate - 减速比例
   * @returns {String} - 音频URL
   */
  _createDummyAudioUrl(text, slowRate) {
    // 在实际应用中，这里应该返回真实的音频URL
    // 这里返回一个模拟URL
    return `/api/audio/slow-replay?text=${encodeURIComponent(text)}&rate=${slowRate}&timestamp=${Date.now()}`;
  }

  /**
   * 计算减速后的音频时长
   * @private
   * @param {Number} originalDuration - 原始时长
   * @param {Number} slowRate - 减速比例
   * @returns {Number} - 减速后的时长
   */
  _calculateSlowDuration(originalDuration, slowRate) {
    return originalDuration / slowRate;
  }

  /**
   * 播放慢速音频
   * @param {String} audioUrl - 音频URL
   * @returns {Promise<void>}
   */
  async playSlowAudio(audioUrl) {
    if (!audioUrl) {
      throw new Error('无效的音频URL');
    }
    
    try {
      // 创建音频元素
      const audio = new Audio(audioUrl);
      
      // 播放音频
      await audio.play();
      
      return new Promise((resolve) => {
        audio.onended = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('播放慢速音频失败:', error);
      throw error;
    }
  }

  /**
   * 使用Web Speech API生成语音（备选方案）
   * @param {String} text - 文本内容
   * @param {Number} rate - 语速(0.1-1.0)
   * @returns {Promise<void>}
   */
  speakWithWebSpeech(text, rate = 0.7) {
    if (!text) {
      throw new Error('无效的文本内容');
    }
    
    return new Promise((resolve, reject) => {
      // 检查浏览器是否支持Web Speech API
      if (!window.speechSynthesis) {
        reject(new Error('您的浏览器不支持Web Speech API'));
        return;
      }
      
      // 创建语音合成实例
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 设置语音参数
      utterance.lang = 'ja-JP'; // 日语
      utterance.rate = rate; // 语速
      utterance.pitch = 1.0; // 音调
      
      // 设置回调
      utterance.onend = () => {
        resolve();
      };
      
      utterance.onerror = (event) => {
        reject(new Error(`语音合成失败: ${event.error}`));
      };
      
      // 开始语音合成
      window.speechSynthesis.speak(utterance);
    });
  }
}

/**
 * AI慢速复读UI控制器
 * 管理慢速复读功能的用户界面交互
 */
class SlowReplayController {
  /**
   * 初始化慢速复读控制器
   * @param {Object} options - 配置选项
   * @param {SlowReplayGenerator} options.generator - 慢速复读生成器
   * @param {String} options.buttonSelector - 慢速复读按钮选择器
   * @param {String} options.progressSelector - 进度指示器选择器
   */
  constructor(options = {}) {
    this.generator = options.generator || new SlowReplayGenerator();
    this.options = {
      buttonSelector: options.buttonSelector || '#slow-replay-button',
      progressSelector: options.progressSelector || '#slow-replay-progress'
    };
    
    this.currentSubtitle = null;
    this.isInitialized = false;
  }

  /**
   * 初始化控制器
   */
  initialize() {
    if (this.isInitialized) return;
    
    // 获取UI元素
    this.button = document.querySelector(this.options.buttonSelector);
    this.progress = document.querySelector(this.options.progressSelector);
    
    if (!this.button) {
      console.error('未找到慢速复读按钮元素');
      return;
    }
    
    // 添加事件监听器
    this.button.addEventListener('click', this._handleButtonClick.bind(this));
    
    this.isInitialized = true;
    console.log('慢速复读控制器已初始化');
  }

  /**
   * 设置当前字幕
   * @param {Object} subtitle - 字幕对象
   */
  setCurrentSubtitle(subtitle) {
    this.currentSubtitle = subtitle;
    
    // 更新按钮状态
    this._updateButtonState();
  }

  /**
   * 处理按钮点击事件
   * @private
   * @param {Event} event - 点击事件
   */
  async _handleButtonClick(event) {
    event.preventDefault();
    
    if (!this.currentSubtitle) {
      console.warn('没有可用的字幕');
      return;
    }
    
    try {
      // 更新UI状态为处理中
      this._setProcessingState(true);
      
      // 生成慢速复读
      const result = await this.generator.generateSlowReplay(this.currentSubtitle);
      
      // 播放慢速音频
      await this.generator.playSlowAudio(result.audioUrl);
      
      // 更新UI状态为完成
      this._setCompletedState();
    } catch (error) {
      console.error('慢速复读失败:', error);
      
      // 尝试使用Web Speech API作为备选方案
      try {
        await this.generator.speakWithWebSpeech(this.currentSubtitle.jp_text);
      } catch (speechError) {
        console.error('Web Speech API失败:', speechError);
        this._setErrorState(error.message);
      }
    } finally {
      // 恢复UI状态
      setTimeout(() => {
        this._setProcessingState(false);
      }, 1000);
    }
  }

  /**
   * 更新按钮状态
   * @private
   */
  _updateButtonState() {
    if (!this.button) return;
    
    // 如果有当前字幕，启用按钮
    if (this.currentSubtitle) {
      this.button.disabled = false;
      this.button.title = '点击生成慢速复读';
    } else {
      this.button.disabled = true;
      this.button.title = '没有可用的字幕';
    }
  }

  /**
   * 设置处理中状态
   * @private
   * @param {Boolean} isProcessing - 是否处理中
   */
  _setProcessingState(isProcessing) {
    if (!this.button) return;
    
    if (isProcessing) {
      this.button.disabled = true;
      this.button.classList.add('processing');
      this.button.innerHTML = '<span class="spinner"></span> 处理中...';
      
      // 显示进度指示器
      if (this.progress) {
        this.progress.style.display = 'block';
        this.progress.innerHTML = '正在生成慢速复读...';
      }
    } else {
      this.button.disabled = false;
      this.button.classList.remove('processing');
      this.button.innerHTML = '慢速复读';
      
      // 隐藏进度指示器
      if (this.progress) {
        this.progress.style.display = 'none';
      }
    }
  }

  /**
   * 设置完成状态
   * @private
   */
  _setCompletedState() {
    if (!this.button) return;
    
    this.button.classList.add('completed');
    this.button.innerHTML = '✓ 播放完成';
    
    // 显示完成消息
    if (this.progress) {
      this.progress.innerHTML = '慢速复读已完成';
      this.progress.classList.add('completed');
    }
    
    // 3秒后恢复正常状态
    setTimeout(() => {
      this.button.classList.remove('completed');
      this.button.innerHTML = '慢速复读';
      
      if (this.progress) {
        this.progress.classList.remove('completed');
        this.progress.style.display = 'none';
      }
    }, 3000);
  }

  /**
   * 设置错误状态
   * @private
   * @param {String} errorMessage - 错误消息
   */
  _setErrorState(errorMessage) {
    if (!this.button) return;
    
    this.button.classList.add('error');
    this.button.innerHTML = '✗ 生成失败';
    
    // 显示错误消息
    if (this.progress) {
      this.progress.innerHTML = `错误: ${errorMessage}`;
      this.progress.classList.add('error');
    }
    
    // 3秒后恢复正常状态
    setTimeout(() => {
      this.button.classList.remove('error');
      this.button.innerHTML = '慢速复读';
      
      if (this.progress) {
        this.progress.classList.remove('error');
        this.progress.style.display = 'none';
      }
    }, 3000);
  }

  /**
   * 销毁控制器
   */
  destroy() {
    if (!this.isInitialized) return;
    
    // 移除事件监听器
    if (this.button) {
      this.button.removeEventListener('click', this._handleButtonClick);
    }
    
    this.button = null;
    this.progress = null;
    this.currentSubtitle = null;
    this.isInitialized = false;
    
    console.log('慢速复读控制器已销毁');
  }
}

// 导出模块
module.exports = {
  SlowReplayGenerator,
  SlowReplayController
};
