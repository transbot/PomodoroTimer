import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { formatTime, minutesToSeconds } from '../utils/time';
import { AudioControls } from './AudioControls';
import { audioManager, musicTracks, noiseTracks, loadAudioSelections, saveAudioSelections } from '../utils/audio';
import { useLanguage } from '../contexts/LanguageContext';
import { useStatistics } from '../contexts/StatisticsContext';

type TimerMode = 'work' | 'break';

interface TimerProps {
  workTime: number;
  breakTime: number;
}

export function Timer({ workTime, breakTime }: TimerProps) {
  const { t } = useLanguage();
  const { startSession, completeSession, cancelSession } = useStatistics();

  const [timeLeft, setTimeLeft] = useState(minutesToSeconds(workTime));
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [selectedMusic, setSelectedMusic] = useState(loadAudioSelections().music);
  const [selectedNoise, setSelectedNoise] = useState(loadAudioSelections().noise);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [lastPlayedMusic, setLastPlayedMusic] = useState<string>('');

  // Track current session for statistics
  const currentSessionIdRef = useRef<string | null>(null);
  const sessionDurationRef = useRef<number>(workTime);

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

  const handleMusicChange = useCallback((trackId: string) => {
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
  }, [selectedNoise, mode, isRunning]);

  const shuffleMusic = useCallback(() => {
    const availableTracks = musicTracks.filter(track => track.id !== lastPlayedMusic);
    if (availableTracks.length > 0) {
      const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
      setLastPlayedMusic(randomTrack.id);
      setSelectedMusic(randomTrack.id);
      saveAudioSelections({ music: randomTrack.id, noise: selectedNoise });
      const track = musicTracks.find(t => t.id === randomTrack.id);
      if (track) {
        audioManager.playMusic(track.url);
      }
    }
  }, [lastPlayedMusic, selectedNoise]);

  // Handle shuffle mode timer
  useEffect(() => {
    let shuffleInterval: number;
    if (shuffleMode && mode === 'work' && isRunning) {
      shuffleMusic(); // Initial shuffle
      shuffleInterval = window.setInterval(shuffleMusic, 3 * 60 * 1000); // Shuffle every 3 minutes
    }
    return () => clearInterval(shuffleInterval);
  }, [shuffleMode, mode, isRunning, shuffleMusic]);

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
    if (!isRunning) {
      // Starting the timer
      const duration = mode === 'work' ? workTime : breakTime;
      sessionDurationRef.current = duration;
      currentSessionIdRef.current = startSession(mode, duration);
    } else {
      // Pausing the timer - cancel session if not completed
      if (currentSessionIdRef.current) {
        cancelSession(currentSessionIdRef.current);
        currentSessionIdRef.current = null;
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    // Cancel current session if any
    if (currentSessionIdRef.current) {
      cancelSession(currentSessionIdRef.current);
      currentSessionIdRef.current = null;
    }

    const duration = mode === 'work' ? workTime : breakTime;
    sessionDurationRef.current = duration;
    setTimeLeft(minutesToSeconds(duration));
    currentSessionIdRef.current = startSession(mode, duration);
    setIsRunning(true);
  };

  const switchMode = () => {
    // Cancel current session if any
    if (currentSessionIdRef.current) {
      cancelSession(currentSessionIdRef.current);
      currentSessionIdRef.current = null;
    }

    const newMode = mode === 'work' ? 'break' : 'work';
    const duration = newMode === 'work' ? workTime : breakTime;
    setMode(newMode);
    setTimeLeft(minutesToSeconds(duration));
    sessionDurationRef.current = duration;
    currentSessionIdRef.current = startSession(newMode, duration);
    setIsRunning(true);
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

      // Complete the session
      if (currentSessionIdRef.current) {
        completeSession(currentSessionIdRef.current);
        currentSessionIdRef.current = null;
      }

      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audioManager.stopAll();
      audio.play();

      const newMode = mode === 'work' ? 'break' : 'work';
      const duration = newMode === 'work' ? workTime : breakTime;
      setMode(newMode);
      setTimeLeft(minutesToSeconds(duration));
      sessionDurationRef.current = duration;
      currentSessionIdRef.current = startSession(newMode, duration);
      setIsRunning(true);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, workTime, breakTime, startSession, completeSession, cancelSession]);

  const { minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={switchMode}
          className={`px-4 py-2 flex items-center space-x-2 transition-colors ${
            mode === 'work'
              ? 'skin-work-btn'
              : 'skin-break-btn'
          }`}
          style={{ borderRadius: 'var(--radius-button)' }}
        >
          {mode === 'work' ? (
            <>
              <Brain size={20} />
              <span>{t('workTime')}</span>
            </>
          ) : (
            <>
              <Coffee size={20} />
              <span>{t('breakTime')}</span>
            </>
          )}
        </button>
      </div>

      <div className="text-8xl font-bold font-mono skin-timer-display">
        {minutes}:{seconds}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={toggleTimer}
          className="p-4 skin-button-primary hover:opacity-80 transition-colors"
          style={{ borderRadius: 'var(--radius-button)' }}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-4 skin-button-secondary hover:opacity-80 transition-colors"
          style={{ borderRadius: 'var(--radius-button)' }}
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="w-full max-w-md mt-8">
        <AudioControls
          selectedMusic={selectedMusic}
          selectedNoise={selectedNoise}
          shuffleMode={shuffleMode}
          onMusicChange={handleMusicChange}
          onNoiseChange={handleNoiseChange}
          onMusicVolumeChange={handleMusicVolumeChange}
          onNoiseVolumeChange={handleNoiseVolumeChange}
          onShuffleModeChange={setShuffleMode}
        />
      </div>
    </div>
  );
}
