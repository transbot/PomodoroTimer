import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { formatTime, minutesToSeconds } from '../utils/time';
import { AudioControls } from './AudioControls';
import { audioManager, musicTracks, noiseTracks, loadAudioSelections, saveAudioSelections } from '../utils/audio';

type TimerMode = 'work' | 'break';

interface TimerProps {
  workTime: number;
  breakTime: number;
}

export function Timer({ workTime, breakTime }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(minutesToSeconds(workTime));
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [selectedMusic, setSelectedMusic] = useState(loadAudioSelections().music);
  const [selectedNoise, setSelectedNoise] = useState(loadAudioSelections().noise);

  // Handle audio playback based on mode and timer state
  useEffect(() => {
    if (mode === 'work' && isRunning) {
      if (selectedMusic) {
        const track = musicTracks.find(t => t.id === selectedMusic);
        if (track) audioManager.playMusic(track.url);
      }
      if (selectedNoise) {
        const track = noiseTracks.find(t => t.id === selectedNoise);
        if (track) audioManager.playNoise(track.url);
      }
    } else {
      audioManager.stopAll();
    }
  }, [mode, isRunning, selectedMusic, selectedNoise]);

  // Add user interaction handler for mobile audio
  useEffect(() => {
    const handleUserInteraction = () => {
      if (mode === 'work' && isRunning) {
        audioManager.resumeAudio();
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [mode, isRunning]);

  useEffect(() => {
    setTimeLeft(minutesToSeconds(mode === 'work' ? workTime : breakTime));
  }, [workTime, breakTime, mode]);

  const handleMusicChange = (trackId: string) => {
    setSelectedMusic(trackId);
    saveAudioSelections({ music: trackId, noise: selectedNoise });
    if (trackId && mode === 'work' && isRunning) {
      const track = musicTracks.find(t => t.id === trackId);
      if (track) {
        audioManager.playMusic(track.url);
      }
    } else if (!trackId) {
      audioManager.stopMusic();
    }
  };

  const handleMusicVolumeChange = (volume: number) => {
    audioManager.setMusicVolume(volume);
  };

  const handleNoiseVolumeChange = (volume: number) => {
    audioManager.setNoiseVolume(volume);
  };

  const handleNoiseChange = (trackId: string) => {
    setSelectedNoise(trackId);
    saveAudioSelections({ music: selectedMusic, noise: trackId });
    if (trackId && mode === 'work' && isRunning) {
      const track = noiseTracks.find(t => t.id === trackId);
      if (track) {
        audioManager.playNoise(track.url);
      }
    } else if (!trackId) {
      audioManager.stopNoise();
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(minutesToSeconds(mode === 'work' ? workTime : breakTime));
    setIsRunning(true);
  };

  const switchMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setTimeLeft(minutesToSeconds(newMode === 'work' ? workTime : breakTime));
    setIsRunning(false);
    audioManager.stopAll();
  };

  useEffect(() => {
    let interval: number;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audioManager.stopAll();
      audio.play();
      const newMode = mode === 'work' ? 'break' : 'work';
      setMode(newMode);
      setTimeLeft(minutesToSeconds(newMode === 'work' ? workTime : breakTime));
      // Don't auto-start when switching back to work mode
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const { minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={switchMode}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            mode === 'work'
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {mode === 'work' ? (
            <>
              <Brain size={20} />
              <span>Work Time</span>
            </>
          ) : (
            <>
              <Coffee size={20} />
              <span>Break Time</span>
            </>
          )}
        </button>
      </div>

      <div className="text-8xl font-bold font-mono">
        {minutes}:{seconds}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={toggleTimer}
          className="p-4 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="w-full max-w-md mt-8">
        <AudioControls
          selectedMusic={selectedMusic}
          selectedNoise={selectedNoise}
          onMusicChange={handleMusicChange}
          onNoiseChange={handleNoiseChange}
          onMusicVolumeChange={handleMusicVolumeChange}
          onNoiseVolumeChange={handleNoiseVolumeChange}
        />
      </div>
    </div>
  );
}