import tkinter as tk
from tkinter import ttk
import time
import pygame
import datetime
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.font_manager as fm
import numpy as np
import os
import sys
import math
from tkinter import messagebox
from PIL import Image, ImageTk


def resource_path(relative_path):
    """ 获取资源文件的绝对路径 """
    try:
        # PyInstaller 创建的临时文件夹中获取路径
        base_path = sys._MEIPASS
    except Exception:
        # 正常运行时使用脚本所在的文件夹
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

class CustomOptionMenu(ttk.OptionMenu):
    def __init__(self, parent, variable, default, *options, **kwargs):
        self.variable = variable
        self.variable.set(default)
        super().__init__(parent, variable, default, *options, **kwargs)
        self.menu = self['menu']
        self.menu.delete(0, 'end')
        large_menu_font = ('SimHei', 14)
        self.menu.configure(font=large_menu_font)
        for option in options:
            self.menu.add_command(label=option, command=lambda value=option: self.variable.set(value))

class ChartWindow:
    def __init__(self, master, weekly_data):
        self.top = tk.Toplevel(master)
        self.top.title("过去7天番茄钟完成情况")
        self.top.geometry("1000x600")
        self.weekly_data = weekly_data
        self.create_chart()

    def create_chart(self):
        self.figure, (self.ax, self.cax) = plt.subplots(1, 2, figsize=(10, 6), gridspec_kw={'width_ratios': [20, 1]})
        self.canvas = FigureCanvasTkAgg(self.figure, master=self.top)
        self.canvas_widget = self.canvas.get_tk_widget()
        self.canvas_widget.pack(side=tk.TOP, fill=tk.BOTH, expand=1)
        self.update_chart()

    def update_chart(self):
        self.ax.clear()
        self.cax.clear()
        font_path = fm.findfont(fm.FontProperties(family='SimHei'))
        prop = fm.FontProperties(fname=font_path, size=20)
        data = np.array(list(self.weekly_data.values()))
        dates = list(self.weekly_data.keys())
        vmax = 30
        im = self.ax.imshow(data.T, aspect='auto', cmap='YlOrRd', interpolation='nearest', vmin=0, vmax=vmax)
        cbar = self.figure.colorbar(im, cax=self.cax)
        cbar.set_label('番茄钟时间（分钟）', fontproperties=prop)
        ticks = cbar.get_ticks()
        cbar.set_ticks(ticks)
        cbar.ax.set_yticklabels([f"{tick:.0f}" for tick in ticks], fontproperties=prop)
        self.ax.set_yticks(range(24))
        self.ax.set_yticklabels([f'{i:02d}:00' for i in range(24)])
        self.ax.set_ylabel('时间', fontproperties=prop)
        self.ax.set_xticks(range(len(dates)))
        self.ax.set_xticklabels([date.strftime('%m-%d') for date in dates], rotation=45, ha='right')
        self.ax.set_xlabel('日期', fontproperties=prop)
        self.ax.set_title('过去7天番茄钟完成情况', fontproperties=prop)
        self.figure.tight_layout()
        self.canvas.draw()

