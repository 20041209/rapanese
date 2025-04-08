// 【Anime日语每日课】片段筛选算法实现

/**
 * 动漫片段筛选算法
 * 基于用户的日语水平(N4)、学习重点(被动形)和兴趣标签(校园/热血/科幻)
 * 智能选择最适合的学习片段
 */

class ClipSelectionAlgorithm {
  /**
   * 初始化筛选算法
   * @param {Object} userProfile - 用户配置文件
   * @param {String} userProfile.languageLevel - 用户日语水平
   * @param {Array} userProfile.learningFocus - 用户当前学习重点
   * @param {Array} userProfile.interestTags - 用户兴趣标签
   * @param {Array} userProfile.learningHistory - 用户学习历史
   */
  constructor(userProfile) {
    this.userProfile = userProfile;
    this.weights = {
      languageLevel: 0.35,    // 语言水平匹配权重
      grammarPoints: 0.30,    // 语法点匹配权重
      interestTags: 0.20,     // 兴趣标签匹配权重
      difficulty: 0.10,       // 难度适应性权重
      novelty: 0.05           // 新颖性权重（避免重复）
    };
  }

  /**
   * 计算片段与用户的匹配度分数
   * @param {Object} clip - 动漫片段对象
   * @returns {Number} - 匹配度分数(0-1)
   */
  calculateMatchScore(clip) {
    // 1. 语言水平匹配度
    const levelScore = this._calculateLevelScore(clip.language_level);
    
    // 2. 语法点匹配度
    const grammarScore = this._calculateGrammarScore(clip.grammar_points);
    
    // 3. 兴趣标签匹配度
    const tagScore = this._calculateTagScore(clip.tags);
    
    // 4. 难度适应性
    const difficultyScore = this._calculateDifficultyScore(clip.difficulty_score);
    
    // 5. 新颖性（避免最近学习过的内容）
    const noveltyScore = this._calculateNoveltyScore(clip._id);
    
    // 计算加权总分
    const totalScore = 
      levelScore * this.weights.languageLevel +
      grammarScore * this.weights.grammarPoints +
      tagScore * this.weights.interestTags +
      difficultyScore * this.weights.difficulty +
      noveltyScore * this.weights.novelty;
    
    return totalScore;
  }
  
  /**
   * 计算语言水平匹配度
   * @param {String} clipLevel - 片段的语言级别
   * @returns {Number} - 匹配度分数(0-1)
   */
  _calculateLevelScore(clipLevel) {
    const levelMap = {
      'N5': 1,
      'N4': 2,
      'N3': 3,
      'N2': 4,
      'N1': 5
    };
    
    const userLevelValue = levelMap[this.userProfile.languageLevel] || 2; // 默认N4
    const clipLevelValue = levelMap[clipLevel] || 3;
    
    // 完全匹配得满分，差一级得0.7分，差两级得0.3分，差三级及以上得0分
    const levelDifference = Math.abs(userLevelValue - clipLevelValue);
    
    if (levelDifference === 0) return 1.0;
    if (levelDifference === 1) return 0.7;
    if (levelDifference === 2) return 0.3;
    return 0;
  }
  
  /**
   * 计算语法点匹配度
   * @param {Array} clipGrammarPoints - 片段包含的语法点
   * @returns {Number} - 匹配度分数(0-1)
   */
  _calculateGrammarScore(clipGrammarPoints) {
    if (!clipGrammarPoints || clipGrammarPoints.length === 0) return 0;
    if (!this.userProfile.learningFocus || this.userProfile.learningFocus.length === 0) return 0.5;
    
    // 计算用户学习重点与片段语法点的交集数量
    const matchingPoints = clipGrammarPoints.filter(point => 
      this.userProfile.learningFocus.includes(point)
    );
    
    // 理想情况：片段包含1-2个目标语法点
    const matchCount = matchingPoints.length;
    
    if (matchCount === 0) return 0.2;  // 没有匹配的语法点，给予低分
    if (matchCount === 1) return 0.9;  // 1个匹配点，接近理想
    if (matchCount === 2) return 1.0;  // 2个匹配点，最理想
    return 0.7;  // 超过2个匹配点，略微降低分数避免过于复杂
  }
  
  /**
   * 计算兴趣标签匹配度
   * @param {Array} clipTags - 片段的兴趣标签
   * @returns {Number} - 匹配度分数(0-1)
   */
  _calculateTagScore(clipTags) {
    if (!clipTags || clipTags.length === 0) return 0;
    if (!this.userProfile.interestTags || this.userProfile.interestTags.length === 0) return 0.5;
    
    // 计算用户兴趣标签与片段标签的交集数量
    const matchingTags = clipTags.filter(tag => 
      this.userProfile.interestTags.includes(tag)
    );
    
    // 匹配标签比例
    return matchingTags.length / Math.max(this.userProfile.interestTags.length, 1);
  }
  
  /**
   * 计算难度适应性分数
   * @param {Number} clipDifficulty - 片段难度分数(1-5)
   * @returns {Number} - 适应性分数(0-1)
   */
  _calculateDifficultyScore(clipDifficulty) {
    // 根据用户水平估算理想难度
    const levelMap = {
      'N5': 1.5,
      'N4': 2.5,
      'N3': 3.5,
      'N2': 4.0,
      'N1': 4.5
    };
    
    const idealDifficulty = levelMap[this.userProfile.languageLevel] || 2.5; // 默认N4
    
    // 难度差异，理想情况是接近但略高于用户水平
    const diffDifference = clipDifficulty - idealDifficulty;
    
    if (diffDifference >= -0.5 && diffDifference <= 1.0) {
      // 难度略高或接近用户水平，最理想
      return 1.0;
    } else if (diffDifference > 1.0 && diffDifference <= 2.0) {
      // 难度较高，但仍可接受
      return 0.7;
    } else if (diffDifference < -0.5 && diffDifference >= -1.5) {
      // 难度略低，适合复习
      return 0.8;
    } else {
      // 难度过高或过低
      return 0.3;
    }
  }
  
