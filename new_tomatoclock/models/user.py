from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
import os

@dataclass
class Task:
    name: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None

@dataclass
class Achievement:
    name: str
    description: str
    unlocked: bool = False
    unlock_date: Optional[datetime] = None

@dataclass
class DailyStats:
    date: datetime
    completed_pomodoros: int = 0
    total_work_time: timedelta = timedelta(0)
    total_break_time: timedelta = timedelta(0)
    tasks_completed: int = 0

class User:
    def __init__(self):
        self.username: str = "default_user"
        self.tasks: List[Task] = []
        self.achievements: List[Achievement] = []
        self.stats: Dict[datetime, DailyStats] = {}
        self._load_default_achievements()
        
    def _load_default_achievements(self):
        self.achievements = [
            Achievement(name="First Timer", 
                       description="Complete your first Pomodoro"),
            Achievement(name="Marathon Runner", 
                       description="Complete 10 Pomodoros in one day"),
            Achievement(name="Consistent Worker", 
                       description="Use the app for 7 consecutive days"),
            Achievement(name="Task Master", 
                       description="Complete 50 tasks")
        ]

    def add_task(self, task: Task):
        self.tasks.append(task)

    def complete_task(self, task_index: int):
        if 0 <= task_index < len(self.tasks):
            task = self.tasks[task_index]
            task.completed = True
            task.completed_at = datetime.now()

    def update_stats(self, work_time: timedelta, break_time: timedelta):
        today = datetime.today().date()
        if today not in self.stats:
            self.stats[today] = DailyStats(date=datetime.now())
        
        self.stats[today].completed_pomodoros += 1
        self.stats[today].total_work_time += work_time
        self.stats[today].total_break_time += break_time

    def check_achievements(self):
        # Check for First Timer achievement
        if not any(a.name == "First Timer" and a.unlocked for a in self.achievements):
            total_pomodoros = sum(stats.completed_pomodoros for stats in self.stats.values())
            if total_pomodoros > 0:
                self._unlock_achievement("First Timer")

        # Check for Marathon Runner achievement
        if not any(a.name == "Marathon Runner" and a.unlocked for a in self.achievements):
            max_daily = max((stats.completed_pomodoros for stats in self.stats.values()), default=0)
            if max_daily >= 10:
                self._unlock_achievement("Marathon Runner")

    def _unlock_achievement(self, name: str):
        for achievement in self.achievements:
            if achievement.name == name and not achievement.unlocked:
                achievement.unlocked = True
                achievement.unlock_date = datetime.now()
                break

    def save_data(self, file_path: str):
        data = {
            "username": self.username,
            "tasks": [task.__dict__ for task in self.tasks],
            "achievements": [achievement.__dict__ for achievement in self.achievements],
            "stats": {
                date.isoformat(): stats.__dict__ 
                for date, stats in self.stats.items()
            }
        }
        
        try:
            with open(file_path, "w") as f:
                json.dump(data, f, default=str)
        except Exception as e:
            print(f"Error saving user data: {e}")

    def load_data(self, file_path: str):
        if not os.path.exists(file_path):
            return
            
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
                self.username = data.get("username", "default_user")
                self.tasks = [Task(**task) for task in data.get("tasks", [])]
                self.achievements = [Achievement(**achievement) 
                                   for achievement in data.get("achievements", [])]
                self.stats = {
                    datetime.fromisoformat(date): DailyStats(**stats) 
                    for date, stats in data.get("stats", {}).items()
                }
        except Exception as e:
            print(f"Error loading user data: {e}")
