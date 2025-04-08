// 【Anime日语每日课】每周学习报告生成器

/**
 * 学习报告生成器
 * 生成每周学习报告：掌握词汇数+进步曲线图+奖励一句动漫角色名言
 */
class WeeklyReportGenerator {
  /**
   * 初始化学习报告生成器
   * @param {Object} options - 配置选项
   * @param {Object} options.database - 数据库连接对象
   * @param {String} options.userId - 用户ID
   * @param {KnowledgeCollector} options.knowledgeCollector - 知识收集器
   */
  constructor(options = {}) {
    this.options = {
      database: options.database || null,
      userId: options.userId || null,
      knowledgeCollector: options.knowledgeCollector || null
    };
    
    this.learningData = {
      vocabulary: [],
      grammar: [],
      activities: [],
      progress: []
    };
  }

  /**
   * 收集学习数据
   * @returns {Promise<Boolean>} - 是否成功收集数据
   */
  async collectLearningData() {
    try {
      // 从知识收集器获取数据
      if (this.options.knowledgeCollector) {
        this.learningData.vocabulary = this.options.knowledgeCollector.getCollectedWords();
        this.learningData.grammar = this.options.knowledgeCollector.getCollectedGrammar();
      } else {
        // 从本地存储获取
        const vocabularyStr = localStorage.getItem('collectedWords');
        const grammarStr = localStorage.getItem('collectedGrammar');
        
        this.learningData.vocabulary = vocabularyStr ? JSON.parse(vocabularyStr) : [];
        this.learningData.grammar = grammarStr ? JSON.parse(grammarStr) : [];
      }
      
      // 从本地存储获取活动记录
      const activitiesStr = localStorage.getItem('learningActivities');
      this.learningData.activities = activitiesStr ? JSON.parse(activitiesStr) : [];
      
      // 从本地存储获取进度记录
      const progressStr = localStorage.getItem('learningProgress');
      this.learningData.progress = progressStr ? JSON.parse(progressStr) : [];
      
      // 如果有数据库连接，从数据库获取更多数据
      if (this.options.database && this.options.userId) {
        await this._collectDataFromDatabase();
      }
      
      return true;
    } catch (error) {
      console.error('收集学习数据失败:', error);
      return false;
    }
  }

  /**
   * 从数据库收集数据
   * @private
   * @returns {Promise<void>}
   */
  async _collectDataFromDatabase() {
    try {
      // 查询用户数据
      const user = await this.options.database.collection('users').findOne(
        { _id: this.options.userId },
        { 
          projection: { 
            vocabulary_bank: 1,
            grammar_mastery: 1,
            learning_activities: 1,
            progress_history: 1
          } 
        }
      );
      
      if (user) {
        // 合并数据
        if (user.vocabulary_bank) {
          // 将数据库中的词汇与本地收集的词汇合并
          const dbWords = user.vocabulary_bank.map(item => ({
            word: item.word,
            reading: item.reading,
            meaning: item.meaning,
            level: item.level,
            mastery: item.mastery,
            lastReviewed: item.last_reviewed,
            collectedAt: item.collected_at
          }));
          
          // 合并并去重
          this.learningData.vocabulary = this._mergeAndDeduplicate(
            this.learningData.vocabulary,
            dbWords,
            'word'
          );
        }
        
        if (user.grammar_mastery) {
          // 将数据库中的语法与本地收集的语法合并
          const dbGrammar = user.grammar_mastery.map(item => ({
            name: item.grammar_point,
            description: item.description,
            level: item.level,
            mastery: item.mastery,
            lastReviewed: item.last_reviewed,
            collectedAt: item.collected_at
          }));
          
          // 合并并去重
          this.learningData.grammar = this._mergeAndDeduplicate(
            this.learningData.grammar,
            dbGrammar,
            'name'
          );
        }
        
        if (user.learning_activities) {
          // 合并活动记录
          this.learningData.activities = this._mergeAndDeduplicate(
            this.learningData.activities,
            user.learning_activities,
            'timestamp'
          );
        }
        
        if (user.progress_history) {
          // 合并进度记录
          this.learningData.progress = this._mergeAndDeduplicate(
            this.learningData.progress,
            user.progress_history,
            'date'
          );
        }
      }
    } catch (error) {
      console.error('从数据库收集数据失败:', error);
    }
  }

