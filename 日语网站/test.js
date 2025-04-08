// 【Anime日语每日课】系统测试脚本

/**
 * 系统测试脚本
 * 测试所有功能模块的集成和性能
 */

// 导入主应用
const { AnimeNihongoDaily } = require('./app');

/**
 * 运行系统测试
 */
async function runSystemTests() {
  console.log('开始运行系统测试...');
  
  // 创建测试结果对象
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: []
  };
  
  // 运行测试用例
  await runTestCase('初始化应用', testAppInitialization, testResults);
  await runTestCase('加载今日片段', testLoadTodayClip, testResults);
  await runTestCase('点击查词功能', testWordLookup, testResults);
  await runTestCase('慢速复读功能', testSlowReplay, testResults);
  await runTestCase('跟读打分系统', testPronunciationScorer, testResults);
  await runTestCase('趣味填空游戏', testGapFillingGame, testResults);
  await runTestCase('键盘快捷键支持', testKeyboardShortcuts, testResults);
  await runTestCase('知识收集系统', testKnowledgeCollector, testResults);
  await runTestCase('碎片复习弹幕', testReviewDanmaku, testResults);
  await runTestCase('每周学习报告', testWeeklyReport, testResults);
  await runTestCase('性能测试', testPerformance, testResults);
  
  // 输出测试结果摘要
  console.log('\n测试结果摘要:');
  console.log(`总测试数: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`跳过: ${testResults.skipped}`);
  console.log(`通过率: ${(testResults.passed / testResults.total * 100).toFixed(2)}%`);
  
  // 输出详细测试结果
  console.log('\n详细测试结果:');
  testResults.details.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.status}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    if (result.duration) {
      console.log(`   耗时: ${result.duration}ms`);
    }
  });
  
  return testResults;
}

/**
 * 运行单个测试用例
 * @param {String} name - 测试名称
 * @param {Function} testFn - 测试函数
 * @param {Object} results - 测试结果对象
 */
async function runTestCase(name, testFn, results) {
  console.log(`\n运行测试: ${name}`);
  results.total++;
  
  const startTime = Date.now();
  
  try {
    await testFn();
    
    const duration = Date.now() - startTime;
    console.log(`✓ 测试通过: ${name} (${duration}ms)`);
    
    results.passed++;
    results.details.push({
      name,
      status: 'passed',
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`✗ 测试失败: ${name}`);
    console.error(`  错误: ${error.message}`);
    
    results.failed++;
    results.details.push({
      name,
      status: 'failed',
      error: error.message,
      duration
    });
  }
}

/**
 * 测试应用初始化
 */
async function testAppInitialization() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  const initialized = await app.initialize();
  
  // 验证初始化结果
  if (!initialized) {
    throw new Error('应用初始化失败');
  }
  
  // 验证模块是否已初始化
  const requiredModules = [
    'clipSelector',
    'wordLookup',
    'slowReplayController',
    'pronunciationScorerController',
    'gapFillingGameController',
    'keyboardShortcuts',
    'knowledgeCollectorController',
    'reviewDanmakuController',
    'weeklyReportController'
  ];
  
  for (const moduleName of requiredModules) {
    if (!app.modules[moduleName]) {
      throw new Error(`模块未初始化: ${moduleName}`);
    }
  }
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试加载今日片段
 */
async function testLoadTodayClip() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 加载今日片段
  const clip = await app.loadTodayClip();
  
  // 验证片段数据
  if (!clip) {
    throw new Error('加载今日片段失败');
  }
  
  if (!clip.videoUrl) {
    throw new Error('片段缺少视频URL');
  }
  
  if (!clip.subtitles || clip.subtitles.length === 0) {
    throw new Error('片段缺少字幕数据');
  }
  
  // 验证当前片段是否已设置
  if (app.currentClip !== clip) {
    throw new Error('当前片段未正确设置');
  }
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试点击查词功能
 */
async function testWordLookup() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 验证点击查词模块
  if (!app.modules.wordLookup) {
    throw new Error('点击查词模块未初始化');
  }
  
  // 模拟单词点击
  const wordInfo = {
    word: '学校',
    reading: 'がっこう',
    meaning: '学校',
    level: 'N5'
  };
  
  // 触发自定义事件
  const event = new CustomEvent('wordClick', {
    detail: { wordInfo }
  });
  document.dispatchEvent(event);
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试慢速复读功能
 */
async function testSlowReplay() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 验证慢速复读模块
  if (!app.modules.slowReplayGenerator || !app.modules.slowReplayController) {
    throw new Error('慢速复读模块未初始化');
  }
  
  // 模拟设置当前字幕
  const subtitle = {
    jp_text: '私は学校に行きます。',
    cn_text: '我去学校。',
    start_time: 0,
    end_time: 3
  };
  
  app.modules.slowReplayController.setCurrentSubtitle(subtitle);
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试跟读打分系统
 */
async function testPronunciationScorer() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 验证跟读打分模块
  if (!app.modules.pronunciationScorer || !app.modules.pronunciationScorerController) {
    throw new Error('跟读打分模块未初始化');
  }
  
  // 模拟设置当前字幕
  const subtitle = {
    jp_text: '私は学校に行きます。',
    cn_text: '我去学校。',
    start_time: 0,
    end_time: 3
  };
  
  app.modules.pronunciationScorerController.setCurrentSubtitle(subtitle, 'test-audio.mp3');
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试趣味填空游戏
 */
async function testGapFillingGame() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 验证趣味填空游戏模块
  if (!app.modules.gapFillingGame || !app.modules.gapFillingGameController) {
    throw new Error('趣味填空游戏模块未初始化');
  }
  
  // 模拟设置当前字幕
  const subtitle = {
    jp_text: '私は学校に行きます。友達と一緒に勉強します。',
    cn_text: '我去学校。和朋友一起学习。',
    start_time: 0,
    end_time: 5
  };
  
  // 开始游戏
  app.modules.gapFillingGameController.startGame(subtitle);
  
  // 验证问题生成
  const questions = app.modules.gapFillingGame.questions;
  if (!questions || questions.length === 0) {
    throw new Error('趣味填空游戏未生成问题');
  }
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试键盘快捷键支持
 */
async function testKeyboardShortcuts() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 验证键盘快捷键模块
  if (!app.modules.keyboardShortcuts || !app.modules.shortcutHelpController) {
    throw new Error('键盘快捷键模块未初始化');
  }
  
  // 验证快捷键回调是否已注册
  const callbackCount = Object.keys(app.modules.keyboardShortcuts.callbacks).length;
  if (callbackCount === 0) {
    throw new Error('未注册任何快捷键回调');
  }
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试知识收集系统
 */
async function testKnowledgeCollector() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 验证知识收集模块
  if (!app.modules.knowledgeCollector || !app.modules.knowledgeCollectorController) {
    throw new Error('知识收集模块未初始化');
  }
  
  // 模拟单词点击
  const wordInfo = {
    word: '学校',
    reading: 'がっこう',
    meaning: '学校',
    level: 'N5'
  };
  
  // 记录单词点击
  app.modules.knowledgeCollectorController.handleWordClick(wordInfo);
  
  // 再次点击同一个单词，触发收集
  app.modules.knowledgeCollectorController.handleWordClick(wordInfo);
  
  // 验证单词是否已收集
  const collectedWords = app.modules.knowledgeCollector.getCollectedWords();
  if (collectedWords.length === 0) {
    throw new Error('单词未被收集');
  }
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试碎片复习弹幕
 */
async function testReviewDanmaku() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 验证碎片复习弹幕模块
  if (!app.modules.reviewDanmaku || !app.modules.reviewDanmakuController) {
    throw new Error('碎片复习弹幕模块未初始化');
  }
  
  // 创建弹幕容器
  const container = document.createElement('div');
  container.id = 'danmaku-container';
  document.body.appendChild(container);
  
  // 初始化弹幕系统
  const initialized = app.modules.reviewDanmaku.initialize();
  if (!initialized) {
    throw new Error('弹幕系统初始化失败');
  }
  
  // 启动弹幕
  app.modules.reviewDanmaku.start();
  
  // 验证弹幕是否正在播放
  if (!app.modules.reviewDanmaku.isPlaying) {
    throw new Error('弹幕未开始播放');
  }
  
  // 停止弹幕
  app.modules.reviewDanmaku.stop();
  
  // 移除弹幕容器
  document.body.removeChild(container);
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试每周学习报告
 */
async function testWeeklyReport() {
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 初始化应用
  await app.initialize();
  
  // 验证每周学习报告模块
  if (!app.modules.weeklyReportGenerator || !app.modules.weeklyReportController) {
    throw new Error('每周学习报告模块未初始化');
  }
  
  // 收集学习数据
  await app.modules.weeklyReportGenerator.collectLearningData();
  
  // 生成报告
  const report = app.modules.weeklyReportGenerator.generateWeeklyReport();
  
  // 验证报告数据
  if (!report || !report.stats) {
    throw new Error('生成报告失败');
  }
  
  // 验证报告HTML
  const reportHTML = app.modules.weeklyReportGenerator.generateReportHTML(report);
  if (!reportHTML || reportHTML.length === 0) {
    throw new Error('生成报告HTML失败');
  }
  
  // 销毁应用
  app.destroy();
}

/**
 * 测试系统性能
 */
async function testPerformance() {
  console.log('开始性能测试...');
  
  // 创建应用实例
  const app = new AnimeNihongoDaily({
    autoStart: false
  });
  
  // 测试初始化性能
  console.log('测试初始化性能...');
  const initStartTime = Date.now();
  await app.initialize();
  const initDuration = Date.now() - initStartTime;
  console.log(`应用初始化耗时: ${initDuration}ms`);
  
  if (initDuration > 5000) {
    console.warn('警告: 应用初始化时间过长');
  }
  
  // 测试加载片段性能
  console.log('测试加载片段性能...');
  const loadStartTime = Date.now();
  await app.loadTodayClip();
  const loadDuration = Date.now() - loadStartTime;
  console.log(`加载今日片段耗时: ${loadDuration}ms`);
  
  if (loadDuration > 3000) {
    console.warn('警告: 加载片段时间过长');
  }
  
  // 测试内存使用
  console.log('测试内存使用...');
  if (global.gc) {
    global.gc(); // 强制垃圾回收
  }
  
  // 在实际环境中，这里应该使用适当的方法测量内存使用
  // 由于浏览器环境限制，这里只是模拟
  
  // 销毁应用
  app.destroy();
  
  console.log('性能测试完成');
}

// 运行测试
runSystemTests().then(results => {
  if (results.failed > 0) {
    console.error(`测试失败: ${results.failed}/${results.total}`);
    process.exit(1);
  } else {
    console.log(`所有测试通过: ${results.passed}/${results.total}`);
    process.exit(0);
  }
}).catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
