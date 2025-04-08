'use server';

import { sql } from '@/lib/db';

// 知识收集器 - 收集用户查看的词汇
export async function collectVocabulary(userId: number, vocabularyId: number) {
  try {
    // 检查用户是否已经有这个词汇
    const existingRecord = await sql`
      SELECT * FROM user_vocabulary 
      WHERE user_id = ${userId} AND vocabulary_id = ${vocabularyId}
    `;
    
    if (existingRecord.length === 0) {
      // 如果用户没有这个词汇，添加新记录
      await sql`
        INSERT INTO user_vocabulary (user_id, vocabulary_id, mastery, review_count)
        VALUES (${userId}, ${vocabularyId}, 10, 1)
      `;
      return { success: true, message: '词汇已添加到您的词库', isNew: true };
    } else {
      // 如果用户已有这个词汇，更新复习次数
      await sql`
        UPDATE user_vocabulary
        SET review_count = review_count + 1,
            last_reviewed = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND vocabulary_id = ${vocabularyId}
      `;
      return { success: true, message: '词汇复习次数已更新', isNew: false };
    }
  } catch (error) {
    console.error('收集词汇失败:', error);
    return { success: false, message: '收集词汇失败，请稍后再试' };
  }
}

// 知识收集器 - 收集用户查看的语法点
export async function collectGrammar(userId: number, grammarId: number) {
  try {
    // 检查用户是否已经有这个语法点
    const existingRecord = await sql`
      SELECT * FROM user_grammar 
      WHERE user_id = ${userId} AND grammar_id = ${grammarId}
    `;
    
    if (existingRecord.length === 0) {
      // 如果用户没有这个语法点，添加新记录
      await sql`
        INSERT INTO user_grammar (user_id, grammar_id, mastery, review_count)
        VALUES (${userId}, ${grammarId}, 10, 1)
      `;
      return { success: true, message: '语法点已添加到您的学习记录', isNew: true };
    } else {
      // 如果用户已有这个语法点，更新复习次数
      await sql`
        UPDATE user_grammar
        SET review_count = review_count + 1,
            last_reviewed = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND grammar_id = ${grammarId}
      `;
      return { success: true, message: '语法点复习次数已更新', isNew: false };
    }
  } catch (error) {
    console.error('收集语法点失败:', error);
    return { success: false, message: '收集语法点失败，请稍后再试' };
  }
}