  /**
   * 合并并去重数组
   * @private
   * @param {Array} arr1 - 数组1
   * @param {Array} arr2 - 数组2
   * @param {String} key - 用于去重的键
   * @returns {Array} - 合并后的数组
   */
  _mergeAndDeduplicate(arr1, arr2, key) {
    // 合并数组
    const merged = [...arr1, ...arr2];
    
    // 使用Map去重
    const map = new Map();
    for (const item of merged) {
      if (item[key]) {
        map.set(item[key], item);
      }
    }
    
    // 转回数组
    return Array.from(map.values());
  }

  /**
   * 生成每周学习报告
   * @returns {Object} - 学习报告
   */
  generateWeeklyReport() {
    // 获取当前日期
    const now = new Date();
    
    // 计算一周前的日期
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // 过滤出本周的数据
    const thisWeekVocabulary = this.learningData.vocabulary.filter(item => {
      const collectedAt = item.collectedAt ? new Date(item.collectedAt) : null;
      return collectedAt && collectedAt >= oneWeekAgo;
    });
    
    const thisWeekGrammar = this.learningData.grammar.filter(item => {
      const collectedAt = item.collectedAt ? new Date(item.collectedAt) : null;
      return collectedAt && collectedAt >= oneWeekAgo;
    });
    
    const thisWeekActivities = this.learningData.activities.filter(item => {
      const timestamp = item.timestamp ? new Date(item.timestamp) : null;
      return timestamp && timestamp >= oneWeekAgo;
    });
    
    // 计算学习统计
    const stats = this._calculateLearningStats(thisWeekVocabulary, thisWeekGrammar, thisWeekActivities);
    
    // 生成进步曲线数据
    const progressData = this._generateProgressData();
    
    // 获取动漫角色名言
    const quote = this._getAnimeCharacterQuote();
    
    // 构建报告
    return {
      generatedAt: now.toISOString(),
      period: {
        start: oneWeekAgo.toISOString(),
        end: now.toISOString()
      },
      stats: stats,
      progressData: progressData,
      newVocabulary: thisWeekVocabulary,
      newGrammar: thisWeekGrammar,
      activities: thisWeekActivities,
      quote: quote
    };
  }

  /**
   * 计算学习统计
   * @private
   * @param {Array} vocabulary - 词汇数组
   * @param {Array} grammar - 语法数组
   * @param {Array} activities - 活动数组
   * @returns {Object} - 学习统计
   */
  _calculateLearningStats(vocabulary, grammar, activities) {
    // 计算学习时间（分钟）
    let totalLearningTime = 0;
    activities.forEach(activity => {
      if (activity.duration) {
        totalLearningTime += activity.duration;
      }
    });
    
    // 计算学习天数
    const learningDays = new Set();
    activities.forEach(activity => {
      if (activity.timestamp) {
        const date = new Date(activity.timestamp);
        learningDays.add(date.toDateString());
      }
    });
    
    // 计算完成的练习数量
    const completedExercises = activities.filter(activity => 
      activity.type === 'pronunciation' || 
      activity.type === 'gap-filling' || 
      activity.type === 'quiz'
    ).length;
    
    // 计算平均得分
    let totalScore = 0;
    let scoreCount = 0;
    
    activities.forEach(activity => {
      if (activity.score !== undefined) {
        totalScore += activity.score;
        scoreCount++;
      }
    });
    
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    
    // 计算掌握度
    const masteryLevels = {
      vocabulary: this._calculateMasteryDistribution(vocabulary),
      grammar: this._calculateMasteryDistribution(grammar)
    };
    
    return {
      newVocabularyCount: vocabulary.length,
      newGrammarCount: grammar.length,
      totalLearningTime: totalLearningTime,
      learningDays: learningDays.size,
      completedExercises: completedExercises,
      averageScore: averageScore,
      masteryLevels: masteryLevels
    };
  }

