// 修改后的数据库工具库，不依赖@vercel/postgres

// 数据库连接工具
// 注意：在实际部署时，这里会使用Cloudflare D1数据库
export const sql = {
  // 模拟SQL查询执行
  async query(strings: TemplateStringsArray, ...values: any[]) {
    console.log('执行SQL查询:', strings.join('?'), values);
    return []; // 模拟空结果集
  },
  
  // 支持原始SQL字符串
  raw(sql: string) {
    return sql;
  }
};

// 通用错误处理函数
export function handleApiError(error: unknown) {
  console.error('API错误:', error);
  return { success: false, message: '操作失败，请稍后再试' };
}

// 格式化日期为YYYY-MM-DD
export function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

// 计算百分比
export function calculatePercentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

// 获取本周的开始和结束日期（周一到周日）
export function getWeekDates() {
  const now = new Date();
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
}

// 动漫名言集合
export const animeQuotes = [
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
  },
  {
    text: '「人は、強くなりたいと思った時、本当に強くなれるんだ。」',
    translation: '"人在想要变强的时候，才能真正变强。"',
    character: '灶门炭治郎',
    anime: '《鬼灭之刃》'
  },
  {
    text: '「どんなに暗い夜でも、必ず朝は来る。」',
    translation: '"无论夜晚多么黑暗，黎明终将到来。"',
    character: '雷电影',
    anime: '《进击的巨人》'
  }
];