// 获取用户的词汇列表
export async function getUserVocabulary(userId: number, options: {
  level?: string;
  category?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  const { level, category, sortBy = 'recent', page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;
  
  try {
    // 构建查询条件
    let whereClause = `WHERE uv.user_id = ${userId}`;
    if (level && level !== 'all') {
      whereClause += ` AND v.level = '${level}'`;
    }
    if (category && category !== 'all') {
      whereClause += ` AND v.category = '${category}'`;
    }
    
    // 构建排序条件
    let orderClause = '';
    switch (sortBy) {
      case 'mastery-asc':
        orderClause = 'ORDER BY uv.mastery ASC';
        break;
      case 'mastery-desc':
        orderClause = 'ORDER BY uv.mastery DESC';
        break;
      case 'alphabetical':
        orderClause = 'ORDER BY v.word ASC';
        break;
      case 'recent':
      default:
        orderClause = 'ORDER BY uv.created_at DESC';
        break;
    }
    
    // 获取总记录数
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM user_vocabulary uv
      JOIN vocabulary v ON uv.vocabulary_id = v.id
      ${sql.raw(whereClause)}
    `;
    
    const total = countResult[0].total;
    
    // 获取分页数据
    const vocabularyList = await sql`
      SELECT 
        v.id,
        v.word,
        v.reading,
        v.meaning,
        v.example,
        v.example_translation,
        v.level,
        v.category,
        v.tags,
        uv.mastery,
        uv.review_count,
        uv.last_reviewed,
        uv.created_at
      FROM user_vocabulary uv
      JOIN vocabulary v ON uv.vocabulary_id = v.id
      ${sql.raw(whereClause)}
      ${sql.raw(orderClause)}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return {
      success: true,
      data: {
        vocabulary: vocabularyList,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    console.error('获取用户词汇失败:', error);
    return { success: false, message: '获取用户词汇失败，请稍后再试' };
  }
}

// 获取用户的语法点列表
export async function getUserGrammar(userId: number, options: {
  level?: string;
  page?: number;
  limit?: number;
}) {
  const { level, page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;
  
  try {
    // 构建查询条件
    let whereClause = `WHERE ug.user_id = ${userId}`;
    if (level && level !== 'all') {
      whereClause += ` AND g.level = '${level}'`;
    }
    
    // 获取总记录数
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM user_grammar ug
      JOIN grammar_points g ON ug.grammar_id = g.id
      ${sql.raw(whereClause)}
    `;
    
    const total = countResult[0].total;
    
    // 获取分页数据
    const grammarList = await sql`
      SELECT 
        g.id,
        g.pattern,
        g.meaning,
        g.explanation,
        g.example,
        g.example_translation,
        g.level,
        ug.mastery,
        ug.review_count,
        ug.last_reviewed,
        ug.created_at
      FROM user_grammar ug
      JOIN grammar_points g ON ug.grammar_id = g.id
      ${sql.raw(whereClause)}
      ORDER BY ug.mastery ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return {
      success: true,
      data: {
        grammar: grammarList,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    console.error('获取用户语法点失败:', error);
    return { success: false, message: '获取用户语法点失败，请稍后再试' };
  }
}

// 获取用户的复习弹幕内容
export async function getReviewDanmaku(userId: number) {
  try {
    // 获取用户需要复习的词汇（掌握度低于80%的词汇）
    const vocabularyToReview = await sql`
      SELECT 
        v.id,
        v.word,
        v.reading,
        v.meaning,
        v.level,
        v.category,
        uv.mastery
      FROM user_vocabulary uv
      JOIN vocabulary v ON uv.vocabulary_id = v.id
      WHERE uv.user_id = ${userId} AND uv.mastery < 80
      ORDER BY uv.mastery ASC
      LIMIT 10
    `;
    
    // 获取用户需要复习的语法点（掌握度低于80%的语法点）
    const grammarToReview = await sql`
      SELECT 
        g.id,
        g.pattern,
        g.meaning,
        g.level,
        ug.mastery
      FROM user_grammar ug
      JOIN grammar_points g ON ug.grammar_id = g.id
      WHERE ug.user_id = ${userId} AND ug.mastery < 80
      ORDER BY ug.mastery ASC
      LIMIT 5
    `;
    
    // 格式化为弹幕内容
    const danmakuItems = [
      ...vocabularyToReview.map(item => ({
        content: `${item.word} (${item.reading}) - ${item.meaning}`,
        type: 'word' as const
      })),
      ...grammarToReview.map(item => ({
        content: `${item.pattern} - ${item.meaning}`,
        type: 'grammar' as const
      }))
    ];
    
    return { success: true, data: danmakuItems };
  } catch (error) {
    console.error('获取复习弹幕内容失败:', error);
    return { success: false, message: '获取复习弹幕内容失败，请稍后再试' };
  }
}

// 更新词汇掌握度
export async function updateVocabularyMastery(userId: number, vocabularyId: number, masteryChange: number) {
  try {
    // 获取当前掌握度
    const currentRecord = await sql`
      SELECT mastery FROM user_vocabulary
      WHERE user_id = ${userId} AND vocabulary_id = ${vocabularyId}
    `;
    
    if (currentRecord.length === 0) {
      return { success: false, message: '未找到该词汇记录' };
    }
    
    // 计算新掌握度，确保在0-100范围内
    let newMastery = Math.max(0, Math.min(100, currentRecord[0].mastery + masteryChange));
    
    // 更新掌握度
    await sql`
      UPDATE user_vocabulary
      SET mastery = ${newMastery},
          last_reviewed = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND vocabulary_id = ${vocabularyId}
    `;
    
    return { success: true, data: { newMastery } };
  } catch (error) {
    console.error('更新词汇掌握度失败:', error);
    return { success: false, message: '更新词汇掌握度失败，请稍后再试' };
  }
}

// 更新语法点掌握度
export async function updateGrammarMastery(userId: number, grammarId: number, masteryChange: number) {
  try {
    // 获取当前掌握度
    const currentRecord = await sql`
      SELECT mastery FROM user_grammar
      WHERE user_id = ${userId} AND grammar_id = ${grammarId}
    `;
    
    if (currentRecord.length === 0) {
      return { success: false, message: '未找到该语法点记录' };
    }
    
    // 计算新掌握度，确保在0-100范围内
    let newMastery = Math.max(0, Math.min(100, currentRecord[0].mastery + masteryChange));
    
    // 更新掌握度
    await sql`
      UPDATE user_grammar
      SET mastery = ${newMastery},
          last_reviewed = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND grammar_id = ${grammarId}
    `;
    
    return { success: true, data: { newMastery } };
  } catch (error) {
    console.error('更新语法点掌握度失败:', error);
    return { success: false, message: '更新语法点掌握度失败，请稍后再试' };
  }
}

// 记录学习活动
export async function recordStudyActivity(userId: number, clipId: number, data: {
  studyDuration: number;
  pronunciationScore?: number;
  gapFillingScore?: number;
}) {
  try {
    const { studyDuration, pronunciationScore, gapFillingScore } = data;
    
    await sql`
      INSERT INTO study_records (
        user_id, 
        clip_id, 
        study_duration, 
        pronunciation_score, 
        gap_filling_score
      )
      VALUES (
        ${userId}, 
        ${clipId}, 
        ${studyDuration}, 
        ${pronunciationScore || null}, 
        ${gapFillingScore || null}
      )
    `;
    
    return { success: true, message: '学习记录已保存' };
  } catch (error) {
    console.error('记录学习活动失败:', error);
    return { success: false, message: '记录学习活动失败，请稍后再试' };
  }
}

// 获取用户的每周学习报告
export async function getWeeklyReport(userId: number, weekStart?: string) {
  try {
    let whereClause = `WHERE user_id = ${userId}`;
    
    if (weekStart) {
      whereClause += ` AND week_start = '${weekStart}'`;
    }
    
    // 获取最新的报告（如果没有指定日期）
    const orderClause = weekStart ? '' : 'ORDER BY week_start DESC LIMIT 1';
    
    const report = await sql`
      SELECT * FROM weekly_reports
      ${sql.raw(whereClause)}
      ${sql.raw(orderClause)}
    `;
    
    if (report.length === 0) {
      return { success: false, message: '未找到学习报告' };
    }
    
    // 获取历史报告列表（最近4周）
    const historicalReports = await sql`
      SELECT 
        id, 
        week_start, 
        week_end, 
        study_days, 
        study_minutes, 
        new_vocabulary
      FROM weekly_reports
      WHERE user_id = ${userId}
      ORDER BY week_start DESC
      LIMIT 5
    `;
    
    // 获取每日学习数据（用于图表）
    const dailyData = await sql`
      SELECT 
        DATE(created_at) as study_date,
        SUM(study_duration) / 60 as minutes,
        COUNT(DISTINCT clip_id) as clips
      FROM study_records
      WHERE user_id = ${userId}
        AND created_at BETWEEN ${report[0].week_start} AND ${report[0].week_end}
      GROUP BY DATE(created_at)
      ORDER BY study_date
    `;
    
    return { 
      success: true, 
      data: {
        report: report[0],
        historicalReports,
        dailyData
      }
    };
  } catch (error) {
    console.error('获取每周学习报告失败:', error);
    return { success: false, message: '获取每周学习报告失败，请稍后再试' };
  }
}

// 生成每周学习报告
export async function generateWeeklyReport(userId: number) {
  try {
    // 获取当前日期
    const now = new Date();
    
    // 计算本周的开始和结束日期（周一到周日）
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // 格式化日期为YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    // 检查是否已经生成了本周的报告
    const existingReport = await sql`
      SELECT id FROM weekly_reports
      WHERE user_id = ${userId} AND week_start = ${formatDate(weekStart)}
    `;
    
    if (existingReport.length > 0) {
      return { success: false, message: '本周的学习报告已经生成' };
    }
    
    // 获取本周的学习记录
    const studyRecords = await sql`
      SELECT * FROM study_records
      WHERE user_id = ${userId}
        AND created_at BETWEEN ${formatDate(weekStart)} AND ${formatDate(weekEnd)}
    `;
    
    // 计算学习天数
    const studyDays = new Set(studyRecords.map(record => 
      new Date(record.created_at).toISOString().split('T')[0]
    )).size;
    
    // 计算学习时间（分钟）
    const studyMinutes = Math.round(studyRecords.reduce((total, record) => 
      total + record.study_duration, 0) / 60);
    
    // 获取本周新增词汇数量
    const newVocabulary = await sql`
      SELECT COUNT(*) as count FROM user_vocabulary
      WHERE user_id = ${userId}
        AND created_at BETWEEN ${formatDate(weekStart)} AND ${formatDate(weekEnd)}
    `;
    
    // 获取已掌握词汇数量（掌握度>=80%）
    const masteredVocabulary = await sql`
      SELECT COUNT(*) as count FROM user_vocabulary
      WHERE user_id = ${userId} AND mastery >= 80
    `;
    
    // 计算发音准确率和填空准确率
    let pronunciationAccuracy = 0;
    let gapFillingAccuracy = 0;
    
    if (studyRecords.length > 0) {
      const pronunciationScores = studyRecords
        .filter(record => record.pronunciation_score !== null)
        .map(record => record.pronunciation_score);
      
      const gapFillingScores = studyRecords
        .filter(record => record.gap_filling_score !== null)
        .map(record => record.gap_filling_score);
      
      if (pronunciationScores.length > 0) {
        pronunciationAccuracy = Math.round(
          pronunciationScores.reduce((sum, score) => sum + score, 0) / pronunciationScores.length
        );
      }
      
      if (gapFillingScores.length > 0) {
        gapFillingAccuracy = Math.round(
          gapFillingScores.reduce((sum, score) => sum + score, 0) / gapFillingScores.length
        );
      }
    }
    
    // 获取词汇掌握度分布
    const vocabularyMastery = await sql`
      SELECT
        SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) as beginner,
        SUM(CASE WHEN mastery >= 30 AND mastery < 60 THEN 1 ELSE 0 END) as intermediate,
        SUM(CASE WHEN mastery >= 60 AND mastery < 80 THEN 1 ELSE 0 END) as advanced,
        SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) as mastered,
        COUNT(*) as total
      FROM user_vocabulary
      WHERE user_id = ${userId}
    `;
    
    // 获取语法掌握度分布
    const grammarMastery = await sql`
      SELECT
        SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) as beginner,
        SUM(CASE WHEN mastery >= 30 AND mastery < 60 THEN 1 ELSE 0 END) as intermediate,
        SUM(CASE WHEN mastery >= 60 AND mastery < 80 THEN 1 ELSE 0 END) as advanced,
        SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) as mastered,
        COUNT(*) as total
      FROM user_grammar
      WHERE user_id = ${userId}
    `;
    
    // 计算百分比
    const calculatePercentage = (value: number, total: number) => {
      return total > 0 ? Math.round((value / total) * 100) : 0;
    };
    
    const vocabularyMasteryData = vocabularyMastery[0];
    const grammarMasteryData = grammarMastery[0];
    
    // 随机选择一句动漫角色名言
    const quotes = [
      {
        text: '「諦めないで。自分の夢を信じ続けることが大切だ。」',
        translation: '"不要放弃。重要的是继续相信自己的梦想。"',
        character: '立花 瀧',
        anime: '《你的名字。》'
      },
      {
        text: '「自分を信じて、前に進もう。」',
        translation: '"相信自己，向前进。"',
        character: '炭治郎',
        anime: '《鬼灭之刃》'
      },
      {
        text: '「一歩一歩、確実に前へ進んでいこう。」',
        translation: '"一步一步，稳扎稳打地向前进。"',
        character: '宫水 三叶',
        anime: '《你的名字。》'
      }
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    // 创建每周学习报告
    await sql`
      INSERT INTO weekly_reports (
        user_id, week_start, week_end, study_days, study_minutes, 
        new_vocabulary, mastered_vocabulary, pronunciation_accuracy, gap_filling_accuracy,
        vocabulary_mastery_beginner, vocabulary_mastery_inter
(Content truncated due to size limit. Use line ranges to read in chunks)