  /**
   * 计算掌握度分布
   * @private
   * @param {Array} items - 项目数组
   * @returns {Object} - 掌握度分布
   */
  _calculateMasteryDistribution(items) {
    const distribution = {
      beginner: 0,      // 0-0.3
      intermediate: 0,  // 0.3-0.7
      advanced: 0,      // 0.7-0.9
      mastered: 0       // 0.9-1.0
    };
    
    items.forEach(item => {
      const mastery = item.mastery !== undefined ? item.mastery : 0.3;
      
      if (mastery >= 0.9) {
        distribution.mastered++;
      } else if (mastery >= 0.7) {
        distribution.advanced++;
      } else if (mastery >= 0.3) {
        distribution.intermediate++;
      } else {
        distribution.beginner++;
      }
    });
    
    return distribution;
  }

  /**
   * 生成进步曲线数据
   * @private
   * @returns {Object} - 进步曲线数据
   */
  _generateProgressData() {
    // 获取当前日期
    const now = new Date();
    
    // 计算一周前的日期
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // 初始化每天的数据
    const dailyData = [];
    
    // 填充每天的数据
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 查找该日期的进度记录
      const progressRecord = this.learningData.progress.find(item => {
        return item.date && item.date.split('T')[0] === dateStr;
      });
      
      // 查找该日期的活动记录
      const dayActivities = this.learningData.activities.filter(item => {
        return item.timestamp && item.timestamp.split('T')[0] === dateStr;
      });
      
      // 计算该日的学习时间
      let learningTime = 0;
      dayActivities.forEach(activity => {
        if (activity.duration) {
          learningTime += activity.duration;
        }
      });
      
      // 计算该日新增的词汇和语法
      const newVocabulary = this.learningData.vocabulary.filter(item => {
        return item.collectedAt && item.collectedAt.split('T')[0] === dateStr;
      }).length;
      
      const newGrammar = this.learningData.grammar.filter(item => {
        return item.collectedAt && item.collectedAt.split('T')[0] === dateStr;
      }).length;
      
      // 添加数据点
      dailyData.push({
        date: dateStr,
        learningTime: learningTime,
        newVocabulary: newVocabulary,
        newGrammar: newGrammar,
        masteryScore: progressRecord ? progressRecord.masteryScore : null,
        activities: dayActivities.length
      });
    }
    
    // 计算趋势
    const trend = this._calculateProgressTrend(dailyData);
    
