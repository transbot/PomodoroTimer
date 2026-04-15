from typing import Callable, Optional
from datetime import datetime, timedelta
import time
import threading
from dataclasses import dataclass
from enum import Enum, auto

class TimerState(Enum):
    STOPPED = auto()
    RUNNING = auto()
    PAUSED = auto()

@dataclass
class TimerConfig:
    work_duration: int = 25 * 60  # 默认25分钟
    break_duration: int = 5 * 60   # 默认5分钟
    long_break_duration: int = 15 * 60  # 长休息
    work_cycles_before_long_break: int = 4  # 4个工作周期后长休息

class PomodoroTimer:
    def __init__(self):
        self.config = TimerConfig()
        self.state = TimerState.STOPPED
        self.remaining_time = self.config.work_duration
        self.start_time: Optional[datetime] = None
        self.work_cycles_completed = 0
        self.is_work_period = True
        self.callbacks: list[Callable] = []
        self._timer_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()

    def start(self) -> None:
        if self.state != TimerState.RUNNING:
            self.state = TimerState.RUNNING
            self.start_time = datetime.now()
            self._stop_event.clear()
            self._timer_thread = threading.Thread(target=self._run_timer)
            self._timer_thread.start()
            self._notify_callbacks()

    def pause(self) -> None:
        if self.state == TimerState.RUNNING:
            self.state = TimerState.PAUSED
            self._update_remaining_time()
            self._notify_callbacks()

    def stop(self) -> None:
        self.state = TimerState.STOPPED
        self._stop_event.set()
        if self._timer_thread and self._timer_thread.is_alive():
            self._timer_thread.join()
        self._notify_callbacks()

    def reset(self) -> None:
        self.stop()
        self.remaining_time = (
            self.config.work_duration if self.is_work_period 
            else self.config.break_duration
        )
        self._notify_callbacks()

    def add_callback(self, callback: Callable) -> None:
        self.callbacks.append(callback)

    def _run_timer(self) -> None:
        while not self._stop_event.is_set() and self.remaining_time > 0:
            if self.state == TimerState.RUNNING:
                time.sleep(1)
                self.remaining_time -= 1
                self._notify_callbacks()
            elif self.state == TimerState.PAUSED:
                time.sleep(0.1)

        if not self._stop_event.is_set():
            self._handle_timer_end()

    def _handle_timer_end(self) -> None:
        self.is_work_period = not self.is_work_period
        if self.is_work_period:
            self.work_cycles_completed += 1
            if self.work_cycles_completed % self.config.work_cycles_before_long_break == 0:
                self.remaining_time = self.config.long_break_duration
            else:
                self.remaining_time = self.config.break_duration
        else:
            self.remaining_time = self.config.work_duration

        self.start_time = datetime.now()
        self._notify_callbacks()

    def _update_remaining_time(self) -> None:
        if self.start_time:
            elapsed = (datetime.now() - self.start_time).total_seconds()
            self.remaining_time -= int(elapsed)

    def _notify_callbacks(self) -> None:
        for callback in self.callbacks:
            callback({
                'state': self.state,
                'remaining_time': self.remaining_time,
                'is_work_period': self.is_work_period,
                'work_cycles_completed': self.work_cycles_completed
            })

    def get_formatted_time(self) -> str:
        minutes, seconds = divmod(self.remaining_time, 60)
        return f"{minutes:02d}:{seconds:02d}"
