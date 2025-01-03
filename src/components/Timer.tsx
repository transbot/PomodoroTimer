import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { formatTime, minutesToSeconds } from '../utils/time';

type TimerMode = 'work' | 'break';

interface TimerProps {
  workTime: number;
  breakTime: number;
}

export function Timer({ workTime, breakTime }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(minutesToSeconds(workTime));
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');

  useEffect(() => {
    setTimeLeft(minutesToSeconds(mode === 'work' ? workTime : breakTime));
  }, [workTime, breakTime, mode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(minutesToSeconds(mode === 'work' ? workTime : breakTime));
  };

  const switchMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setTimeLeft(minutesToSeconds(newMode === 'work' ? workTime : breakTime));
    setIsRunning(false);
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
      audio.play();
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
    </div>
  );
}