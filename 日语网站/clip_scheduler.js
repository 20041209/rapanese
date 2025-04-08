// 【Anime日语每日课】片段推送调度系统

/**
 * 片段推送调度系统
 * 负责管理动漫片段的定时推送和用户学习进度跟踪
 */
class ClipScheduler {
  /**
   * 初始化片段调度器
   * @param {Object} options - 配置选项
   * @param {Object} options.database - 数据库连接对象
   * @param {Object} options.selectionAlgorithm - 片段选择算法实例
   * @param {Object} options.guideGenerator - 导学内容生成器实例
   */
  constructor(options = {}) {
    this.database = options.database;
    this.selectionAlgorithm = options.selectionAlgorithm;
    this.guideGenerator = options.guideGenerator;
    this.scheduledTasks = new Map(); // 用户ID -> 定时任务
  }

  /**
   * 为用户安排每日学习片段
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} - 选中的片段和导学内容
   */
  async scheduleClipForUser(userId) {
    try {
      // 1. 获取用户配置文件
      const userProfile = await this._getUserProfile(userId);
      if (!userProfile) {
        throw new Error(`用户 ${userId} 不存在`);
      }

      // 2. 获取可用片段库
      const clipLibrary = await this._getAvailableClips(userProfile);
      if (!clipLibrary || clipLibrary.length === 0) {
        throw new Error('没有可用的片段');
      }

      // 3. 使用选择算法选择最佳片段
      const selectedClip = this.selectionAlgorithm.selectBestClip(clipLibrary);

      // 4. 生成导学内容
      const learningGuide = this.guideGenerator.generateGuide(selectedClip, userProfile);

      // 5. 保存用户的今日学习内容
      await this._saveUserDailyContent(userId, selectedClip._id, learningGuide);

      // 6. 返回选中的片段和导学内容
      return {
        clip: selectedClip,
        guide: learningGuide
      };
    } catch (error) {
      console.error(`为用户 ${userId} 安排片段时出错:`, error);
      throw error;
    }
  }

  /**
   * 启动定时推送任务
   * @param {String} userId - 用户ID
   * @param {String} schedule - 定时表达式 (cron格式)
   * @returns {Boolean} - 是否成功启动
   */
  startScheduledPush(userId, schedule = '0 8 * * *') { // 默认每天早上8点
    if (this.scheduledTasks.has(userId)) {
      // 如果已有任务，先停止
      this.stopScheduledPush(userId);
    }

    try {
      // 创建定时任务
      // 注意：实际实现中应使用如node-cron等库
      const task = {
        schedule,
        active: true,
        lastRun: null,
        job: setInterval(async () => {
          if (this._shouldRunTask(schedule)) {
            try {
              await this.scheduleClipForUser(userId);
              console.log(`用户 ${userId} 的每日片段已推送`);
              
              // 更新最后运行时间
              const taskInfo = this.scheduledTasks.get(userId);
              if (taskInfo) {
                taskInfo.lastRun = new Date();
                this.scheduledTasks.set(userId, taskInfo);
              }
            } catch (error) {
              console.error(`用户 ${userId} 的定时推送任务失败:`, error);
            }
          }
        }, 60000) // 每分钟检查一次是否应该运行任务
      };

      // 保存任务信息
      this.scheduledTasks.set(userId, task);
      return true;
    } catch (error) {
      console.error(`启动用户 ${userId} 的定时推送任务失败:`, error);
      return false;
    }
  }

  /**
   * 停止定时推送任务
   * @param {String} userId - 用户ID
   * @returns {Boolean} - 是否成功停止
   */
  stopScheduledPush(userId) {
    if (!this.scheduledTasks.has(userId)) {
      return false;
    }

    try {
      const task = this.scheduledTasks.get(userId);
      clearInterval(task.job);
      this.scheduledTasks.delete(userId);
      return true;
    } catch (error) {
      console.error(`停止用户 ${userId} 的定时推送任务失败:`, error);
      return false;
    }
  }

