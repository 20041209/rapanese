// 【Anime日语每日课】双语字幕生成器

/**
 * 双语字幕生成器
 * 为动漫片段生成可切换的双语字幕，支持假名注音和语法高亮
 */
class SubtitleGenerator {
  /**
   * 初始化字幕生成器
   * @param {Object} options - 配置选项
   * @param {String} options.defaultMode - 默认字幕模式 (jp|cn|dual|none)
   * @param {Boolean} options.showFurigana - 是否显示假名注音
   * @param {Boolean} options.highlightGrammar - 是否高亮语法点
   */
  constructor(options = {}) {
    this.options = {
      defaultMode: options.defaultMode || 'dual',
      showFurigana: options.showFurigana !== undefined ? options.showFurigana : true,
      highlightGrammar: options.highlightGrammar !== undefined ? options.highlightGrammar : true
    };
  }

  /**
   * 生成字幕轨道
   * @param {Array} subtitles - 字幕数据数组
   * @param {Object} grammarPoints - 语法点数据对象
   * @returns {Object} - 包含不同格式字幕轨道的对象
   */
  generateSubtitleTracks(subtitles, grammarPoints = {}) {
    if (!subtitles || subtitles.length === 0) {
      return {
        vtt: {
          jp: '',
          cn: '',
          dual: ''
        },
        html: {
          jp: '',
          cn: '',
          dual: ''
        }
      };
    }

    // 生成VTT格式字幕（用于视频播放器）
    const vttJp = this._generateVTT(subtitles, 'jp');
    const vttCn = this._generateVTT(subtitles, 'cn');
    const vttDual = this._generateVTT(subtitles, 'dual');

    // 生成HTML格式字幕（用于交互式显示）
    const htmlJp = this._generateHTML(subtitles, 'jp', grammarPoints);
    const htmlCn = this._generateHTML(subtitles, 'cn', grammarPoints);
    const htmlDual = this._generateHTML(subtitles, 'dual', grammarPoints);

    return {
      vtt: {
        jp: vttJp,
        cn: vttCn,
        dual: vttDual
      },
      html: {
        jp: htmlJp,
        cn: htmlCn,
        dual: htmlDual
      }
    };
  }

  /**
   * 生成VTT格式字幕
   * @private
   * @param {Array} subtitles - 字幕数据数组
   * @param {String} mode - 字幕模式 (jp|cn|dual)
   * @returns {String} - VTT格式字幕内容
   */
  _generateVTT(subtitles, mode) {
    let vtt = 'WEBVTT\n\n';

    subtitles.forEach((subtitle, index) => {
      const startTime = this._formatVTTTime(subtitle.start_time);
      const endTime = this._formatVTTTime(subtitle.end_time);
      
      vtt += `${index + 1}\n`;
      vtt += `${startTime} --> ${endTime}\n`;
      
      if (mode === 'jp' || mode === 'dual') {
        vtt += `${subtitle.jp_text}\n`;
      }
      
      if (mode === 'cn' || mode === 'dual') {
        if (mode === 'dual') {
          vtt += `${subtitle.cn_text}\n\n`;
        } else {
          vtt += `${subtitle.cn_text}\n\n`;
        }
      } else {
        vtt += '\n';
      }
    });

    return vtt;
  }