    return {
      dailyData: dailyData,
      trend: trend
    };
  }

  /**
   * 计算进步趋势
   * @private
   * @param {Array} dailyData - 每日数据
   * @returns {Object} - 趋势数据
   */
  _calculateProgressTrend(dailyData) {
    // 计算学习时间趋势
    const learningTimeStart = dailyData[0].learningTime || 0;
    const learningTimeEnd = dailyData[dailyData.length - 1].learningTime || 0;
    const learningTimeTrend = learningTimeEnd - learningTimeStart;
    
    // 计算掌握度趋势
    let masteryStart = null;
    let masteryEnd = null;
    
    for (const data of dailyData) {
      if (data.masteryScore !== null && masteryStart === null) {
        masteryStart = data.masteryScore;
      }
      if (data.masteryScore !== null) {
        masteryEnd = data.masteryScore;
      }
    }
    
    const masteryTrend = masteryStart !== null && masteryEnd !== null 
      ? masteryEnd - masteryStart 
      : 0;
    
    // 计算活动数量趋势
    const activitiesStart = dailyData[0].activities || 0;
    const activitiesEnd = dailyData[dailyData.length - 1].activities || 0;
    const activitiesTrend = activitiesEnd - activitiesStart;
    
    // 计算总体趋势
    let overallTrend = 0;
    
    if (learningTimeTrend > 0) overallTrend += 1;
    if (masteryTrend > 0) overallTrend += 1;
    if (activitiesTrend > 0) overallTrend += 1;
    
    // 趋势评价
    let trendEvaluation = '';
    
    if (overallTrend >= 2) {
      trendEvaluation = '进步显著';
    } else if (overallTrend >= 1) {
      trendEvaluation = '稳步提升';
    } else if (overallTrend === 0) {
      trendEvaluation = '保持稳定';
    } else {
      trendEvaluation = '需要加油';
    }
    
    return {
      learningTime: learningTimeTrend,
      mastery: masteryTrend,
      activities: activitiesTrend,
      overall: overallTrend,
      evaluation: trendEvaluation
    };
  }

  /**
   * 获取动漫角色名言
   * @private
   * @returns {Object} - 动漫角色名言
   */
  _getAnimeCharacterQuote() {
    // 动漫角色名言库
    const quotes = [
      {
        quote: "人は、信じることで強くなれる。",
        translation: "人因相信而变强。",
        character: "鸣人",
        anime: "火影忍者"
      },
      {
        quote: "何かを守りたいと思うのなら、自分自身を鍛えることだ。",
        translation: "如果想要保护什么，就要锻炼自己。",
        character: "剑心",
        anime: "浪客剑心"
      },
      {
        quote: "諦めたらそこで試合終了だよ。",
        translation: "放弃的话，比赛就结束了。",
        character: "安西教练",
        anime: "灌篮高手"
      },
      {
        quote: "人は、一人では生きていけない。",
        translation: "人无法独自生存。",
        character: "L",
        anime: "死亡笔记"
      },
      {
        quote: "自分を信じて、前に進め。",
        translation: "相信自己，向前进。",
        character: "爱德华·艾尔利克",
        anime: "钢之炼金术师"
      },
      {
        quote: "どんな時も笑顔でいることが大切だよ。",
        translation: "无论何时保持微笑都很重要。",
        character: "路飞",
        anime: "海贼王"
      },
      {
        quote: "失敗を恐れずに、挑戦し続けることが大切だ。",
        translation: "不要害怕失败，重要的是不断挑战。",
        character: "宫崎骏",
        anime: "千与千寻"
      },
      {
        quote: "言葉は心の扉を開ける鍵だ。",
        translation: "语言是打开心灵之门的钥匙。",
        character: "千寻",
        anime: "千与千寻"
      },
      {
        quote: "日本語の勉強は旅のようなものだ。一歩一歩進んでいこう。",
        translation: "学习日语就像一段旅程，让我们一步一步前进吧。",
        character: "铃芽",
        anime: "铃芽之旅"
      },
      {
        quote: "毎日の小さな努力が、大きな成果につながる。",
        translation: "每天的小努力，会带来大成果。",
        character: "立花泷",
        anime: "你的名字"
      }
    ];
    
    // 随机选择一条名言
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  /**
   * 生成HTML格式的报告
   * @param {Object} report - 学习报告
   * @returns {String} - HTML格式的报告
   */
  generateReportHTML(report) {
    if (!report) {
      report = this.generateWeeklyReport();
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    // 构建HTML
    let html = `
      <div class="weekly-report">
        <div class="report-header">
          <h2>每周学习报告</h2>
          <div class="report-period">
            ${formatDate(report.period.start)} - ${formatDate(report.period.end)}
          </div>
        </div>
        
        <div class="report-summary">
          <div class="summary-item">
            <div class="summary-value">${report.stats.newVocabularyCount}</div>
            <div class="summary-label">新掌握词汇</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${report.stats.newGrammarCount}</div>
            <div class="summary-label">新掌握语法</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${report.stats.learningDays}</div>
            <div class="summary-label">学习天数</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${Math.round(report.stats.totalLearningTime / 60)}</div>
            <div class="summary-label">学习小时</div>
          </div>
        </div>
        
        <div class="progress-section">
          <h3>学习进度</h3>
          <div class="progress-trend">
            <div class="trend-label">本周趋势：</div>
            <div class="trend-value ${report.progressData.trend.overall >= 0 ? 'positive' : 'negative'}">
              ${report.progressData.trend.evaluation}
            </div>
          </div>
          <div class="progress-chart">
            <!-- 这里将插入进步曲线图表 -->
            <div class="chart-placeholder">
              <p>进步曲线图表将在这里显示</p>
            </div>
          </div>
        </div>

(Content truncated due to size limit. Use line ranges to read in chunks)