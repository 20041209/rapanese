// 【Anime日语每日课】趣味填空游戏

/**
 * 趣味填空游戏
 * 隐藏片段中3个关键词，根据上下文选择正确答案（错误选项含典型干扰项）
 */
class GapFillingGame {
  /**
   * 初始化趣味填空游戏
   * @param {Object} options - 配置选项
   * @param {Number} options.gapCount - 填空数量
   * @param {Number} options.optionCount - 每题选项数量
   * @param {String} options.difficulty - 难度级别(easy|normal|hard)
   */
  constructor(options = {}) {
    this.options = {
      gapCount: options.gapCount || 3,
      optionCount: options.optionCount || 4,
      difficulty: options.difficulty || 'normal'
    };
    
    this.currentSubtitle = null;
    this.questions = [];
    this.userAnswers = [];
    this.score = 0;
  }

  /**
   * 设置当前字幕
   * @param {Object} subtitle - 字幕对象
   */
  setSubtitle(subtitle) {
    this.currentSubtitle = subtitle;
    this.questions = [];
    this.userAnswers = [];
    this.score = 0;
  }

  /**
   * 生成填空题
   * @returns {Array} - 填空题数组
   */
  generateQuestions() {
    if (!this.currentSubtitle || !this.currentSubtitle.jp_text) {
      throw new Error('没有可用的字幕');
    }
    
    // 分析字幕文本
    const words = this._analyzeText(this.currentSubtitle.jp_text);
    
    // 选择关键词作为填空
    const keyWords = this._selectKeyWords(words);
    
    // 为每个关键词生成问题
    this.questions = keyWords.map((word, index) => {
      // 生成干扰选项
      const distractors = this._generateDistractors(word);
      
      // 创建选项数组（包含正确答案）
      const options = [word.text, ...distractors];
      
      // 打乱选项顺序
      this._shuffleArray(options);
      
      // 创建问题对象
      return {
        id: index + 1,
        text: this._createQuestionText(this.currentSubtitle.jp_text, word.text),
        correctAnswer: word.text,
        options: options,
        explanation: this._generateExplanation(word)
      };
    });
    
    return this.questions;
  }

  /**
   * 分析文本，提取单词及其属性
   * @private
   * @param {String} text - 文本内容
   * @returns {Array} - 单词数组
   */
  _analyzeText(text) {
    // 在实际应用中，应使用日语分词工具（如kuromoji.js）
    // 这里使用简化实现，按空格和标点符号分割
    
    // 移除标点符号，按空格分割
    const simpleSplit = text.replace(/[、。！？]/g, ' ').split(/\s+/);
    
    // 过滤空字符串
    const words = simpleSplit.filter(word => word.length > 0);
    
    // 为每个单词添加属性
    return words.map(word => ({
      text: word,
      length: word.length,
      isKanji: /[\u4e00-\u9faf]/.test(word), // 包含汉字
      isHiragana: /^[\u3040-\u309f]+$/.test(word), // 纯平假名
      isKatakana: /^[\u30a0-\u30ff]+$/.test(word), // 纯片假名
      importance: this._calculateWordImportance(word)
    }));
  }

  /**
   * 计算单词重要性
   * @private
   * @param {String} word - 单词
   * @returns {Number} - 重要性分数
   */
  _calculateWordImportance(word) {
    // 简单的重要性计算规则
    let score = 0;
    
    // 长度因素：较长的词可能更重要
    score += Math.min(word.length, 4);
    
    // 汉字因素：包含汉字的词可能更重要
    if (/[\u4e00-\u9faf]/.test(word)) {
      score += 3;
    }
    
    // 片假名因素：片假名词通常是外来词，可能是关键概念
    if (/[\u30a0-\u30ff]/.test(word)) {
      score += 2;
    }
    
    // N4级别常用词汇表（简化示例）
    const n4CommonWords = ['私', '学校', '先生', '友達', '勉強', '日本語', '行く', '来る', '食べる', '飲む'];
    if (n4CommonWords.includes(word)) {
      score += 2;
    }
    
    return score;
  }

  /**
   * 选择关键词作为填空
   * @private
   * @param {Array} words - 单词数组
   * @returns {Array} - 选中的关键词
   */
  _selectKeyWords(words) {
    if (words.length <= this.options.gapCount) {
      return words;
    }
    
    // 按重要性排序
    const sortedWords = [...words].sort((a, b) => b.importance - a.importance);
    
    // 选择前N个重要词
    const selectedWords = sortedWords.slice(0, Math.min(this.options.gapCount * 2, sortedWords.length));
    
    // 随机选择其中的gapCount个词
    this._shuffleArray(selectedWords);
    return selectedWords.slice(0, this.options.gapCount);
  }

