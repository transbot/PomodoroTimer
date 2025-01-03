import React from 'react';
import { Music, Waves } from 'lucide-react';
import { AudioTrack, musicTracks, noiseTracks } from '../utils/audio';
import { useLanguage } from '../contexts/LanguageContext';

interface AudioControlsProps {
  selectedMusic: string;
  selectedNoise: string;
  onMusicChange: (trackId: string) => void;
  onNoiseChange: (trackId: string) => void;
  onMusicVolumeChange: (volume: number) => void;
  onNoiseVolumeChange: (volume: number) => void;
}

export function AudioControls({
  selectedMusic,
  selectedNoise,
  onMusicChange,
  onNoiseChange,
  onMusicVolumeChange,
  onNoiseVolumeChange,
}: AudioControlsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center flex-1">
          <Music className="w-5 h-5 text-indigo-500 mr-2" />
          <select
            value={selectedMusic}
            onChange={(e) => onMusicChange(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{t('noBackgroundMusic')}</option>
            {musicTracks.map((track: AudioTrack) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className="ml-4 w-24"
            onChange={(e) => onMusicVolumeChange(Number(e.target.value) / 100)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center flex-1">
          <Waves className="w-5 h-5 text-blue-500 mr-2" />
          <select
            value={selectedNoise}
            onChange={(e) => onNoiseChange(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{t('noWhiteNoise')}</option>
            {noiseTracks.map((track: AudioTrack) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="30"
            className="ml-4 w-24"
            onChange={(e) => onNoiseVolumeChange(Number(e.target.value) / 100)}
          />
        </div>
      </div>
    </div>
  );
}