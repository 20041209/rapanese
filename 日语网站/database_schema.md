# 【Anime日语每日课】数据库模式设计

## 1. 动漫片段数据库结构

### 1.1 片段集合 (clips)

```json
{
  "_id": "ObjectId",
  "title": "片段标题",
  "anime_title": "动漫名称",
  "duration": 30,  // 片段时长（秒）
  "file_path": "clips/naruto_ep01_scene03.mp4",
  "thumbnail_path": "thumbnails/naruto_ep01_scene03.jpg",
  "language_level": "N4",  // 日语难度级别
  "tags": ["校园", "热血", "科幻"],  // 兴趣标签
  "grammar_points": ["被动形", "敬语"],  // 包含的语法点
  "vocabulary": [
    {
      "word": "学校",
      "reading": "がっこう",
      "meaning": "学校",
      "level": "N5",
      "timestamp": 5.2  // 在视频中出现的时间点（秒）
    },
    // 更多词汇...
  ],
  "subtitles": [
    {
      "start_time": 0.5,
      "end_time": 3.2,
      "jp_text": "おはよう、鈴木さん。",
      "cn_text": "早上好，铃木同学。",
      "grammar_points": ["敬语"]  // 该句包含的语法点
    },
    // 更多字幕...
  ],
  "difficulty_score": 3.5,  // 综合难度评分（1-5）
  "popularity": 85,  // 受欢迎程度（0-100）
  "copyright_status": "verified",  // 版权状态：已验证合规
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 1.2 语法点集合 (grammar_points)

```json
{
  "_id": "ObjectId",
  "name": "被动形",
  "description": "表示被动、被迫或自然发生的语法形式",
  "level": "N4",
  "examples": [
    {
      "jp_text": "この本は多くの人に読まれています。",
      "cn_text": "这本书被很多人阅读。",
      "explanation": "使用'読まれる'表示被动态，'読む'的被动形式"
    },
    // 更多例句...
  ],
  "related_points": ["使役形", "使役被动形"],
  "usage_notes": "被动形通常用于表达某事物被他人所为或自然发生的状态",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 1.3 用户集合 (users)

```json
{
  "_id": "ObjectId",
  "username": "user123",
  "language_level": "N4",
  "learning_focus": ["被动形", "敬语"],  // 当前学习重点
  "interest_tags": ["校园", "热血", "科幻"],  // 兴趣标签
  "learning_history": [
    {
      "clip_id": "ObjectId(ref:clips)",
      "date": "ISODate",
      "completed": true,
      "quiz_score": 85,
      "pronunciation_score": 78,
      "new_vocabulary": ["学校", "先生"]  // 学习的新词汇
    },
    // 更多学习记录...
  ],
  "vocabulary_bank": [
    {
      "word": "学校",
      "reading": "がっこう",
      "meaning": "学校",
      "level": "N5",
      "mastery": 0.8,  // 掌握程度（0-1）
      "last_reviewed": "ISODate"
    },
    // 更多词汇...
  ],
  "grammar_mastery": [
    {
      "grammar_point": "被动形",
      "mastery": 0.6,  // 掌握程度（0-1）
      "last_reviewed": "ISODate"
    },
    // 更多语法点...
  ],
  "settings": {
    "subtitle_mode": "dual",  // 字幕模式：双语
    "review_frequency": "high",  // 复习频率
    "notification_enabled": true
  },
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 1.4 学习报告集合 (reports)

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId(ref:users)",
  "report_type": "weekly",  // 报告类型：每周
  "start_date": "ISODate",
  "end_date": "ISODate",
  "vocabulary_stats": {
    "total_learned": 35,
    "mastered": 28,
    "needs_review": 7
  },
  "grammar_stats": {
    "total_learned": 5,
    "mastered": 3,
    "needs_review": 2
  },
  "learning_time": 120,  // 学习时间（分钟）
  "pronunciation_progress": 0.15,  // 发音进步幅度
  "quiz_accuracy": 0.82,  // 测验准确率
  "motivation_quote": {
    "quote": "継続は力なり",
    "translation": "坚持就是力量",
    "character": "炭治郎",
    "anime": "鬼灭之刃"
  },
  "created_at": "ISODate"
}
```

## 2. 索引设计

为提高查询效率，设计以下索引：

### 2.1 片段集合索引
- `language_level`: 1  // 按语言级别查询
- `tags`: 1  // 按兴趣标签查询
- `grammar_points`: 1  // 按语法点查询
- `difficulty_score`: 1  // 按难度查询
- 复合索引: `{language_level: 1, tags: 1, grammar_points: 1}`  // 多条件筛选

### 2.2 语法点集合索引
- `level`: 1  // 按级别查询
- `name`: 1  // 按名称查询

### 2.3 用户集合索引
- `username`: 1  // 按用户名查询
- `language_level`: 1  // 按语言级别查询
- `learning_focus`: 1  // 按学习重点查询

### 2.4 学习报告集合索引
- `user_id`: 1  // 按用户ID查询
- `report_type`: 1  // 按报告类型查询
- `end_date`: -1  // 按日期倒序查询
- 复合索引: `{user_id: 1, report_type: 1, end_date: -1}`  // 查询用户最近报告

## 3. 数据关系图

```
+---------------+       +------------------+
|    clips      |------>|  grammar_points  |
+---------------+       +------------------+
       ^                         ^
       |                         |
       |                         |
       |                         |
+---------------+       +------------------+
|    users      |------>|     reports      |
+---------------+       +------------------+
```

## 4. 数据迁移与备份策略

1. **初始数据导入**：使用JSON格式批量导入初始动漫片段和语法点数据
2. **定期备份**：每日自动备份所有集合数据
3. **增量更新**：新增动漫片段时进行增量更新
4. **数据验证**：导入前验证数据完整性和格式正确性

## 5. 数据安全考虑

1. **用户数据加密**：敏感用户信息使用加密存储
2. **访问控制**：实施基于角色的访问控制
3. **数据隔离**：用户数据与内容数据严格隔离
4. **审计日志**：记录所有数据修改操作
