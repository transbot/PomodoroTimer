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

  playMusic(url: string) {
    if (this.musicAudio) {
      this.musicAudio.pause();
    }
    this.musicAudio = new Audio(url);
    this.musicAudio.loop = true;
    this.musicAudio.play();
  }

  playNoise(url: string) {
    if (this.noiseAudio) {
      this.noiseAudio.pause();
    }
    this.noiseAudio = new Audio(url);
    this.noiseAudio.loop = true;
    this.noiseAudio.play();
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
}

export const audioManager = new AudioManager();