from tkinter import ttk, Canvas
from typing import Callable, Dict
from PIL import Image, ImageTk
from core.timer import PomodoroTimer, TimerState
from models.user import User
import os

class MainWindow:
    def __init__(self, root, timer: PomodoroTimer, user: User):
        self.root = root
        self.timer = timer
        self.user = user
        self.icons = {}
        self.progress_canvas: Optional[Canvas] = None
        self._setup_icons()
        self._setup_styles()
        self.timer.add_callback(self._update_ui)

    def _setup_icons(self):
        icon_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "icons")
        icon_sizes = {
            "start": (32, 32),
            "pause": (32, 32),
            "stop": (32, 32),
            "settings": (24, 24)
        }

        for icon_name, size in icon_sizes.items():
            try:
                img = Image.open(os.path.join(icon_dir, f"{icon_name}.png"))
                img = img.resize(size, Image.Resampling.LANCZOS)
                self.icons[icon_name] = ImageTk.PhotoImage(img)
            except Exception as e:
                print(f"Error loading icon {icon_name}: {e}")

    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        
        # 定义颜色主题
        colors = {
            "primary": "#4CAF50",
            "secondary": "#8BC34A",
            "background": "#F1F8E9",
            "text": "#1B5E20"
        }

        # 配置基础样式
        style.configure(".", 
                       background=colors["background"],
                       foreground=colors["text"],
                       font=("SimHei", 12))

        # 配置按钮样式
        style.configure("TButton",
                       background=colors["primary"],
                       foreground="white",
                       padding=8)
        style.map("TButton",
                 background=[("active", colors["secondary"])])

    def setup_ui(self):
        # 主容器
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # 进度显示
        self.progress_canvas = Canvas(main_frame, width=300, height=300, 
                                    bg="#F1F8E9", highlightthickness=0)
        self.progress_canvas.pack(pady=20)

        # 控制按钮
        control_frame = ttk.Frame(main_frame)
        control_frame.pack(pady=10)

        self.start_btn = ttk.Button(control_frame, image=self.icons["start"],
                                  command=self._on_start)
        self.start_btn.pack(side="left", padx=5)

        self.pause_btn = ttk.Button(control_frame, image=self.icons["pause"],
                                   command=self._on_pause, state="disabled")
        self.pause_btn.pack(side="left", padx=5)

        self.stop_btn = ttk.Button(control_frame, image=self.icons["stop"],
                                  command=self._on_stop, state="disabled")
        self.stop_btn.pack(side="left", padx=5)

        # 更新初始UI状态
        self._update_ui({
            "state": TimerState.STOPPED,
            "remaining_time": self.timer.config.work_duration,
            "is_work_period": True,
            "work_cycles_completed": 0
        })

    def _update_ui(self, timer_state: Dict):
        state = timer_state["state"]
        remaining_time = timer_state["remaining_time"]
        is_work_period = timer_state["is_work_period"]

        # 更新按钮状态
        self.start_btn.config(state="normal" if state != TimerState.RUNNING else "disabled")
        self.pause_btn.config(state="normal" if state == TimerState.RUNNING else "disabled")
        self.stop_btn.config(state="normal" if state != TimerState.STOPPED else "disabled")

        # 更新进度显示
        self._draw_progress(remaining_time, is_work_period)

    def _draw_progress(self, remaining_time: int, is_work_period: bool):
        if not self.progress_canvas:
            return

        self.progress_canvas.delete("all")
        
        # 计算进度百分比
        total_time = (self.timer.config.work_duration if is_work_period 
                     else self.timer.config.break_duration)
        progress = 1 - (remaining_time / total_time)

        # 绘制背景圆
        self.progress_canvas.create_arc(10, 10, 290, 290,
                                      start=0, extent=359.999,
                                      fill="#E0E0E0", outline="")

        # 绘制进度弧
        self.progress_canvas.create_arc(10, 10, 290, 290,
                                      start=90, extent=-359.999 * progress,
                                      fill="#4CAF50", outline="")

        # 绘制中心圆
        self.progress_canvas.create_oval(70, 70, 230, 230,
                                       fill="#F1F8E9", outline="")

        # 显示剩余时间
        minutes, seconds = divmod(remaining_time, 60)
        time_text = f"{minutes:02d}:{seconds:02d}"
        self.progress_canvas.create_text(150, 150, text=time_text,
                                       font=("SimHei", 36), fill="#1B5E20")

    def _on_start(self):
        self.timer.start()

    def _on_pause(self):
        self.timer.pause()

    def _on_stop(self):
        self.timer.stop()