  /**
   * 生成干扰选项
   * @private
   * @param {Object} word - 单词对象
   * @returns {Array} - 干扰选项数组
   */
  _generateDistractors(word) {
    // 干扰选项生成策略
    const distractors = [];
    
    // 1. 相似发音的词
    const similarPronunciationWords = this._getSimilarPronunciationWords(word.text);
    
    // 2. 相似形状的词
    const similarShapeWords = this._getSimilarShapeWords(word.text);
    
    // 3. 相同类别的词
    const sameCategoryWords = this._getSameCategoryWords(word.text);
    
    // 合并所有干扰选项
    const allDistractors = [
      ...similarPronunciationWords,
      ...similarShapeWords,
      ...sameCategoryWords
    ];
    
    // 去重
    const uniqueDistractors = [...new Set(allDistractors)];
    
    // 过滤掉正确答案
    const filteredDistractors = uniqueDistractors.filter(item => item !== word.text);
    
    // 如果干扰选项不足，添加一些通用干扰项
    if (filteredDistractors.length < this.options.optionCount - 1) {
      const genericDistractors = this._getGenericDistractors(word.text);
      filteredDistractors.push(...genericDistractors);
    }
    
    // 打乱顺序并选择需要的数量
    this._shuffleArray(filteredDistractors);
    return filteredDistractors.slice(0, this.options.optionCount - 1);
  }

  /**
   * 获取发音相似的词
   * @private
   * @param {String} word - 单词
   * @returns {Array} - 相似发音的词数组
   */
  _getSimilarPronunciationWords(word) {
    // 在实际应用中，应使用发音相似度算法或预定义的相似发音词表
    // 这里使用简化实现
    
    // 简化的相似发音词表（示例）
    const similarPronunciationMap = {
      '私': ['資', '紫'],
      '学校': ['楽しい', '学生'],
      '先生': ['千円', '専門'],
      '友達': ['有名', '友情'],
      '勉強': ['便利', '弁当'],
      '日本語': ['日本人', '日曜日'],
      '行く': ['聞く', '書く'],
      '来る': ['切る', '帰る'],
      '食べる': ['話べる', '調べる'],
      '飲む': ['読む', '休む']
    };
    
    return similarPronunciationMap[word] || [];
  }

  /**
   * 获取形状相似的词
   * @private
   * @param {String} word - 单词
   * @returns {Array} - 相似形状的词数组
   */
  _getSimilarShapeWords(word) {
    // 在实际应用中，应使用形状相似度算法或预定义的相似形状词表
    // 这里使用简化实现
    
    // 简化的相似形状词表（示例）
    const similarShapeMap = {
      '私': ['和', '利'],
      '学校': ['字校', '学林'],
      '先生': ['光生', '先主'],
      '友達': ['友建', '反達'],
      '勉強': ['免強', '勉残'],
      '日本語': ['日木語', '目本語'],
      '行く': ['衍く', '行つ'],
      '来る': ['末る', '来ろ'],
      '食べる': ['飯べる', '食へる'],
      '飲む': ['欽む', '飲な']
    };
    
    return similarShapeMap[word] || [];
  }

  /**
   * 获取同类别的词
   * @private
   * @param {String} word - 单词
   * @returns {Array} - 同类别的词数组
   */
  _getSameCategoryWords(word) {
    // 在实际应用中，应使用词汇分类数据库或预定义的类别词表
    // 这里使用简化实现
    
    // 简化的类别词表（示例）
    const categoryMap = {
      '私': ['彼', '彼女', '君'],
      '学校': ['大学', '高校', '教室'],
      '先生': ['教師', '医者', '講師'],
      '友達': ['親友', '仲間', '同僚'],
      '勉強': ['学習', '研究', '練習'],
      '日本語': ['英語', '中国語', '韓国語'],
      '行く': ['歩く', '走る', '進む'],
      '来る': ['戻る', '着く', '届く'],
      '食べる': ['飲む', '噛む', '味わう'],
      '飲む': ['食べる', '吸う', '呑む']
    };
    
    return categoryMap[word] || [];
  }

  /**
   * 获取通用干扰项
   * @private
   * @param {String} word - 单词
   * @returns {Array} - 通用干扰项数组
   */
  _getGenericDistractors(word) {
    // N4级别常用词汇（简化示例）
    const n4CommonWords = [
      '私', '学校', '先生', '友達', '勉強', '日本語', '行く', '来る', '食べる', '飲む',
      '見る', '聞く', '読む', '書く', '話す', '買う', '売る', '待つ', '使う', '作る',
      '家', '部屋', '学生', '会社', '仕事', '電車', '車', '自転車', '映画', '音楽',
      '好き', '嫌い', '楽しい', '面白い', '難しい', '簡単', '忙しい', '暇', '元気', '病気'
    ];
    
    // 过滤掉正确答案
    const filteredWords = n4CommonWords.filter(item => item !== word);
    
    // 打乱顺序
    this._shuffleArray(filteredWords);
    
    return filteredWords.slice(0, 5); // 返回5个通用干扰项
  }

