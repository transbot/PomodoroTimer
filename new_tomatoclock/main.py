#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tkinter as tk
from tkinter import ttk, messagebox
import time
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from core.timer import PomodoroTimer, TimerState

class Task:
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.completed = False
        self.created_at = datetime.now()
        self.completed_at: Optional[datetime] = None

    def __str__(self):
        status = "✓" if self.completed else "◯"
        return f"{status} {self.name}"

class TomatoClockApp:
    def __init__(self):
        self.root = tk.Tk()
        self.timer = PomodoroTimer()
        self.timer.add_callback(self._handle_timer_update)
        self.tasks: List[Task] = []
        self.total_work_time = timedelta()
        self.setup_ui()
        
    def setup_ui(self):
        self.root.title("番茄钟 v2.0")
        self.root.geometry("500x400")
        
        # Main container
        main_container = ttk.Frame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Timer section
        timer_frame = ttk.LabelFrame(main_container, text="计时器")
        timer_frame.pack(fill=tk.X, pady=5)
        
        # Timer display
        self.time_label = ttk.Label(timer_frame, text="25:00", font=("Arial", 48))
        self.time_label.pack(pady=10)
        
        # Progress bar
        self.progress = ttk.Progressbar(timer_frame, orient=tk.HORIZONTAL, length=400, mode='determinate')
        self.progress.pack(pady=5)
        
        # Status label
        self.status_label = ttk.Label(timer_frame, text="准备开始", font=("Arial", 12))
        self.status_label.pack(pady=5)
        
        # Control buttons
        self.control_frame = ttk.Frame(timer_frame)
        self.control_frame.pack(pady=10)
        
        self.start_button = ttk.Button(self.control_frame, text="开始", command=self.start_timer)
        self.start_button.pack(side=tk.LEFT, padx=5)
        
        self.pause_button = ttk.Button(self.control_frame, text="暂停", command=self.pause_timer, state=tk.DISABLED)
        self.pause_button.pack(side=tk.LEFT, padx=5)
        
        self.stop_button = ttk.Button(self.control_frame, text="停止", command=self.stop_timer, state=tk.DISABLED)
        self.stop_button.pack(side=tk.LEFT, padx=5)
        
        # Task section
        task_frame = ttk.LabelFrame(main_container, text="任务管理")
        task_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # Task controls
        task_controls = ttk.Frame(task_frame)
        task_controls.pack(fill=tk.X, pady=5)
        
        self.task_entry = ttk.Entry(task_controls)
        self.task_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        add_task_btn = ttk.Button(task_controls, text="添加任务", command=self.add_task)
        add_task_btn.pack(side=tk.RIGHT, padx=5)
        
        # Task list
        self.task_listbox = tk.Listbox(task_frame)
        self.task_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Task actions
        task_actions = ttk.Frame(task_frame)
        task_actions.pack(fill=tk.X, pady=5)
        
        complete_btn = ttk.Button(task_actions, text="标记完成", command=self.complete_task)
        complete_btn.pack(side=tk.LEFT, padx=5)
        
        delete_btn = ttk.Button(task_actions, text="删除任务", command=self.delete_task)
        delete_btn.pack(side=tk.LEFT, padx=5)
        
        # Statistics
        stats_frame = ttk.LabelFrame(main_container, text="统计")
        stats_frame.pack(fill=tk.X, pady=5)
        
        self.cycles_label = ttk.Label(stats_frame, text="已完成周期: 0")
        self.cycles_label.pack(pady=5)
        
        self.work_time_label = ttk.Label(stats_frame, text="工作时间: 00:00:00")
        self.work_time_label.pack(pady=5)

    def start_timer(self):
        self.timer.start()
        self.start_button.config(state=tk.DISABLED)
        self.pause_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.NORMAL)
        self.status_label.config(text="工作中...")

    def pause_timer(self):
        if self.timer.state == TimerState.RUNNING:
            self.timer.pause()
            self.pause_button.config(text="继续")
            self.status_label.config(text="已暂停")
        else:
            self.timer.start()
            self.pause_button.config(text="暂停")
            self.status_label.config(text="工作中...")

    def stop_timer(self):
        self.timer.stop()
        self.start_button.config(state=tk.NORMAL)
        self.pause_button.config(state=tk.DISABLED)
        self.stop_button.config(state=tk.DISABLED)
        self.status_label.config(text="已停止")
        self.time_label.config(text="25:00")
        self.progress['value'] = 0

    def add_task(self):
        task_name = self.task_entry.get().strip()
        if task_name:
            task = Task(task_name)
            self.tasks.append(task)
            self.task_listbox.insert(tk.END, str(task))
            self.task_entry.delete(0, tk.END)
        else:
            messagebox.showwarning("输入错误", "请输入任务名称")

    def complete_task(self):
        selection = self.task_listbox.curselection()
        if selection:
            index = selection[0]
            task = self.tasks[index]
            task.completed = True
            task.completed_at = datetime.now()
            self.task_listbox.delete(index)
            self.task_listbox.insert(index, str(task))
            self.task_listbox.itemconfig(index, {'fg': 'green'})

    def delete_task(self):
        selection = self.task_listbox.curselection()
        if selection:
            index = selection[0]
            self.task_listbox.delete(index)
            del self.tasks[index]

    def _handle_timer_update(self, data):
        # Update timer display
        minutes, seconds = divmod(data['remaining_time'], 60)
        self.time_label.config(text=f"{minutes:02}:{seconds:02}")
        
        # Update progress bar
        total_time = self.timer.config.work_duration if data['is_work_period'] else self.timer.config.break_duration
        self.progress['value'] = 100 - (data['remaining_time'] / total_time * 100)
        
        # Update status
        if data['state'] == TimerState.RUNNING:
            status = "工作中..." if data['is_work_period'] else "休息中..."
            self.status_label.config(text=status)
        
        # Update statistics
        self.cycles_label.config(text=f"已完成周期: {data['work_cycles_completed']}")
        
        # Update work time
        if data['is_work_period'] and data['state'] == TimerState.RUNNING:
            self.total_work_time += timedelta(seconds=1)
        hours, remainder = divmod(self.total_work_time.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        self.work_time_label.config(text=f"工作时间: {hours:02}:{minutes:02}:{seconds:02}")

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = TomatoClockApp()
    app.run()
