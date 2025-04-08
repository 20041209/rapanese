// 【Anime日语每日课】跟读打分系统

/**
 * 跟读打分系统
 * 录音后AI用表情符号反馈发音（😊→优秀 / 🤔→需练习）
 */
class PronunciationScorer {
  /**
   * 初始化跟读打分系统
   * @param {Object} options - 配置选项
   * @param {String} options.apiEndpoint - 语音评分API端点
   * @param {Number} options.recordingDuration - 录音时长（秒）
   * @param {Boolean} options.useEmoji - 是否使用表情符号反馈
   */
  constructor(options = {}) {
    this.options = {
      apiEndpoint: options.apiEndpoint || '/api/pronunciation-score',
      recordingDuration: options.recordingDuration || 5,
      useEmoji: options.useEmoji !== undefined ? options.useEmoji : true
    };
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.originalAudio = null;
    this.currentText = '';
  }

  /**
   * 初始化录音功能
   * @returns {Promise<Boolean>} - 是否成功初始化
   */
  async initialize() {
    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 创建MediaRecorder实例
      this.mediaRecorder = new MediaRecorder(stream);
      
      // 设置数据可用事件处理
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // 设置录音停止事件处理
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        console.log('录音已停止');
      };
      
      console.log('跟读打分系统已初始化');
      return true;
    } catch (error) {
      console.error('初始化录音功能失败:', error);
      return false;
    }
  }

  /**
   * 设置原始音频和文本
   * @param {String} audioUrl - 原始音频URL
   * @param {String} text - 日语文本
   */
  setOriginalContent(audioUrl, text) {
    this.originalAudio = audioUrl;
    this.currentText = text;
  }

  /**
   * 开始录音
   * @param {Number} duration - 录音时长（秒）
   * @returns {Promise<void>}
   */
  startRecording(duration = this.options.recordingDuration) {
    if (!this.mediaRecorder) {
      throw new Error('录音功能未初始化');
    }
    
    if (this.isRecording) {
      throw new Error('正在录音中');
    }
    
    // 清空之前的录音数据
    this.audioChunks = [];
    
    // 开始录音
    this.mediaRecorder.start();
    this.isRecording = true;
    
    console.log(`开始录音，时长 ${duration} 秒`);
    
    // 设置定时器，在指定时长后停止录音
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
        resolve();
      }, duration * 1000);
    });
  }

  /**
   * 停止录音
   */
  stopRecording() {
    if (!this.isRecording) {
      return;
    }
    
    this.mediaRecorder.stop();
  }

  /**
   * 获取录音数据
   * @returns {Blob} - 录音数据Blob
   */
  getRecordingBlob() {
    if (this.audioChunks.length === 0) {
      throw new Error('没有录音数据');
    }
    
    return new Blob(this.audioChunks, { type: 'audio/webm' });
  }

  /**
   * 播放录音
   * @returns {Promise<void>}
   */
  async playRecording() {
    const blob = this.getRecordingBlob();
    const url = URL.createObjectURL(blob);
    
    const audio = new Audio(url);
    
    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.play();
    });
  }

  /**
   * 评分发音
   * @returns {Promise<Object>} - 评分结果
   */
  async scorePronunciation() {
    if (this.audioChunks.length === 0) {
      throw new Error('没有录音数据');
    }
    
    if (!this.currentText) {
      throw new Error('没有参考文本');
    }
    
    try {
      // 获取录音数据
      const blob = this.getRecordingBlob();
      
      // 在实际应用中，这里应该调用AI语音评分API
      // 这里使用模拟实现
      const result = await this._sendToScoringAPI(blob, this.currentText);
      
      return result;
    } catch (error) {
      console.error('评分发音失败:', error);
      throw error;
    }
  }

  /**
   * 发送到评分API（模拟实现）
   * @private
   * @param {Blob} audioBlob - 录音数据
   * @param {String} referenceText - 参考文本
   * @returns {Promise<Object>} - 评分结果
   */
  async _sendToScoringAPI(audioBlob, referenceText) {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 在实际应用中，这里应该调用真实的AI语音评分API
    // 这里返回模拟结果
    
    // 随机生成评分（60-100）
    const overallScore = Math.floor(Math.random() * 41) + 60;
    
    // 根据总分确定表情符号
    let emoji = '😐';
    if (overallScore >= 90) {
      emoji = '😊';
    } else if (overallScore >= 75) {
      emoji = '🙂';
    } else if (overallScore < 70) {
      emoji = '🤔';
    }
    
    // 生成详细评分
    const detailedScores = {
      pronunciation: Math.floor(Math.random() * 41) + 60,
      intonation: Math.floor(Math.random() * 41) + 60,
      rhythm: Math.floor(Math.random() * 41) + 60,
      fluency: Math.floor(Math.random() * 41) + 60
    };
    
    // 生成改进建议
    const suggestions = [];
    if (detailedScores.pronunciation < 75) {
      suggestions.push('注意发音清晰度，特别是长音和促音的区别');
    }
    if (detailedScores.intonation < 75) {
      suggestions.push('注意语调起伏，日语句尾通常有下降的语调');
    }
    if (detailedScores.rhythm < 75) {
      suggestions.push('注意语音节奏，保持平稳的速度');
    }
    if (detailedScores.fluency < 75) {
      suggestions.push('尝试更流畅地连读单词，减少停顿');
    }
    
    return {
      overallScore,
      detailedScores,
      emoji: this.options.useEmoji ? emoji : null,
      suggestions,
      referenceText
    };
  }

  /**
   * 获取表情符号反馈
   * @param {Number} score - 评分
   * @returns {String} - 表情符号
   */
  getEmojiForScore(score) {
    if (score >= 90) return '😊';
    if (score >= 80) return '🙂';
    if (score >= 70) return '😐';
    if (score >= 60) return '🤔';
    return '😢';
  }

  /**
   * 获取文字反馈
   * @param {Number} score - 评分
   * @returns {String} - 文字反馈
   */
  getFeedbackForScore(score) {
    if (score >= 90) return '太棒了！你的发音非常标准！';
    if (score >= 80) return '很好！你的发音相当不错。';
    if (score >= 70) return '不错！继续练习可以更好。';
    if (score >= 60) return '需要更多练习，但已经有进步了。';
    return '继续努力，多听多练习。';
  }

  /**
   * 销毁录音功能
   */
  destroy() {
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      // 停止所有音轨
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.originalAudio = null;
    this.currentText = '';
    
    console.log('跟读打分系统已销毁');
  }
}