  /**
   * 创建问题文本
   * @private
   * @param {String} text - 原始文本
   * @param {String} word - 要替换的单词
   * @returns {String} - 带有填空的问题文本
   */
  _createQuestionText(text, word) {
    // 使用占位符替换单词
    return text.replace(word, '【　　】');
  }

  /**
   * 生成解释文本
   * @private
   * @param {Object} word - 单词对象
   * @returns {String} - 解释文本
   */
  _generateExplanation(word) {
    // 在实际应用中，应使用词典API或预定义的解释数据
    // 这里使用简化实现
    
    // 简化的解释数据（示例）
    const explanationMap = {
      '私': '意思是"我"，是第一人称代词，N5级别词汇',
      '学校': '意思是"学校"，表示学习的场所，N5级别词汇',
      '先生': '意思是"老师"，也可以指医生等专业人士，N5级别词汇',
      '友達': '意思是"朋友"，表示关系亲密的人，N5级别词汇',
      '勉強': '意思是"学习"，表示学习知识的行为，N5级别词汇',
      '日本語': '意思是"日语"，表示日本的语言，N5级别词汇',
      '行く': '意思是"去"，表示从一个地方到另一个地方，N5级别词汇',
      '来る': '意思是"来"，表示从别处到说话人所在的地方，N5级别词汇',
      '食べる': '意思是"吃"，表示摄取食物，N5级别词汇',
      '飲む': '意思是"喝"，表示摄取液体，N5级别词汇'
    };
    
    return explanationMap[word.text] || `"${word.text}"是句子中的重要词汇`;
  }

  /**
   * 打乱数组顺序
   * @private
   * @param {Array} array - 要打乱的数组
   */
  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * 提交答案
   * @param {Array} answers - 用户答案数组
   * @returns {Object} - 评分结果
   */
  submitAnswers(answers) {
    if (!this.questions || this.questions.length === 0) {
      throw new Error('没有可用的问题');
    }
    
    if (!answers || answers.length !== this.questions.length) {
      throw new Error('答案数量不匹配');
    }
    
    // 保存用户答案
    this.userAnswers = [...answers];
    
    // 计算得分
    let correctCount = 0;
    
    const results = this.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      return {
        questionId: question.id,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      };
    });
    
    // 计算总分（百分比）
    this.score = Math.round((correctCount / this.questions.length) * 100);
    
    return {
      score: this.score,
      correctCount: correctCount,
      totalCount: this.questions.length,
      results: results
    };
  }

  /**
   * 获取当前得分
   * @returns {Number} - 当前得分
   */
  getScore() {
    return this.score;
  }

  /**
   * 重置游戏
   */
  reset() {
    this.questions = [];
    this.userAnswers = [];
    this.score = 0;
  }
}

/**
 * 趣味填空游戏UI控制器
 * 管理趣味填空游戏的用户界面交互
 */
class GapFillingGameController {
  /**
   * 初始化趣味填空游戏控制器
   * @param {Object} options - 配置选项
   * @param {GapFillingGame} options.game - 趣味填空游戏实例
   * @param {String} options.containerSelector - 游戏容器选择器
   * @param {Function} options.onComplete - 完成游戏的回调函数
   */
  constructor(options = {}) {
    this.game = options.game || new GapFillingGame();
    this.options = {
      containerSelector: options.containerSelector || '#gap-filling-game',
      onComplete: options.onComplete || null
    };
    
    this.container = null;
    this.isInitialized = false;
  }

  /**
   * 初始化控制器
   * @returns {Boolean} - 是否成功初始化
   */
  initialize() {
    if (this.isInitialized) return true;
    
    // 获取游戏容器
    this.container = document.querySelector(this.options.containerSelector);
    
    if (!this.container) {
      console.error('未找到游戏容器元素');
      return false;
    }
    
    this.isInitialized = true;
    console.log('趣味填空游戏控制器已初始化');
    return true;
  }

  /**
   * 开始游戏
   * @param {Object} subtitle - 字幕对象
   */
  startGame(subtitle) {
    if (!this.isInitialized) {
      console.error('控制器未初始化');
      return;
    }
    
    if (!subtitle) {
      console.error('没有可用的字幕');
      return;
    }
    
    try {
      // 设置字幕
      this.game.setSubtitle(subtitle);
      
      // 生成问题
      const questions = this.game.generateQuestions();
      
      // 渲染游戏界面
      this._renderGameUI(questions);
      
      // 显示游戏容器
      this.container.style.display = 'block';
    } catch (error) {
      console.error('开始游戏失败:', error);
      this._showError(error.message);
    }
  }