  /**
   * 获取用户的今日学习内容
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} - 今日学习内容
   */
  async getUserDailyContent(userId) {
    try {
      // 从数据库获取用户今日学习内容
      const dailyContent = await this.database.collection('user_daily_content')
        .findOne({ 
          user_id: userId,
          date: this._getTodayDateString()
        });

      if (!dailyContent) {
        // 如果今天还没有内容，立即安排一个
        return await this.scheduleClipForUser(userId);
      }

      // 获取完整的片段信息
      const clip = await this.database.collection('clips')
        .findOne({ _id: dailyContent.clip_id });

      return {
        clip,
        guide: dailyContent.learning_guide
      };
    } catch (error) {
      console.error(`获取用户 ${userId} 的今日内容失败:`, error);
      throw error;
    }
  }

  /**
   * 记录用户学习进度
   * @param {String} userId - 用户ID
   * @param {String} clipId - 片段ID
   * @param {Object} progress - 学习进度数据
   * @returns {Promise<Boolean>} - 是否成功记录
   */
  async recordLearningProgress(userId, clipId, progress) {
    try {
      // 更新用户学习历史
      await this.database.collection('users').updateOne(
        { _id: userId },
        { 
          $push: { 
            learning_history: {
              clip_id: clipId,
              date: new Date(),
              completed: progress.completed || false,
              quiz_score: progress.quiz_score,
              pronunciation_score: progress.pronunciation_score,
              new_vocabulary: progress.new_vocabulary || []
            }
          }
        }
      );

      // 如果有新掌握的词汇，更新词汇库
      if (progress.new_vocabulary && progress.new_vocabulary.length > 0) {
        for (const word of progress.new_vocabulary) {
          await this._updateUserVocabulary(userId, word);
        }
      }

      // 如果有语法点进度，更新语法掌握度
      if (progress.grammar_progress && Object.keys(progress.grammar_progress).length > 0) {
        for (const [grammarPoint, mastery] of Object.entries(progress.grammar_progress)) {
          await this._updateUserGrammarMastery(userId, grammarPoint, mastery);
        }
      }

      return true;
    } catch (error) {
      console.error(`记录用户 ${userId} 的学习进度失败:`, error);
      return false;
    }
  }

  /**
   * 获取用户配置文件
   * @private
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} - 用户配置文件
   */
  async _getUserProfile(userId) {
    try {
      return await this.database.collection('users').findOne({ _id: userId });
    } catch (error) {
      console.error(`获取用户 ${userId} 的配置文件失败:`, error);
      throw error;
    }
  }

  /**
   * 获取可用片段库
   * @private
   * @param {Object} userProfile - 用户配置文件
   * @returns {Promise<Array>} - 可用片段数组
   */
  async _getAvailableClips(userProfile) {
    try {
      // 基本查询条件
      const query = {
        // 匹配用户语言水平及相邻级别
        language_level: { $in: this._getAdjacentLevels(userProfile.language_level) },
        // 确保版权合规
        copyright_status: 'verified'
      };

      // 如果用户有兴趣标签，优先匹配
      if (userProfile.interest_tags && userProfile.interest_tags.length > 0) {
        query.tags = { $in: userProfile.interest_tags };
      }

      // 获取片段
      return await this.database.collection('clips')
        .find(query)
        .limit(100) // 限制数量，避免处理过多数据
        .toArray();
    } catch (error) {
      console.error('获取可用片段失败:', error);
      throw error;
    }
  }

  /**
   * 获取相邻语言级别
   * @private
   * @param {String} level - 当前语言级别
   * @returns {Array} - 相邻级别数组
   */
  _getAdjacentLevels(level) {
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const currentIndex = levels.indexOf(level);
    
    if (currentIndex === -1) return ['N4']; // 默认N4
    
    // 返回当前级别和相邻级别
    const result = [level];
    
    if (currentIndex > 0) {
      result.push(levels[currentIndex - 1]); // 添加低一级
    }
    
    if (currentIndex < levels.length - 1) {
      result.push(levels[currentIndex + 1]); // 添加高一级
    }
    
    return result;
  }

