import sqlite3
from typing import Optional, Dict, List
from datetime import datetime
from pathlib import Path
import os

class DatabaseManager:
    def __init__(self, db_path: str = "tomatoclock.db"):
        self.db_path = db_path
        self._initialize_db()

    def _initialize_db(self):
        """初始化数据库和表结构"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # 创建用户表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 创建任务表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    completed BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    completed_at DATETIME,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """)
            
            # 创建统计表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    date DATE NOT NULL,
                    completed_pomodoros INTEGER DEFAULT 0,
                    total_work_time INTEGER DEFAULT 0,  -- in seconds
                    total_break_time INTEGER DEFAULT 0, -- in seconds
                    tasks_completed INTEGER DEFAULT 0,
                    UNIQUE(user_id, date),
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """)
            
            # 创建成就表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    unlocked BOOLEAN DEFAULT 0,
                    unlock_date DATETIME,
                    UNIQUE(user_id, name),
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """)
            
            conn.commit()

    def _get_connection(self):
        """获取数据库连接"""
        return sqlite3.connect(self.db_path)

    def create_user(self, username: str) -> Optional[int]:
        """创建新用户"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO users (username) VALUES (?)
                """, (username,))
                conn.commit()
                return cursor.lastrowid
            except sqlite3.IntegrityError:
                return None

    def add_task(self, user_id: int, task: Dict) -> int:
        """添加任务"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO tasks (user_id, name, description)
                VALUES (?, ?, ?)
            """, (user_id, task["name"], task["description"]))
            conn.commit()
            return cursor.lastrowid

    def complete_task(self, task_id: int):
        """标记任务完成"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE tasks 
                SET completed = 1, completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (task_id,))
            conn.commit()

    def update_stats(self, user_id: int, date: str, stats: Dict):
        """更新统计信息"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO stats (
                    user_id, date, completed_pomodoros, 
                    total_work_time, total_break_time, tasks_completed
                )
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, date) DO UPDATE SET
                    completed_pomodoros = completed_pomodoros + excluded.completed_pomodoros,
                    total_work_time = total_work_time + excluded.total_work_time,
                    total_break_time = total_break_time + excluded.total_break_time,
                    tasks_completed = tasks_completed + excluded.tasks_completed
            """, (
                user_id, date, stats["completed_pomodoros"],
                stats["total_work_time"], stats["total_break_time"],
                stats["tasks_completed"]
            ))
            conn.commit()

    def unlock_achievement(self, user_id: int, achievement: Dict):
        """解锁成就"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO achievements (
                    user_id, name, description, unlocked, unlock_date
                )
                VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, name) DO NOTHING
            """, (user_id, achievement["name"], achievement["description"]))
            conn.commit()

    def get_user_stats(self, user_id: int) -> List[Dict]:
        """获取用户统计信息"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT date, completed_pomodoros, total_work_time, total_break_time
                FROM stats
                WHERE user_id = ?
                ORDER BY date DESC
            """, (user_id,))
            return [dict(row) for row in cursor.fetchall()]

    def get_user_tasks(self, user_id: int, completed: bool = False) -> List[Dict]:
        """获取用户任务"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, description, completed, created_at, completed_at
                FROM tasks
                WHERE user_id = ? AND completed = ?
                ORDER BY created_at DESC
            """, (user_id, int(completed)))
            return [dict(row) for row in cursor.fetchall()]

    def get_user_achievements(self, user_id: int) -> List[Dict]:
        """获取用户成就"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT name, description, unlocked, unlock_date
                FROM achievements
                WHERE user_id = ?
                ORDER BY unlock_date DESC
            """, (user_id,))
            return [dict(row) for row in cursor.fetchall()]

    def backup_database(self, backup_path: str):
        """备份数据库"""
        try:
            with self._get_connection() as conn:
                with open(backup_path, "w") as f:
                    for line in conn.iterdump():
                        f.write(f"{line}\n")
        except Exception as e:
            print(f"Error backing up database: {e}")