  /**
   * 渲染游戏界面
   * @private
   * @param {Array} questions - 问题数组
   */
  _renderGameUI(questions) {
    if (!this.container) return;
    
    // 构建游戏HTML
    let html = `
      <div class="gap-filling-game">
        <h3>趣味填空游戏</h3>
        <p class="game-instruction">请根据上下文选择正确的单词填入空格</p>
        <div class="questions-container">
    `;
    
    // 添加每个问题
    questions.forEach((question, index) => {
      html += `
        <div class="question-item" data-question-id="${question.id}">
          <div class="question-text">${question.text}</div>
          <div class="options-container">
      `;
      
      // 添加选项
      question.options.forEach((option, optionIndex) => {
        html += `
          <div class="option-item">
            <input type="radio" id="q${index+1}_o${optionIndex+1}" name="question_${index+1}" value="${option}">
            <label for="q${index+1}_o${optionIndex+1}">${option}</label>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    // 添加提交按钮
    html += `
        </div>
        <div class="game-actions">
          <button class="submit-button">提交答案</button>
        </div>
      </div>
    `;
    
    // 更新容器内容
    this.container.innerHTML = html;
    
    // 添加提交按钮事件监听器
    const submitButton = this.container.querySelector('.submit-button');
    if (submitButton) {
      submitButton.addEventListener('click', this._handleSubmit.bind(this));
    }
  }

  /**
   * 处理提交事件
   * @private
   */
  _handleSubmit() {
    try {
      // 收集用户答案
      const answers = [];
      
      for (let i = 0; i < this.game.questions.length; i++) {
        const radioName = `question_${i+1}`;
        const selectedOption = document.querySelector(`input[name="${radioName}"]:checked`);
        
        if (!selectedOption) {
          throw new Error(`请回答所有问题（第${i+1}题未回答）`);
        }
        
        answers.push(selectedOption.value);
      }
      
      // 提交答案
      const result = this.game.submitAnswers(answers);
      
      // 显示结果
      this._showResult(result);
    } catch (error) {
      console.error('提交答案失败:', error);
      this._showError(error.message);
    }
  }

  /**
   * 显示结果
   * @private
   * @param {Object} result - 评分结果
   */
  _showResult(result) {
    if (!this.container) return;
    
    // 构建结果HTML
    let html = `
      <div class="gap-filling-result">
        <h3>游戏结果</h3>
        <div class="score-summary">
          <div class="score-value">${result.score}分</div>
          <div class="score-detail">答对${result.correctCount}题，共${result.totalCount}题</div>
        </div>
        <div class="results-container">
    `;
    
    // 添加每个问题的结果
    result.results.forEach((item, index) => {
      const question = this.game.questions[index];
      
      html += `
        <div class="result-item ${item.isCorrect ? 'correct' : 'incorrect'}">
          <div class="question-text">${question.text.replace('【　　】', item.isCorrect 
            ? `<span class="correct-answer">${item.correctAnswer}</span>` 
            : `<span class="incorrect-answer">${item.userAnswer}</span>`)}
          </div>
          <div class="answer-feedback">
            ${item.isCorrect 
              ? `<span class="correct-icon">✓</span> 正确！` 
              : `<span class="incorrect-icon">✗</span> 正确答案是：<span class="correct-answer">${item.correctAnswer}</span>`}
          </div>
          <div class="explanation">${item.explanation}</div>
        </div>
      `;
    });
    
    // 添加操作按钮
    html += `
        </div>
        <div class="result-actions">
          <button class="try-again-button">再玩一次</button>
          <button class="continue-button">继续学习</button>
        </div>
      </div>
    `;
    
    // 更新容器内容
    this.container.innerHTML = html;
    
    // 添加按钮事件监听器
    const tryAgainButton = this.container.querySelector('.try-again-button');
    const continueButton = this.container.querySelector('.continue-button');
    
    if (tryAgainButton) {
      tryAgainButton.addEventListener('click', () => {
        this.startGame(this.game.currentSubtitle);
      });
    }
    
    if (continueButton) {
      continueButton.addEventListener('click', () => {
        this.container.style.display = 'none';
        
        // 调用完成回调
        if (this.options.onComplete && typeof this.options.onComplete === 'function') {
          this.options.onComplete(result);
        }
      });
    }
  }

  /**
   * 显示错误
   * @private
   * @param {String} message - 错误消息
   */
  _showError(message) {
    if (!this.container) return;
    
 
(Content truncated due to size limit. Use line ranges to read in chunks)