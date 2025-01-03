export interface AudioTrack {
  id: string;
  name: string;
  url: string;
}

export const musicTracks: AudioTrack[] = [
  {
    id: 'lofi1',
    name: 'Lo-Fi Music',
    url: 'https://bookzhou.com/wp-content/uploads/2025/01/lofi1.mp3'
  }
];

export const noiseTracks: AudioTrack[] = [
  {
    id: 'waves',
    name: 'Ocean Waves',
    url: 'https://bookzhou.com/wp-content/uploads/2025/01/waves.mp3'
  }
];

class AudioManager {
  private musicAudio: HTMLAudioElement | null = null;
  private noiseAudio: HTMLAudioElement | null = null;
  private musicVolume: number = 0.5;
  private noiseVolume: number = 0.3;

  async playMusic(url: string) {
    try {
      if (this.musicAudio) {
        this.musicAudio.pause();
      }
      this.musicAudio = new Audio(url);
      this.musicAudio.loop = true;
      this.musicAudio.volume = this.musicVolume;
      
      // Add play() in a try-catch block to handle mobile autoplay restrictions
      try {
        await this.musicAudio.play();
      } catch (error) {
        console.log('Music autoplay prevented. User interaction needed.');
      }
    } catch (error) {
      console.error('Error playing music:', error);
    }
  }

  async playNoise(url: string) {
    try {
      if (this.noiseAudio) {
        this.noiseAudio.pause();
      }
      this.noiseAudio = new Audio(url);
      this.noiseAudio.loop = true;
      this.noiseAudio.volume = this.noiseVolume;
      
      // Add play() in a try-catch block to handle mobile autoplay restrictions
      try {
        await this.noiseAudio.play();
      } catch (error) {
        console.log('Noise autoplay prevented. User interaction needed.');
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
    }
  }

  stopNoise() {
    if (this.noiseAudio) {
      this.noiseAudio.pause();
      this.noiseAudio = null;
    }
  }

  stopAll() {
    this.stopMusic();
    this.stopNoise();
  }

  // Method to resume audio after user interaction
  async resumeAudio() {
    if (this.musicAudio) {
      try {
        await this.musicAudio.play();
      } catch (error) {
        console.error('Error resuming music:', error);
      }
    }
    if (this.noiseAudio) {
      try {
        await this.noiseAudio.play();
      } catch (error) {
        console.error('Error resuming noise:', error);
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