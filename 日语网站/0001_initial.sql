// 数据库迁移文件 - 初始化数据库表
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  japanese_level TEXT DEFAULT 'N4',
  interests TEXT DEFAULT '校园,热血,科幻',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- 动漫片段表
CREATE TABLE IF NOT EXISTS anime_clips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  anime_title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER NOT NULL, -- 秒数
  japanese_level TEXT NOT NULL, -- N5, N4, N3, N2, N1
  tags TEXT NOT NULL, -- 逗号分隔的标签
  grammar_points TEXT, -- 逗号分隔的语法点
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 字幕表
CREATE TABLE IF NOT EXISTS subtitles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clip_id INTEGER NOT NULL,
  start_time INTEGER NOT NULL, -- 毫秒
  end_time INTEGER NOT NULL, -- 毫秒
  japanese_text TEXT NOT NULL,
  chinese_text TEXT NOT NULL,
  FOREIGN KEY (clip_id) REFERENCES anime_clips(id)
);

-- 词汇表
CREATE TABLE IF NOT EXISTS vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  reading TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  example_translation TEXT,
  level TEXT NOT NULL, -- N5, N4, N3, N2, N1
  category TEXT NOT NULL, -- noun, verb, adjective, adverb, grammar
  tags TEXT, -- 逗号分隔的标签
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 语法点表
CREATE TABLE IF NOT EXISTS grammar_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern TEXT NOT NULL,
  meaning TEXT NOT NULL,
  explanation TEXT NOT NULL,
  example TEXT NOT NULL,
  example_translation TEXT NOT NULL,
  level TEXT NOT NULL, -- N5, N4, N3, N2, N1
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户词汇表（用户学习的词汇）
CREATE TABLE IF NOT EXISTS user_vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vocabulary_id INTEGER NOT NULL,
  mastery INTEGER DEFAULT 0, -- 0-100的掌握度
  last_reviewed TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id)
);

-- 用户语法点表（用户学习的语法点）
CREATE TABLE IF NOT EXISTS user_grammar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  grammar_id INTEGER NOT NULL,
  mastery INTEGER DEFAULT 0, -- 0-100的掌握度
  last_reviewed TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (grammar_id) REFERENCES grammar_points(id)
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS study_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  clip_id INTEGER NOT NULL,
  study_duration INTEGER NOT NULL, -- 秒数
  pronunciation_score INTEGER, -- 0-100的发音评分
  gap_filling_score INTEGER, -- 0-100的填空游戏评分
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (clip_id) REFERENCES anime_clips(id)
);

-- 每周学习报告表
CREATE TABLE IF NOT EXISTS weekly_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  study_days INTEGER NOT NULL,
  study_minutes INTEGER NOT NULL,
  new_vocabulary INTEGER NOT NULL,
  mastered_vocabulary INTEGER NOT NULL,
  pronunciation_accuracy INTEGER,
  gap_filling_accuracy INTEGER,
  vocabulary_mastery_beginner INTEGER, -- 百分比
  vocabulary_mastery_intermediate INTEGER, -- 百分比
  vocabulary_mastery_advanced INTEGER, -- 百分比
  vocabulary_mastery_mastered INTEGER, -- 百分比
  grammar_mastery_beginner INTEGER, -- 百分比
  grammar_mastery_intermediate INTEGER, -- 百分比
  grammar_mastery_advanced INTEGER, -- 百分比
  grammar_mastery_mastered INTEGER, -- 百分比
  quote_text TEXT,
  quote_translation TEXT,
  quote_character TEXT,
  quote_anime TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 插入一些示例数据
-- 用户
INSERT INTO users (username, email, password_hash, japanese_level, interests)
VALUES ('demo_user', 'demo@example.com', 'hashed_password', 'N4', '校园,热血,科幻');

