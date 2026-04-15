import React from 'react';
import { Music, Waves, Shuffle } from 'lucide-react';
import { AudioTrack, musicTracks, noiseTracks } from '../utils/audio';
import { useLanguage } from '../contexts/LanguageContext';

interface AudioControlsProps {
  selectedMusic: string;
  selectedNoise: string;
  shuffleMode: boolean;
  onMusicChange: (trackId: string) => void;
  onNoiseChange: (trackId: string) => void;
  onMusicVolumeChange: (volume: number) => void;
  onNoiseVolumeChange: (volume: number) => void;
  onShuffleModeChange: (enabled: boolean) => void;
}

export function AudioControls({
  selectedMusic,
  selectedNoise,
  shuffleMode,
  onMusicChange,
  onNoiseChange,
  onMusicVolumeChange,
  onNoiseVolumeChange,
  onShuffleModeChange,
}: AudioControlsProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center w-full">
          <Music className="w-5 h-5 text-[var(--color-accent)] mr-2" />
          <select
            value={selectedMusic}
            onChange={(e) => onMusicChange(e.target.value)}
            disabled={shuffleMode}
            className="w-64 px-3 py-2 skin-select focus:outline-none"
          >
            <option value="">{t('noBackgroundMusic')}</option>
            {musicTracks.map((track: AudioTrack) => (
              <option key={track.id} value={track.id}>
                {language === 'en' ? track.name.en : track.name.zh}
              </option>
            ))}
          </select>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className="ml-4 w-24 accent-[var(--color-accent)]"
            onChange={(e) => onMusicVolumeChange(Number(e.target.value) / 100)}
          />
          <button
            onClick={() => onShuffleModeChange(!shuffleMode)}
            className={`p-1 ml-2 transition-colors ${
              shuffleMode
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]'
            }`}
            style={{ borderRadius: 'var(--radius-button)' }}
            title={t('shuffleMode')}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center w-full">
          <Waves className="w-5 h-5 text-[var(--color-break)] mr-2" />
          <select
            value={selectedNoise}
            onChange={(e) => onNoiseChange(e.target.value)}
            className="w-64 px-3 py-2 skin-select focus:outline-none"
          >
            <option value="">{t('noWhiteNoise')}</option>
            {noiseTracks.map((track: AudioTrack) => (
              <option key={track.id} value={track.id}>
                {language === 'en' ? track.name.en : track.name.zh}
              </option>
            ))}
          </select>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="30"
            className="ml-4 w-24 accent-[var(--color-accent)]"
            onChange={(e) => onNoiseVolumeChange(Number(e.target.value) / 100)}
          />
        </div>
      </div>
    </div>
  );
}