/**
 * 跟读打分UI控制器
 * 管理跟读打分功能的用户界面交互
 */
class PronunciationScorerController {
  /**
   * 初始化跟读打分控制器
   * @param {Object} options - 配置选项
   * @param {PronunciationScorer} options.scorer - 跟读打分系统
   * @param {String} options.buttonSelector - 跟读按钮选择器
   * @param {String} options.resultSelector - 结果显示区域选择器
   * @param {String} options.countdownSelector - 倒计时显示区域选择器
   */
  constructor(options = {}) {
    this.scorer = options.scorer || new PronunciationScorer();
    this.options = {
      buttonSelector: options.buttonSelector || '#pronunciation-button',
      resultSelector: options.resultSelector || '#pronunciation-result',
      countdownSelector: options.countdownSelector || '#pronunciation-countdown'
    };
    
    this.currentSubtitle = null;
    this.isInitialized = false;
  }

  /**
   * 初始化控制器
   * @returns {Promise<Boolean>} - 是否成功初始化
   */
  async initialize() {
    if (this.isInitialized) return true;
    
    // 获取UI元素
    this.button = document.querySelector(this.options.buttonSelector);
    this.resultArea = document.querySelector(this.options.resultSelector);
    this.countdownArea = document.querySelector(this.options.countdownSelector);
    
    if (!this.button) {
      console.error('未找到跟读按钮元素');
      return false;
    }
    
    // 初始化跟读打分系统
    const initialized = await this.scorer.initialize();
    if (!initialized) {
      console.error('初始化跟读打分系统失败');
      this._setErrorState('无法访问麦克风');
      return false;
    }
    
    // 添加事件监听器
    this.button.addEventListener('click', this._handleButtonClick.bind(this));
    
    this.isInitialized = true;
    console.log('跟读打分控制器已初始化');
    return true;
  }