  /**
   * 计算新颖性分数（避免重复学习）
   * @param {String} clipId - 片段ID
   * @returns {Number} - 新颖性分数(0-1)
   */
  _calculateNoveltyScore(clipId) {
    if (!this.userProfile.learningHistory || this.userProfile.learningHistory.length === 0) {
      return 1.0; // 没有学习历史，任何内容都是新的
    }
    
    // 检查片段是否在用户最近的学习历史中
    const recentHistory = this.userProfile.learningHistory.slice(-30); // 最近30条记录
    const hasLearned = recentHistory.some(record => record.clip_id === clipId);
    
    return hasLearned ? 0.1 : 1.0;
  }
  
  /**
   * 从片段库中选择最佳片段
   * @param {Array} clipLibrary - 可用片段库
   * @returns {Object} - 选中的最佳片段
   */
  selectBestClip(clipLibrary) {
    if (!clipLibrary || clipLibrary.length === 0) {
      throw new Error('片段库为空，无法选择片段');
    }
    
    // 计算每个片段的匹配分数
    const scoredClips = clipLibrary.map(clip => ({
      clip,
      score: this.calculateMatchScore(clip)
    }));
    
    // 按分数降序排序
    scoredClips.sort((a, b) => b.score - a.score);
    
    // 从前3名中随机选择一个，增加一些随机性
    const topClips = scoredClips.slice(0, Math.min(3, scoredClips.length));
    const randomIndex = Math.floor(Math.random() * topClips.length);
    
    return topClips[randomIndex].clip;
  }
}

/**
 * 导学内容生成器
 * 基于选中的片段和用户学习重点，生成简洁的导学内容
 */
class LearningGuideGenerator {
  /**
   * 生成导学内容
   * @param {Object} clip - 选中的动漫片段
   * @param {Object} userProfile - 用户配置文件
   * @returns {String} - 导学内容
   */
  generateGuide(clip, userProfile) {
    // 1. 确定主要学习重点
    const focusPoints = this._identifyFocusPoints(clip, userProfile);
    
    // 2. 生成导学标题
    const title = this._generateTitle(focusPoints);
    
    // 3. 生成简短说明
    const description = this._generateDescription(focusPoints, clip);
    
    return {
      title,
      description
    };
  }
  
  /**
   * 识别片段中的学习重点
   * @private
   */
  _identifyFocusPoints(clip, userProfile) {
    // 优先选择用户当前学习重点中包含的语法点
    const matchingGrammarPoints = clip.grammar_points.filter(point => 
      userProfile.learningFocus.includes(point)
    );
    
    // 如果有匹配的语法点，优先使用
    if (matchingGrammarPoints.length > 0) {
      return {
        type: 'grammar',
        points: matchingGrammarPoints.slice(0, 2) // 最多取2个
      };
    }
    
    // 如果没有匹配的语法点，则关注词汇
    if (clip.vocabulary && clip.vocabulary.length > 0) {
      // 筛选N4级别的词汇
      const n4Vocabulary = clip.vocabulary.filter(word => word.level === 'N4');
      if (n4Vocabulary.length > 0) {
        return {
          type: 'vocabulary',
          points: n4Vocabulary.slice(0, 3) // 最多取3个
        };
      }
    }
    
    // 默认返回片段的主要特点
    return {
      type: 'general',
      points: clip.tags.slice(0, 2) // 使用标签作为一般性描述
    };
  }
  
  /**
   * 生成导学标题
   * @private
   */
  _generateTitle(focusPoints) {
    if (focusPoints.type === 'grammar') {
      // 语法点导学标题
      if (focusPoints.points.length === 1) {
        return `今日重点：掌握「${focusPoints.points[0]}」的用法`;
      } else {
        return `今日重点：比较「${focusPoints.points[0]}」和「${focusPoints.points[1]}」的区别`;
      }
    } else if (focusPoints.type === 'vocabulary') {
      // 词汇导学标题
      return `今日重点：掌握${focusPoints.points.length}个常用N4词汇`;
    } else {
      // 一般性导学标题
      return `今日主题：${focusPoints.points.join('与')}场景日语表达`;
    }
  }
  
  /**
   * 生成简短说明
   * @private
   */
  _generateDescription(focusPoints, clip) {
    if (focusPoints.type === 'grammar') {
      // 语法点说明
      if (focusPoints.points.length === 1) {
        if (focusPoints.points[0] === '被动形') {
          return `本片段展示了「${focusPoints.points[0]}」在日常对话中的自然运用，注意角色如何表达"被动"的感受。`;
        } else {
          return `本片段包含「${focusPoints.points[0]}」的典型用法，注意观察上下文语境。`;
        }
      } else {
        return `本片段同时展示了「${focusPoints.points[0]}」和「${focusPoints.points[1]}」的用法，注意它们的区别和适用场景。`;
      }
    } else if (focusPoints.type === 'vocabulary') {
      // 词汇说明
      return `本片段包含多个N4级别的常用词汇，特别注意它们在对话中的实际应用。`;
    } else {
      // 一般性说明
      return `这个${focusPoints.points.join('与')}场景展示了日语在特定情境下的表达方式，注意角色的语气和表达习惯。`;
    }
  }
}

// 导出模块
module.exports = {
  ClipSelectionAlgorithm,
  LearningGuideGenerator
};
