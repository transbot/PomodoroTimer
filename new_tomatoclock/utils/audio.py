import pygame
from typing import Dict, Optional
from pathlib import Path
import os

class AudioManager:
    def __init__(self):
        self.sounds: Dict[str, pygame.mixer.Sound] = {}
        self.music_channel = pygame.mixer.Channel(0)
        self.ambient_channel = pygame.mixer.Channel(1)
        self.volume = 0.8
        self._initialize_audio()

    def _initialize_audio(self):
        pygame.mixer.init()
        self.music_channel.set_volume(self.volume)
        self.ambient_channel.set_volume(self.volume)

    def load_sounds(self, sound_dir: str):
        """º”‘ÿÀ˘”–“Ù∆µŒƒº˛"""
        sound_files = {
            "work_start": "work_start.mp3",
            "work_end": "work_end.mp3",
            "break_start": "break_start.mp3",
            "break_end": "break_end.mp3",
            "notification": "notification.mp3"
        }

        for name, filename in sound_files.items():
            try:
                path = os.path.join(sound_dir, filename)
                if os.path.exists(path):
                    self.sounds[name] = pygame.mixer.Sound(path)
            except Exception as e:
                print(f"Error loading sound {filename}: {e}")

    def play_sound(self, name: str):
        """≤•∑≈“Ù–ß"""
        if name in self.sounds:
            self.sounds[name].play()

    def play_music(self, file_path: str, loops: int = -1):
        """≤•∑≈±≥æ∞“Ù¿÷"""
        try:
            if os.path.exists(file_path):
                self.music_channel.play(pygame.mixer.Sound(file_path), loops=loops)
        except Exception as e:
            print(f"Error playing music {file_path}: {e}")

    def play_ambient(self, file_path: str, loops: int = -1):
        """≤•∑≈ª∑æ≥“Ù"""
        try:
            if os.path.exists(file_path):
                self.ambient_channel.play(pygame.mixer.Sound(file_path), loops=loops)
        except Exception as e:
            print(f"Error playing ambient sound {file_path}: {e}")

    def stop_music(self):
        """Õ£÷π±≥æ∞“Ù¿÷"""
        self.music_channel.stop()

    def stop_ambient(self):
        """Õ£÷πª∑æ≥“Ù"""
        self.ambient_channel.stop()

    def pause_music(self):
        """‘›Õ£±≥æ∞“Ù¿÷"""
        self.music_channel.pause()

    def pause_ambient(self):
        """‘›Õ£ª∑æ≥“Ù"""
        self.ambient_channel.pause()

    def resume_music(self):
        """ª÷∏¥±≥æ∞“Ù¿÷"""
        self.music_channel.unpause()

    def resume_ambient(self):
        """ª÷∏¥ª∑æ≥“Ù"""
        self.ambient_channel.unpause()

    def set_volume(self, volume: float):
        """…Ë÷√“Ù¡ø"""
        self.volume = max(0.0, min(1.0, volume))
        self.music_channel.set_volume(self.volume)
        self.ambient_channel.set_volume(self.volume)

    def cleanup(self):
        """«Â¿Ì“Ù∆µ◊ ‘¥"""
        self.stop_music()
        self.stop_ambient()
        pygame.mixer.quit()
