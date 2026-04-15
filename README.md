# TomatoClock (番茄时钟)

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## English

A Pomodoro Timer productivity application with cloud sync and leaderboard features.

**Live Demo**: https://zijin-pomodoro.netlify.app/

### Features

- **Pomodoro Timer** - Customizable work/break durations
- **Statistics** - Track your focus sessions, streaks, and XP progression
- **Achievements** - Unlock achievements as you progress
- **Leaderboard** - Compare your progress with other users worldwide
- **Cloud Sync** - Your stats sync automatically to the cloud
- **Privacy-First** - No email or phone required, anonymous UUID identification
- **Bilingual** - English and Chinese (中文) support
- **Themes** - Light and dark theme options

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + REST API)
- **Icons**: Lucide React

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Schema

The app uses two main tables in Supabase:

```sql
-- Users table (anonymous)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  is_fake BOOLEAN
);

-- User statistics
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY,
  total_sessions INTEGER,
  total_work_minutes INTEGER,
  current_streak INTEGER,
  level INTEGER,
  experience INTEGER,
  ...
);
```

### Known Issues

- Background music and white noise playback may not work properly on iOS devices

---

<a name="中文"></a>
## 中文

一款支持云端同步和排行榜功能的番茄时钟生产力应用。

**在线演示**: https://zijin-pomodoro.netlify.app/

### 功能特性

- **番茄时钟** - 可自定义工作和休息时长
- **数据统计** - 追踪专注次数、连续打卡天数和经验值进度
- **成就系统** - 随着进度解锁各种成就
- **排行榜** - 与全球用户比较进度
- **云端同步** - 数据自动同步到云端
- **隐私优先** - 无需邮箱或手机号，使用匿名 UUID 标识
- **双语支持** - 支持英文和中文
- **主题切换** - 浅色和深色主题可选

### 技术栈

- **前端**: React + TypeScript + Vite
- **样式**: Tailwind CSS
- **后端**: Supabase (PostgreSQL + REST API)
- **图标**: Lucide React

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 环境配置

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=你的-supabase-项目地址
VITE_SUPABASE_ANON_KEY=你的-supabase-公钥
```

### 数据库结构

应用在 Supabase 中使用两个主要表：

```sql
-- 用户表（匿名）
CREATE TABLE users (
  id UUID PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  is_fake BOOLEAN
);

-- 用户统计表
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY,
  total_sessions INTEGER,
  total_work_minutes INTEGER,
  current_streak INTEGER,
  level INTEGER,
  experience INTEGER,
  ...
);
```

### 已知问题

- iOS 设备上背景音乐和白噪声播放可能不正常

### 许可证

MIT