  /**
   * 格式化时间为VTT格式
   * @private
   * @param {Number} seconds - 秒数
   * @returns {String} - 格式化的时间字符串 (00:00:00.000)
   */
  _formatVTTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }

  /**
   * 生成HTML格式字幕（用于交互式显示）
   * @private
   * @param {Array} subtitles - 字幕数据数组
   * @param {String} mode - 字幕模式 (jp|cn|dual)
   * @param {Object} grammarPoints - 语法点数据对象
   * @returns {String} - HTML格式字幕内容
   */
  _generateHTML(subtitles, mode, grammarPoints) {
    let html = '';

    subtitles.forEach((subtitle, index) => {
      html += `<div class="subtitle-item" data-start="${subtitle.start_time}" data-end="${subtitle.end_time}">\n`;
      
      if (mode === 'jp' || mode === 'dual') {
        // 处理日语字幕，添加假名和语法高亮
        const processedJpText = this._processJapaneseText(subtitle.jp_text, subtitle.grammar_points, grammarPoints);
        html += `  <div class="subtitle-jp">${processedJpText}</div>\n`;
      }
      
      if (mode === 'cn' || mode === 'dual') {
        html += `  <div class="subtitle-cn">${subtitle.cn_text}</div>\n`;
      }
      
      html += `</div>\n`;
    });

    return html;
  }

  /**
   * 处理日语文本，添加假名和语法高亮
   * @private
   * @param {String} text - 原始日语文本
   * @param {Array} grammarPointsInText - 文本中包含的语法点
   * @param {Object} grammarPointsData - 语法点数据对象
   * @returns {String} - 处理后的HTML文本
   */
  _processJapaneseText(text, grammarPointsInText = [], grammarPointsData = {}) {
    // 这里简化处理，实际实现需要分词和假名注音处理
    // 在实际应用中，可以使用如kuromoji.js等库进行日语分词
    
    let processedText = text;
    
    // 如果启用语法高亮，为语法点添加高亮
    if (this.options.highlightGrammar && grammarPointsInText && grammarPointsInText.length > 0) {
      // 简化示例：实际实现需要更复杂的文本分析
      grammarPointsInText.forEach(grammarPoint => {
        // 查找语法点相关的关键词或模式
        const patterns = this._getGrammarPatterns(grammarPoint, grammarPointsData);
        
        patterns.forEach(pattern => {
          // 使用正则表达式替换，添加高亮标记
          const regex = new RegExp(`(${pattern})`, 'g');
          processedText = processedText.replace(regex, '<span class="grammar-highlight" data-grammar="' + grammarPoint + '">$1</span>');
        });
      });
    }
    
    // 如果启用假名显示，为需要注音的词添加假名
    // 这里仅作示例，实际实现需要使用词典和分词技术
    if (this.options.showFurigana) {
      // 示例：将一些常见词替换为带假名的形式
      const furiganaMap = {
        '学校': '<ruby>学校<rt>がっこう</rt></ruby>',
        '先生': '<ruby>先生<rt>せんせい</rt></ruby>',
        '勉強': '<ruby>勉強<rt>べんきょう</rt></ruby>',
        '日本語': '<ruby>日本語<rt>にほんご</rt></ruby>',
        '私': '<ruby>私<rt>わたし</rt></ruby>',
        '彼': '<ruby>彼<rt>かれ</rt></ruby>',
        '彼女': '<ruby>彼女<rt>かのじょ</rt></ruby>',
        '友達': '<ruby>友達<rt>ともだち</rt></ruby>'
      };
      
      // 替换已知词汇
      Object.keys(furiganaMap).forEach(word => {
        const regex = new RegExp(word, 'g');
        processedText = processedText.replace(regex, furiganaMap[word]);
      });
    }
    
    return processedText;
  }

  /**
   * 获取语法点相关的模式
   * @private
   * @param {String} grammarPoint - 语法点名称
   * @param {Object} grammarPointsData - 语法点数据对象
   * @returns {Array} - 相关模式数组
   */
  _getGrammarPatterns(grammarPoint, grammarPointsData) {
    // 默认模式
    const defaultPatterns = {
      '被动形': ['れる', 'られる', 'される', 'れた', 'られた', 'された'],
      '敬语': ['です', 'ます', 'ございます', 'いらっしゃる', 'おっしゃる'],
      '使役形': ['させる', 'させられる', 'させた', 'させられた'],
      '条件形': ['たら', 'れば', 'なら', 'と'],
      '授受表现': ['あげる', 'くれる', 'もらう', 'いただく']
    };
    
    // 如果有详细的语法点数据，使用它
    if (grammarPointsData && grammarPointsData[grammarPoint] && grammarPointsData[grammarPoint].patterns) {
      return grammarPointsData[grammarPoint].patterns;
    }
    
    // 否则使用默认模式
    return defaultPatterns[grammarPoint] || [];
  }
}

/**
 * 字幕同步器
 * 负责在视频播放过程中同步显示字幕
 */
class SubtitleSynchronizer {
  /**
   * 初始化字幕同步器
   * @param {Object} options - 配置选项
   * @param {String} options.subtitleContainerId - 字幕容器元素ID
   * @param {String} options.videoElementId - 视频元素ID
   */
  constructor(options = {}) {
    this.options = options;
    this.currentSubtitleIndex = -1;
    this.subtitles = [];
    this.isActive = false;
  }

  /**
   * 加载字幕数据
   * @param {Array} subtitles - 字幕数据数组
   */
  loadSubtitles(subtitles) {
    this.subtitles = subtitles || [];
    this.currentSubtitleIndex = -1;
  }

  /**
   * 开始字幕同步
   * @param {HTMLVideoElement} videoElement - 视频元素
   */
  start(videoElement) {
    if (!videoElement) {
      console.error('视频元素不存在');
      return;
    }

    this.videoElement = videoElement;
    this.isActive = true;

    // 监听视频时间更新事件
    this.videoElement.addEventListener('timeupdate', this._onTimeUpdate.bind(this));
    this.videoElement.addEventListener('seeking', this._onSeeking.bind(this));
    this.videoElement.addEventListener('pause', this._onPause.bind(this));
    this.videoElement.addEventListener('play', this._onPlay.bind(this));
  }

