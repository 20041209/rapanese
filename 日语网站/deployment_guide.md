# 【Anime日语每日课】部署指南

## 目录
1. [系统要求](#系统要求)
2. [安装步骤](#安装步骤)
3. [配置说明](#配置说明)
4. [数据库设置](#数据库设置)
5. [API集成](#api集成)
6. [启动与运行](#启动与运行)
7. [更新与维护](#更新与维护)
8. [故障排除](#故障排除)

## 系统要求

### 服务器要求
- **操作系统**：Ubuntu 20.04 LTS 或更高版本
- **CPU**：至少2核
- **内存**：至少4GB RAM
- **存储**：至少20GB可用空间
- **网络**：稳定的互联网连接

### 软件依赖
- **Node.js**：v16.0.0 或更高版本
- **MongoDB**：v4.4 或更高版本
- **FFmpeg**：用于音频处理
- **Python**：3.8 或更高版本（用于AI模型）
- **PM2**：用于进程管理

### 客户端要求
- **浏览器**：Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **设备**：支持桌面和移动设备（响应式设计）
- **音频**：支持麦克风输入（用于跟读功能）
- **存储**：至少100MB缓存空间

## 安装步骤

### 1. 准备环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 安装FFmpeg
sudo apt install -y ffmpeg

# 安装Python和依赖
sudo apt install -y python3 python3-pip
pip3 install torch torchvision torchaudio tensorflow numpy pandas scikit-learn

# 安装PM2
sudo npm install -g pm2
```

### 2. 获取项目代码

```bash
# 克隆代码仓库
git clone https://github.com/your-organization/anime-nihongo-daily.git
cd anime-nihongo-daily

# 安装依赖
npm install
```

### 3. 构建前端资源

```bash
# 构建前端资源
npm run build
```

## 配置说明

### 主配置文件

配置文件位于 `config/` 目录下，主要包括：

1. **config.js**：主配置文件
2. **database.js**：数据库配置
3. **api.js**：外部API配置
4. **auth.js**：认证配置

### 配置示例

编辑 `config/config.js` 文件：

```javascript
module.exports = {
  // 应用配置
  app: {
    name: 'Anime日语每日课',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    secret: process.env.APP_SECRET || 'your-secret-key'
  },
  
  // 媒体配置
  media: {
    clipStoragePath: process.env.CLIP_STORAGE_PATH || './media/clips',
    maxClipDuration: 30, // 秒
    supportedFormats: ['mp4', 'webm'],
    thumbnailQuality: 80
  },
  
  // 学习配置
  learning: {
    defaultLevel: 'N4',
    supportedLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    defaultInterests: ['校园', '热血', '科幻'],
    weeklyReportDay: 0, // 0表示周日
    minWordFrequencyForCollection: 2
  },
  
  // 其他配置
  ...
};
```

## 数据库设置

### MongoDB设置

1. **创建数据库和用户**

```javascript
// 连接MongoDB
use anime_nihongo_daily

// 创建用户
db.createUser({
  user: "animeuser",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "anime_nihongo_daily" }]
})
```

2. **导入初始数据**

```bash
# 导入动漫片段数据
mongoimport --db anime_nihongo_daily --collection clips --file data/clips.json --jsonArray

# 导入词汇数据
mongoimport --db anime_nihongo_daily --collection vocabulary --file data/vocabulary.json --jsonArray

# 导入语法数据
mongoimport --db anime_nihongo_daily --collection grammar --file data/grammar.json --jsonArray
```

### 数据库配置

编辑 `config/database.js` 文件：

```javascript
module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/anime_nihongo_daily',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: process.env.MONGODB_USER || 'animeuser',
      pass: process.env.MONGODB_PASS || 'secure_password'
    }
  }
};
```

## API集成

### 外部API配置

编辑 `config/api.js` 文件，配置外部API：

```javascript
module.exports = {
  // 语音合成API（用于慢速复读）
  tts: {
    provider: 'azure', // 'azure', 'google', 'local'
    azure: {
      key: process.env.AZURE_TTS_KEY || 'your-azure-key',
      region: process.env.AZURE_TTS_REGION || 'eastasia',
      endpoint: process.env.AZURE_TTS_ENDPOINT || 'https://eastasia.tts.speech.microsoft.com/'
    },
    google: {
      keyFilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/google-credentials.json'
    }
  },
  
  // 语音识别API（用于跟读打分）
  stt: {
    provider: 'azure', // 'azure', 'google', 'local'
    azure: {
      key: process.env.AZURE_STT_KEY || 'your-azure-key',
      region: process.env.AZURE_STT_REGION || 'eastasia',
      endpoint: process.env.AZURE_STT_ENDPOINT || 'https://eastasia.stt.speech.microsoft.com/'
    }
  },
  
  // 日语分析API（用于点击查词和填空游戏）
  japaneseAnalysis: {
    provider: 'local', // 使用本地模型
    modelPath: './models/japanese-analysis'
  }
};
```

### 配置API密钥

为安全起见，建议使用环境变量设置API密钥：

```bash
# 创建.env文件
touch .env

# 编辑.env文件
echo "AZURE_TTS_KEY=your-azure-tts-key" >> .env
echo "AZURE_STT_KEY=your-azure-stt-key" >> .env
echo "MONGODB_USER=animeuser" >> .env
echo "MONGODB_PASS=secure_password" >> .env
```

## 启动与运行

### 开发环境启动

```bash
# 启动开发服务器
npm run dev
```

### 生产环境启动

```bash
# 使用PM2启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### 访问应用

应用默认运行在 `http://localhost:3000`

### 配置Nginx反向代理（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 更新与维护

### 更新应用

```bash
# 进入应用目录
cd anime-nihongo-daily

# 拉取最新代码
git pull

# 安装依赖
npm install

# 构建前端资源
npm run build

# 重启应用
pm2 restart all
```

### 数据库备份

```bash
# 创建备份目录
mkdir -p backups

# 备份数据库
mongodump --db anime_nihongo_daily --out backups/$(date +%Y-%m-%d)

# 设置定时备份（每天凌晨3点）
(crontab -l 2>/dev/null; echo "0 3 * * * mongodump --db anime_nihongo_daily --out /path/to/anime-nihongo-daily/backups/\$(date +\%Y-\%m-\%d)") | crontab -
```

### 日志管理

```bash
# 查看应用日志
pm2 logs

# 查看特定应用日志
pm2 logs anime-nihongo-daily

# 清除日志
pm2 flush
```

## 故障排除

### 常见问题

1. **应用无法启动**
   - 检查Node.js版本是否符合要求
   - 确认所有依赖已正确安装
   - 检查配置文件是否正确
   - 查看错误日志：`pm2 logs`

2. **数据库连接失败**
   - 确认MongoDB服务正在运行：`sudo systemctl status mongod`
   - 检查数据库连接字符串和凭据
   - 确认MongoDB用户权限正确

3. **音频处理功能失败**
   - 确认FFmpeg已正确安装：`ffmpeg -version`
   - 检查音频API配置
   - 确认服务器有足够的处理能力

4. **AI功能不工作**
   - 检查Python依赖是否正确安装
   - 确认AI模型文件存在
   - 检查API密钥是否有效

### 诊断命令

```bash
# 检查系统资源
htop

# 检查磁盘空间
df -h

# 检查应用状态
pm2 status

# 检查MongoDB状态
sudo systemctl status mongod

# 检查网络连接
netstat -tulpn | grep LISTEN
```

### 联系支持

如遇到无法解决的问题，请联系技术支持：

- **邮箱**：tech-support@animenihongo.com
- **问题报告**：https://github.com/your-organization/anime-nihongo-daily/issues
