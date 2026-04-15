export interface AudioTrack {
  id: string;
  name: {
    en: string;
    zh: string;
  };
  url: string;
}

export const musicTracks: AudioTrack[] = [
  {
    id: 'lofi1',
    name: {
      en: 'Relaxing Music #1',
      zh: '舒缓的音乐#1'
    },
    url: '/audio/lofi1.mp3'
  },
  {
    id: 'lofi2',
    name: {
      en: 'Relaxing Music #2',
      zh: '舒缓的音乐#2'
    },
    url: '/audio/lofi2.mp3'
  },
  {
    id: 'lofi3',
    name: {
      en: 'Relaxing Music #3',
      zh: '舒缓的音乐#3'
    },
    url: '/audio/lofi3.mp3'
  },
  {
    id: 'lofi4',
    name: {
      en: 'Relaxing Music #4',
      zh: '舒缓的音乐#4'
    },
    url: '/audio/lofi4.mp3'
  },
  {
    id: 'lofi5',
    name: {
      en: 'Relaxing Music #5',
      zh: '舒缓的音乐#5'
    },
    url: '/audio/lofi5.mp3'
  },
  {
    id: 'lofi6',
    name: {
      en: 'Relaxing Music #6',
      zh: '舒缓的音乐#6'
    },
    url: '/audio/lofi6.mp3'
  }
];

export const noiseTracks: AudioTrack[] = [
  {
    id: 'cafe',
    name: {
      en: 'Cafe Ambience',
      zh: '咖啡馆氛围'
    },
    url: '/audio/cafe.mp3'
  },
  {
    id: 'cafeteria',
    name: {
      en: 'Cafeteria Sounds',
      zh: '食堂环境音'
    },
    url: '/audio/cafeteria.mp3'
  },
  {
    id: 'waves',
    name: {
      en: 'Ocean Waves',
      zh: '海浪声'
    },
    url: '/audio/waves.mp3'
  },
  {
    id: 'birds',
    name: {
      en: 'Bird Songs',
      zh: '鸟鸣'
    },
    url: '/audio/bird.mp3'
  },
  {
    id: 'rain',
    name: {
      en: 'Rain Sounds',
      zh: '雨声'
    },
    url: '/audio/rain.mp3'
  },
  {
    id: 'ocean',
    name: {
      en: 'Deep Ocean',
      zh: '深海'
    },
    url: '/audio/ocean.mp3'
  }
];

class AudioManager {
  private musicAudio: HTMLAudioElement | null = null;
  private noiseAudio: HTMLAudioElement | null = null;
  private currentMusicUrl: string | null = null;
  private currentNoiseUrl: string | null = null;
  private isPlayingMusic = false;
  private isPlayingNoise = false;
  private needsUserInteraction = true;
  private musicVolume: number = 0.5;
  private noiseVolume: number = 0.3;

  async playMusic(url: string) {
    try {
      // If already playing this track, don't restart
      if (this.musicAudio?.src === url && this.isPlayingMusic) {
        return;
      }

      // Stop current audio before creating new one
      if (this.musicAudio) {
        this.musicAudio.pause();
        this.musicAudio = null;
      }

      this.musicAudio = new Audio(url);
      this.currentMusicUrl = url;
      this.musicAudio.loop = true;
      this.musicAudio.volume = this.musicVolume;

      try {
        await this.musicAudio.play();
        this.isPlayingMusic = true;
      } catch (error) {
        this.isPlayingMusic = false;
        if (error instanceof Error && error.name !== 'AbortError') {
          console.log('Music autoplay prevented. User interaction needed.');
        }
      }
    } catch (error) {
      console.error('Error playing music:', error);
    }
  }

  async playNoise(url: string) {
    try {
      // If already playing this track, don't restart
      if (this.noiseAudio?.src === url && this.isPlayingNoise) {
        return;
      }

      // Stop current audio before creating new one
      if (this.noiseAudio) {
        this.noiseAudio.pause();
        this.noiseAudio = null;
      }

      this.noiseAudio = new Audio(url);
      this.currentNoiseUrl = url;
      this.noiseAudio.loop = true;
      this.noiseAudio.volume = this.noiseVolume;

      try {
        await this.noiseAudio.play();
        this.isPlayingNoise = true;
      } catch (error) {
        this.isPlayingNoise = false;
        if (error instanceof Error && error.name !== 'AbortError') {
          console.log('Noise autoplay prevented. User interaction needed.');
        }
      }
    } catch (error) {
      console.error('Error playing noise:', error);
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicAudio) {
      this.musicAudio.volume = this.musicVolume;
    }
  }

  setNoiseVolume(volume: number) {
    this.noiseVolume = Math.max(0, Math.min(1, volume));
    if (this.noiseAudio) {
      this.noiseAudio.volume = this.noiseVolume;
    }
  }

  stopMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio = null;
      this.isPlayingMusic = false;
    }
  }

  stopNoise() {
    if (this.noiseAudio) {
      this.noiseAudio.pause();
      this.noiseAudio = null;
      this.isPlayingNoise = false;
    }
  }

  stopAll() {
    this.stopMusic();
    this.stopNoise();
  }

  // Method to resume audio after user interaction
  async resumeAudio() {
    if (!this.needsUserInteraction) {
      return;
    }

    if (this.currentMusicUrl) {
      try {
        if (!this.isPlayingMusic) {
          await this.playMusic(this.currentMusicUrl);
          this.needsUserInteraction = false;
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error resuming music:', error);
        }
      }
    }
    if (this.currentNoiseUrl) {
      try {
        if (!this.isPlayingNoise) {
          await this.playNoise(this.currentNoiseUrl);
          this.needsUserInteraction = false;
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error resuming noise:', error);
        }
      }
    }
  }
}

interface AudioSelections {
  music: string;
  noise: string;
}

export const loadAudioSelections = (): AudioSelections => {
  const stored = localStorage.getItem('audioSelections');
  if (stored) {
    return JSON.parse(stored);
  }
  return { music: '', noise: '' };
};

export const saveAudioSelections = (selections: AudioSelections): void => {
  localStorage.setItem('audioSelections', JSON.stringify(selections));
};

export const audioManager = new AudioManager();