class PomodoroTimer:
    def __init__(self, master):
        self.master = master
        self.master.title("番茄钟")
        self.master.geometry("1280x720")
        current_dir = os.path.dirname(os.path.abspath(__file__))
        icon_path = os.path.join(current_dir, 'icon.ico')
        self.master.iconbitmap(icon_path)
        self.bg_color = "#E8F5E9"
        self.master.configure(bg=self.bg_color)
        self.custom_work_time = 25
        self.custom_break_time = 5
        self.work_time = self.custom_work_time * 60
        self.break_time = self.custom_break_time * 60
        self.time_left = self.work_time
        self.timer_running = False
        self.is_work_time = True
        self.start_time = None
        self.weekly_data = {(datetime.date.today() - datetime.timedelta(days=i)): np.zeros(24) for i in range(7)}
        self.white_noise_var = tk.StringVar(value="无")
        self.music_var = tk.StringVar(value="lofi1.mp3")
        self.canvas = None
        self.chart_window = None
        self.setup_ui()
        self.setup_audio()

    def setup_ui(self):
        # Icons
        start_icon_path = resource_path("start_icon.png")
        pause_icon_path = resource_path("pause_icon.png")
        interrupt_icon_path = resource_path("interrupt_icon.png")

        self.start_icon = ImageTk.PhotoImage(Image.open(start_icon_path).resize((30, 30), Image.Resampling.LANCZOS))
        self.pause_icon = ImageTk.PhotoImage(Image.open(pause_icon_path).resize((30, 30), Image.Resampling.LANCZOS))
        self.interrupt_icon = ImageTk.PhotoImage(Image.open(interrupt_icon_path).resize((30, 30), Image.Resampling.LANCZOS))

        # Styling
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TLabel', font=('SimHei', 20), background=self.bg_color, foreground="#1B5E20")
        style.configure('TButton', font=('SimHei', 20), background="#4CAF50", foreground='white')
        style.map('TButton', background=[('active', "#45a049")], relief=[('pressed', 'sunken')])
        style.configure('IconButton.TButton', padding=5)

        # Progress canvas
        self.progress_canvas = tk.Canvas(self.master, width=300, height=300, bg=self.bg_color, highlightthickness=0)
        self.progress_canvas.pack(pady=20)

        # Button frame
        button_frame = ttk.Frame(self.master)
        button_frame.pack(pady=10)

        self.start_button = ttk.Button(button_frame, image=self.start_icon, command=self.start_timer, style='IconButton.TButton')
        self.start_button.pack(side='left', padx=5)

        self.stop_button = ttk.Button(button_frame, image=self.pause_icon, command=self.stop_timer, state=tk.DISABLED, style='IconButton.TButton')
        self.stop_button.pack(side='left', padx=5)

        self.interrupt_button = ttk.Button(button_frame, image=self.interrupt_icon, command=self.interrupt_timer, style='IconButton.TButton')
        self.interrupt_button.pack(side='left', padx=5)

        # Time settings
        custom_time_frame = ttk.Frame(self.master)
        custom_time_frame.pack(pady=10)
        ttk.Label(custom_time_frame, text="工作时间(分钟):", style='TLabel').pack(side='left')
        self.work_time_entry = tk.Entry(custom_time_frame, width=5, font=('SimHei', 20))
        self.work_time_entry.pack(side='left', padx=5)
        self.work_time_entry.insert(0, str(self.custom_work_time))

        ttk.Label(custom_time_frame, text="休息时间(分钟):", style='TLabel').pack(side='left')
        self.break_time_entry = tk.Entry(custom_time_frame, width=5, font=('SimHei', 20))
        self.break_time_entry.pack(side='left', padx=5)
        self.break_time_entry.insert(0, str(self.custom_break_time))

        ttk.Button(custom_time_frame, text="设置", command=self.set_custom_times, style='TButton').pack(side='left', padx=5)

        # Noise options
        noise_frame = ttk.Frame(self.master)
        noise_frame.pack(pady=10)
        ttk.Label(noise_frame, text="白噪音样式：", style='TButton').pack(side='left')

        self.white_noise_menu = CustomOptionMenu(noise_frame, self.white_noise_var, "无", "雨声", "海浪", "鸟鸣", command=self.play_white_noise)
        self.white_noise_menu.config(style='LargeMenu.TMenubutton')
        self.white_noise_menu.pack(side='left')

        noise_button_frame = ttk.Frame(self.master)
        noise_button_frame.pack(pady=10)
        self.play_white_noise_button = ttk.Button(noise_button_frame, text="播放白噪音", command=self.play_white_noise, style='TButton')
        self.play_white_noise_button.pack(side='left', padx=5)

        self.pause_white_noise_button = ttk.Button(noise_button_frame, text="暂停白噪音", command=self.pause_white_noise, style='TButton')
        self.pause_white_noise_button.pack(side='left', padx=5)

        # Music options
        music_frame = ttk.Frame(self.master)
        music_frame.pack(pady=10)
        ttk.Label(music_frame, text="选择音乐：", style='TButton').pack(side='left')

        self.music_menu = CustomOptionMenu(music_frame, self.music_var, "lofi1.mp3", "lofi1.mp3", "lofi2.mp3", "lofi3.mp3", "lofi4.mp3", "lofi5.mp3", "lofi6.mp3")
        self.music_menu.config(style='LargeMenu.TMenubutton')
        self.music_menu.pack(side='left')

        music_button_frame = ttk.Frame(self.master)
        music_button_frame.pack(pady=10)
        self.play_music_button = ttk.Button(music_button_frame, image=self.start_icon, command=self.play_music, style='IconButton.TButton')
        self.play_music_button.pack(side='left', padx=5)

        self.pause_music_button = ttk.Button(music_button_frame, image=self.pause_icon, command=self.pause_music, style='IconButton.TButton')
        self.pause_music_button.pack(side='left', padx=5)

        # Chart button
        self.open_chart_button = ttk.Button(self.master, text="查看统计", command=self.open_chart_window, style='TButton')
        self.open_chart_button.pack(pady=10)

        # Initial progress
        self.draw_progress(0)

    def set_custom_times(self):
        try:
            new_work_time = int(self.work_time_entry.get())
            new_break_time = int(self.break_time_entry.get())
            if new_work_time > 0 and new_break_time > 0:
                self.custom_work_time = new_work_time
                self.custom_break_time = new_break_time
                self.work_time = self.custom_work_time * 60
                self.break_time = self.custom_break_time * 60
                self.reset_timer()
                messagebox.showinfo("设置成功", f"工作时间已设置为 {new_work_time} 分钟，休息时间已设置为 {new_break_time} 分钟。")
            else:
                messagebox.showerror("输入错误", "请输入大于0的整数。")
        except ValueError:
            messagebox.showerror("输入错误", "请输入有效的整数。")

    def setup_audio(self):
        pygame.mixer.init()
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.sounds = {}
        self.music_channel = pygame.mixer.Channel(1)
        self.noise_channel = pygame.mixer.Channel(2)

        sound_files = {
            "雨声": "rain.mp3",
            "海浪": "ocean.mp3",
            #"咖啡厅": "cafeteria.mp3",
            "鸟鸣": "bird.mp3"
        }

        for key, filename in sound_files.items():
            try:
                full_path = os.path.join(current_dir, filename)
                if not os.path.exists(full_path):
                    raise FileNotFoundError(f"File not found: {full_path}")
                self.sounds[key] = pygame.mixer.Sound(full_path)
            except Exception as e:
                print(f"Error loading {filename}: {e}")

    def format_time(self, seconds):
        minutes, secs = divmod(seconds, 60)
        return f"{minutes:02d}:{secs:02d}"

    def draw_progress(self, progress):
        self.progress_canvas.delete("all")
        self.progress_canvas.create_arc(10, 10, 290, 290, start=0, extent=359.999, fill="#E0E0E0", outline="")
        self.progress_canvas.create_arc(10, 10, 290, 290, start=90, extent=-359.999 * progress, fill="#4CAF50", outline="")
        self.progress_canvas.create_oval(70, 70, 230, 230, fill=self.bg_color, outline="")
        time_text = self.format_time(self.time_left)
        self.progress_canvas.create_text(150, 150, text=time_text, font=('SimHei', 36), fill="#1B5E20")

    def start_timer(self):
        if not self.timer_running:
            self.timer_running = True
            self.start_time = datetime.datetime.now()
            self.start_button.config(state=tk.DISABLED)
            self.stop_button.config(state=tk.NORMAL)
            self.interrupt_button.config(state=tk.NORMAL)
            self.countdown()

    def stop_timer(self):
        # This function will pause the timer, keeping the current time_left unchanged
        if self.timer_running:
            self.timer_running = False
            self.start_button.config(state=tk.NORMAL)
            self.stop_button.config(state=tk.DISABLED)

    def interrupt_timer(self):
        # This function stops the timer and resets the time
        self.timer_running = False
        self.reset_timer()  # Reset to initial settings for work or break
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        self.interrupt_button.config(state=tk.DISABLED)

    def reset_timer(self):
        # Resets the timer based on whether it's work or break time
        self.time_left = self.work_time if self.is_work_time else self.break_time
        self.draw_progress(0)  # Redraw the progress with 0% completion

    def countdown(self):
        if self.timer_running:
            if self.time_left > 0:
                self.time_left -= 1
                progress = 1 - (self.time_left / (self.work_time if self.is_work_time else self.break_time))
                self.draw_progress(progress)
                self.master.after(1000, self.countdown)
            else:
                self.play_alarm()
                self.switch_modes()

    def switch_modes(self):
        # Switch between work and break modes
        self.is_work_time = not self.is_work_time
        self.reset_timer()
        if self.timer_running:
            self.countdown()

    def play_alarm(self):
        print("时间到！")

    def play_white_noise(self, selection=None):
        if selection is None:
            selection = self.white_noise_var.get()
        sound = self.sounds.get(selection)
        if sound:
            self.noise_channel.play(sound, loops=-1)
        else:
            print(f"Sound not found for selection: {selection}")

    def pause_white_noise(self):
        self.noise_channel.pause()

    def resume_white_noise(self):
        self.noise_channel.unpause()

    def play_music(self):
        music_file = self.music_var.get()
        full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), music_file)
        try:
            if not os.path.exists(full_path):
                raise FileNotFoundError(f"File not found: {full_path}")
            self.music_channel.play(pygame.mixer.Sound(full_path), loops=-1)
        except Exception as e:
            print(f"Error loading {music_file}: {e}")

    def pause_music(self):
        self.music_channel.pause()

    def update_weekly_data(self):
        if self.start_time:
            end_time = datetime.datetime.now()
            duration = (end_time - self.start_time).total_seconds() / 60
            start_hour = self.start_time.hour
            end_hour = end_time.hour
            today = datetime.date.today()
            if today not in self.weekly_data:
                self.weekly_data[today] = np.zeros(24)
            if start_hour == end_hour:
                self.weekly_data[today][start_hour] += duration
            else:
                self.weekly_data[today][start_hour] += 60 - self.start_time.minute
                for hour in range(start_hour + 1, end_hour):
                    self.weekly_data[today][hour] += 60
                self.weekly_data[today][end_hour] += end_time.minute
            self.weekly_data = {k: v for k, v in sorted(self.weekly_data.items(), reverse=True)[:7]}
        self.start_time = None
        if self.chart_window and self.chart_window.top.winfo_exists():
            self.chart_window.update_chart()

    def open_chart_window(self):
        if self.chart_window is None or not self.chart_window.top.winfo_exists():
            self.chart_window = ChartWindow(self.master, self.weekly_data)
        else:
            self.chart_window.top.lift()
            self.chart_window.update_chart()

    def on_close(self):
        pygame.mixer.quit()
        self.master.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = PomodoroTimer(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()