  /**
   * 停止字幕同步
   */
  stop() {
    if (!this.videoElement) return;

    this.isActive = false;
    this.videoElement.removeEventListener('timeupdate', this._onTimeUpdate);
    this.videoElement.removeEventListener('seeking', this._onSeeking);
    this.videoElement.removeEventListener('pause', this._onPause);
    this.videoElement.removeEventListener('play', this._onPlay);
    
    this.videoElement = null;
    this.currentSubtitleIndex = -1;
  }

  /**
   * 视频时间更新事件处理
   * @private
   */
  _onTimeUpdate() {
    if (!this.isActive || !this.videoElement) return;

    const currentTime = this.videoElement.currentTime;
    this._updateSubtitle(currentTime);
  }

  /**
   * 视频跳转事件处理
   * @private
   */
  _onSeeking() {
    if (!this.isActive || !this.videoElement) return;

    const currentTime = this.videoElement.currentTime;
    this._updateSubtitle(currentTime);
  }

  /**
   * 视频暂停事件处理
   * @private
   */
  _onPause() {
    // 可以添加暂停时的特殊处理
  }

  /**
   * 视频播放事件处理
   * @private
   */
  _onPlay() {
    if (!this.isActive || !this.videoElement) return;

    const currentTime = this.videoElement.currentTime;
    this._updateSubtitle(currentTime);
  }

  /**
   * 更新当前字幕
   * @private
   * @param {Number} currentTime - 当前视频时间
   */
  _updateSubtitle(currentTime) {
    // 查找当前时间对应的字幕
    let newSubtitleIndex = -1;

    for (let i = 0; i < this.subtitles.length; i++) {
      const subtitle = this.subtitles[i];
      if (currentTime >= subtitle.start_time && currentTime <= subtitle.end_time) {
        newSubtitleIndex = i;
        break;
      }
    }

    // 如果字幕索引变化，更新显示
    if (newSubtitleIndex !== this.currentSubtitleIndex) {
      this.currentSubtitleIndex = newSubtitleIndex;
      this._renderSubtitle();
    }
  }

  /**
   * 渲染当前字幕
   * @private
   */
  _renderSubtitle() {
    const subtitleContainer = document.getElementById(this.options.subtitleContainerId);
    if (!subtitleContainer) return;

    // 清空当前字幕
    subtitleContainer.innerHTML = '';

    // 如果有当前字幕，显示它
    if (this.currentSubtitleIndex >= 0 && this.currentSubtitleIndex < this.subtitles.length) {
      const subtitle = this.subtitles[this.currentSubtitleIndex];
      
      // 创建字幕元素
      const subtitleElement = document.createElement('div');
      subtitleElement.className = 'active-subtitle';
      
      // 根据当前字幕模式显示内容
      const subtitleMode = this._getCurrentSubtitleMode();
      
      if (subtitleMode === 'jp' || subtitleMode === 'dual') {
        const jpElement = document.createElement('div');
        jpElement.className = 'subtitle-jp';
        jpElement.innerHTML = subtitle.jp_html || subtitle.jp_text;
        subtitleElement.appendChild(jpElement);
      }
      
      if (subtitleMode === 'cn' || subtitleMode === 'dual') {
        const cnElement = document.createElement('div');
        cnElement.className = 'subtitle-cn';
        cnElement.textContent = subtitle.cn_text;
        subtitleElement.appendChild(cnElement);
      }
      
      subtitleContainer.appendChild(subtitleElement);
    }
  }

  /**
   * 获取当前字幕模式
   * @private
   * @returns {String} - 字幕模式 (jp|cn|dual|none)
   */
  _getCurrentSubtitleMode() {
    // 从本地存储或全局设置中获取当前字幕模式
    // 这里简化处理，实际应用中可能需要从用户设置中获取
    return localStorage.getItem('subtitleMode') || 'dual';
  }

  /**
   * 切换字幕模式
   * @param {String} mode - 字幕模式 (jp|cn|dual|none)
   */
  changeSubtitleMode(mode) {
    if (['jp', 'cn', 'dual', 'none'].includes(mode)) {
      localStorage.setItem('subtitleMode', mode);
      this._renderSubtitle(); // 重新渲染当前字幕
    }
  }
}

// 导出模块
module.exports = {
  SubtitleGenerator,
  SubtitleSynchronizer
};