  /**
   * 保存用户的今日学习内容
   * @private
   * @param {String} userId - 用户ID
   * @param {String} clipId - 片段ID
   * @param {Object} learningGuide - 导学内容
   * @returns {Promise<Boolean>} - 是否成功保存
   */
  async _saveUserDailyContent(userId, clipId, learningGuide) {
    try {
      // 检查今天是否已有内容
      const existingContent = await this.database.collection('user_daily_content')
        .findOne({ 
          user_id: userId,
          date: this._getTodayDateString()
        });

      if (existingContent) {
        // 更新现有内容
        await this.database.collection('user_daily_content').updateOne(
          { _id: existingContent._id },
          { 
            $set: { 
              clip_id: clipId,
              learning_guide: learningGuide,
              updated_at: new Date()
            }
          }
        );
      } else {
        // 创建新内容
        await this.database.collection('user_daily_content').insertOne({
          user_id: userId,
          date: this._getTodayDateString(),
          clip_id: clipId,
          learning_guide: learningGuide,
          completed: false,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      return true;
    } catch (error) {
      console.error(`保存用户 ${userId} 的今日内容失败:`, error);
      return false;
    }
  }

  /**
   * 更新用户词汇库
   * @private
   * @param {String} userId - 用户ID
   * @param {Object} word - 词汇信息
   * @returns {Promise<Boolean>} - 是否成功更新
   */
  async _updateUserVocabulary(userId, word) {
    try {
      // 检查词汇是否已存在
      const user = await this.database.collection('users').findOne(
        { 
          _id: userId,
          'vocabulary_bank.word': word.word
        }
      );

      if (user) {
        // 更新现有词汇
        await this.database.collection('users').updateOne(
          { 
            _id: userId,
            'vocabulary_bank.word': word.word
          },
          { 
            $set: { 
              'vocabulary_bank.$.mastery': word.mastery || 0.3, // 初始掌握度
              'vocabulary_bank.$.last_reviewed': new Date()
            }
          }
        );
      } else {
        // 添加新词汇
        await this.database.collection('users').updateOne(
          { _id: userId },
          { 
            $push: { 
              vocabulary_bank: {
                word: word.word,
                reading: word.reading,
                meaning: word.meaning,
                level: word.level,
                mastery: word.mastery || 0.3, // 初始掌握度
                last_reviewed: new Date()
              }
            }
          }
        );
      }

      return true;
    } catch (error) {
      console.error(`更新用户 ${userId} 的词汇库失败:`, error);
      return false;
    }
  }

  /**
   * 更新用户语法掌握度
   * @private
   * @param {String} userId - 用户ID
   * @param {String} grammarPoint - 语法点
   * @param {Number} mastery - 掌握度
   * @returns {Promise<Boolean>} - 是否成功更新
   */
  async _updateUserGrammarMastery(userId, grammarPoint, mastery) {
    try {
      // 检查语法点是否已存在
      const user = await this.database.collection('users').findOne(
        { 
          _id: userId,
          'grammar_mastery.grammar_point': grammarPoint
        }
      );

      if (user) {
        // 更新现有语法点
        await this.database.collection('users').updateOne(
          { 
            _id: userId,
            'grammar_mastery.grammar_point': grammarPoint
          },
          { 
            $set: { 
              'grammar_mastery.$.mastery': mastery,
              'grammar_mastery.$.last_reviewed': new Date()
            }
          }
        );
      } else {
        // 添加新语法点
        await this.database.collection('users').updateOne(
          { _id: userId },
          { 
            $push: { 
              grammar_mastery: {
                grammar_point: grammarPoint,
                mastery: mastery,
                last_reviewed: new Date()
              }
            }
          }
        );
      }

      return true;
    } catch (error) {
      console.error(`更新用户 ${userId} 的语法掌握度失败:`, error);
      return false;
    }
  }

  /**
   * 获取今天的日期字符串
   * @private
   * @returns {String} - 日期字符串 (YYYY-MM-DD)
   */
  _getTodayDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  /**
   * 检查是否应该运行定时任务
   * @private
   * @param {String} schedule - 定时表达式 (cron格式)
   * @returns {Boolean} - 是否应该运行
   */
  _shouldRunTask(schedule) {
    // 简化实现，实际应使用cron表达式解析库
    // 这里仅作示例，假设格式为"分 时 * * *"
    const now = new Date();
    const [minute, hour] = schedule.split(' ');
    
    return now.getHours() === parseInt(hour) && now.getMinutes() === parseInt(minute);
  }
}

// 导出模块
module.exports = {
  ClipScheduler
};