-- 动漫片段
INSERT INTO anime_clips (title, anime_title, description, video_url, thumbnail_url, duration, japanese_level, tags, grammar_points)
VALUES 
('教室场景', '你的名字', '主角在教室里与朋友交谈', '/media/sample-clip.mp4', '/images/video-thumbnail.jpg', 30, 'N4', '校园,日常', '被动形,时间表达'),
('战斗场景', '鬼灭之刃', '炭治郎与鬼战斗', '/media/sample-clip2.mp4', '/images/video-thumbnail2.jpg', 25, 'N4', '热血,战斗', '命令形,意志表达'),
('未来科技', '攻壳机动队', '未来城市的科技展示', '/media/sample-clip3.mp4', '/images/video-thumbnail3.jpg', 28, 'N4', '科幻,未来', '可能性表达,推测');

-- 字幕
INSERT INTO subtitles (clip_id, start_time, end_time, japanese_text, chinese_text)
VALUES 
(1, 0, 5000, '私は毎日学校に行きます。', '我每天去学校。'),
(1, 5000, 10000, '友達と一緒に勉強されています。', '和朋友一起学习。');

-- 词汇
INSERT INTO vocabulary (word, reading, meaning, example, example_translation, level, category, tags)
VALUES 
('学校', 'がっこう', '学校', '毎日学校に行きます。', '每天去学校。', 'N5', 'noun', '校园,日常'),
('勉強', 'べんきょう', '学习，用功', '日本語を勉強しています。', '我在学习日语。', 'N5', 'noun', '校园,日常'),
('友達', 'ともだち', '朋友', '友達と一緒に勉強します。', '和朋友一起学习。', 'N5', 'noun', '校园,日常'),
('〜される', '〜される', '被动形：表示被动作或自发', '友達と一緒に勉強されています。', '和朋友一起被学习/正在学习。', 'N4', 'grammar', '语法'),
('一緒に', 'いっしょに', '一起，共同', '友達と一緒に映画を見ました。', '和朋友一起看了电影。', 'N5', 'adverb', '日常'),
('毎日', 'まいにち', '每天', '毎日日本語を勉強します。', '每天学习日语。', 'N5', 'adverb', '日常,时间');

-- 语法点
INSERT INTO grammar_points (pattern, meaning, explanation, example, example_translation, level)
VALUES 
('〜される', '被动形', '表示被某人做某事或自然而然地发生某事', '友達と一緒に勉強されています。', '和朋友一起被学习/正在学习。', 'N4'),
('〜ている', '进行时', '表示动作正在进行或状态持续', '日本語を勉強しています。', '我正在学习日语。', 'N5');

-- 用户词汇
INSERT INTO user_vocabulary (user_id, vocabulary_id, mastery, review_count)
VALUES 
(1, 1, 85, 5),
(1, 2, 92, 7),
(1, 3, 78, 4),
(1, 4, 45, 2),
(1, 5, 88, 6),
(1, 6, 95, 8);

-- 用户语法点
INSERT INTO user_grammar (user_id, grammar_id, mastery, review_count)
VALUES 
(1, 1, 45, 2),
(1, 2, 75, 5);

-- 学习记录
INSERT INTO study_records (user_id, clip_id, study_duration, pronunciation_score, gap_filling_score)
VALUES 
(1, 1, 600, 85, 92),
(1, 2, 540, 80, 88),
(1, 3, 480, 82, 90);

-- 每周学习报告
INSERT INTO weekly_reports (
  user_id, week_start, week_end, study_days, study_minutes, 
  new_vocabulary, mastered_vocabulary, pronunciation_accuracy, gap_filling_accuracy,
  vocabulary_mastery_beginner, vocabulary_mastery_intermediate, vocabulary_mastery_advanced, vocabulary_mastery_mastered,
  grammar_mastery_beginner, grammar_mastery_intermediate, grammar_mastery_advanced, grammar_mastery_mastered,
  quote_text, quote_translation, quote_character, quote_anime
)
VALUES (
  1, '2025-04-01', '2025-04-07', 7, 70, 
  42, 28, 85, 92,
  15, 35, 30, 20,
  25, 40, 20, 15,
  '「諦めないで。自分の夢を信じ続けることが大切だ。」', '"不要放弃。重要的是继续相信自己的梦想。"', '立花 瀧', '《你的名字。》'
);