  /**
   * 设置当前字幕
   * @param {Object} subtitle - 字幕对象
   * @param {String} audioUrl - 原始音频URL
   */
  setCurrentSubtitle(subtitle, audioUrl) {
    this.currentSubtitle = subtitle;
    
    if (subtitle && audioUrl) {
      this.scorer.setOriginalContent(audioUrl, subtitle.jp_text);
    }
    
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
      // 更新UI状态为准备录音
      this._setRecordingPrepareState();
      
      // 显示倒计时
      await this._showCountdown(3);
      
      // 更新UI状态为录音中
      this._setRecordingState();
      
      // 开始录音
      await this.scorer.startRecording();
      
      // 更新UI状态为处理中
      this._setProcessingState();
      
      // 评分发音
      const result = await this.scorer.scorePronunciation();
      
      // 显示结果
      this._showResult(result);
      
      // 更新UI状态为完成
      this._setCompletedState();
    } catch (error) {
      console.error('跟读打分失败:', error);
      this._setErrorState(error.message);
    }
  }

  /**
   * 显示倒计时
   * @private
   * @param {Number} seconds - 倒计时秒数
   * @returns {Promise<void>}
   */
  async _showCountdown(seconds) {
    if (!this.countdownArea) return;
    
    this.countdownArea.style.display = 'block';
    
    for (let i = seconds; i > 0; i--) {
      this.countdownArea.innerHTML = `准备录音... ${i}`;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.countdownArea.innerHTML = '开始!';
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.countdownArea.style.display = 'none';
  }

  /**
   * 显示结果
   * @private
   * @param {Object} result - 评分结果
   */
  _showResult(result) {
    if (!this.resultArea) return;
    
    // 构建结果HTML
    let html = `
      <div class="pronunciation-score-card">
        <div class="score-header">
          <div class="overall-score">${result.overallScore}</div>
          <div class="score-emoji">${result.emoji}</div>
        </div>
        <div class="score-feedback">
          ${this.scorer.getFeedbackForScore(result.overallScore)}
        </div>
        <div class="detailed-scores">
          <div class="score-item">
            <div class="score-label">发音</div>
            <div class="score-value">${result.detailedScores.pronunciation}</div>
          </div>
          <div class="score-item">
            <div class="score-label">语调</div>
            <div class="score-value">${result.detailedScores.intonation}</div>
          </div>
          <div class="score-item">
            <div class="score-label">节奏</div>
            <div class="score-value">${result.detailedScores.rhythm}</div>
          </div>
          <div class="score-item">
            <div class="score-label">流畅度</div>
            <div class="score-value">${result.detailedScores.fluency}</div>
          </div>
        </div>
    `;
    
    // 添加改进建议
    if (result.suggestions && result.suggestions.length > 0) {
      html += '<div class="improvement-suggestions"><h4>改进建议:</h4><ul>';
      
      result.suggestions.forEach(suggestion => {
        html += `<li>${suggestion}</li>`;
      });
      
      html += '</ul></div>';
    }
    
    html += `
        <div class="action-buttons">
          <button class="play-recording-button">播放我的录音</button>
          <button class="try-again-button">再试一次</button>
        </div>
      </div>
    `;
    
    // 更新结果区域
    this.resultArea.innerHTML = html;
    this.resultArea.style.display = 'block';
    
    // 添加按钮事件监听器
    const playButton = this.resultArea.querySelector('.play-recording-button');
    const tryAgainButton = this.resultArea.querySelector('.try-again-button');
    
    if (playButton) {
      playButton.addEventListener('click', async () => {
        try {
          await this.scorer.playRecording();
        } catch (error) {
          console.error('播放录音失败:', error);
        }
      });
    }
    
    if (tryAgainButton) {
      tryAgainButton.addEventListener('click', () => {
        this.resultArea.style.display = 'none';
        this._updateButtonState();
      });
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
      this.button.title = '点击开始跟读';
    } else {
      this.button.disabled = true;
      this.button.title = '没有可用的字幕';
    }
    
    this.button.innerHTML = '跟读打分';
    this.button.className = 'pronunciation-button';
  }

  /**
   * 设置准备录音状态
   * @private
   */
  _setRecordingPrepareState() {
    if (!this.button) return;
    
    this.button.disabled = true;
    this.button.innerHTML = '准备录音...';
    this.button.className = 'pronunciation-button preparing';
    
    // 隐藏结果区域
    if (this.resultArea) {
      this.resultArea.style.display = 'none';
    }
  }

  /**
   * 设置录音中状态
   * @private
   */
  _setRecordingState() {
    if (!this.button) return;
    
    this.button.disabled = true;
    this.button.innerHTML = '<span class="recording-indicator"></span> 录音中...';
    this.button.className = 'pronunciation-button recording';
  }

  /**
   * 设置处理中状态
   * @private
   */
  _setProcessingState() {
    if (!this.button) return;
    
    this.button.disabled = true;
    this.button.innerHTML = '<span class="spinner"></span> 评分中...';
    this.button.className = 'pronunciation-button processing';
  }

  /**
   * 设置完成状态
   * @private
   */
  _setCompletedState() {
    if (!this.button) return;
    
    this.button.disabled = false;
    this.button.innerHTML = '再次跟读';
    this.button.className = 'pronunciation-button';
  }

  /**
   * 设置错误状态
   * @private
   * @param {String} errorMessage - 错误消息
   */
  _setErrorState(errorMessage) {
    if (!this.button) return;
    
    this.button.disabled = false;
    this.button.innerHTML = '跟读打分';
    this.button.className = 'pronunciation-button error';
    this.button.title = `错误: ${errorMessage}`;
    
    // 显示错误消息
    if (this.resultArea) {
      this.resultArea.innerHTML = `
        <div class="error-message">
          <p>😢 很抱歉，发生了错误:</p>
          <p>${errorMessage}</p>
          <button class="try-again-button">重试</button>
        </div>
      `;
      this.resultArea.style.display = 'block';
      
      // 添加重试按钮事件监听器
      const tryAgainButton = this.resultArea.querySelector('.try-again-button');
      if (tryAgainButton) {
        tryAgainButton.addEventListener('click', () => {
          this.resultArea.style.display = 'none';
          this._updateButtonState();
        });
      }
    }
  }

  /**
   * 销毁控制器
   */
  destroy() {
    if (!this.isInitialized) return;
    
    // 销毁跟读打分系统
    this.scorer.destroy();
    
    // 移除事件监听器
    if (this.button) {
      this.button.removeEventListener('click', this._handleButtonClick);
    }
    
    this.button = null;
    this.resultArea = null;
    this.countdownArea = null;
    this.currentSubtitle = null;
    this.isInitialized = false;
    
    console.log('跟读打分控制器已销毁');
  }
}

// 导出模块
module.exports = {
  PronunciationScorer,
  PronunciationScorerController
};
