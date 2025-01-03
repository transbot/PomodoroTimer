import React from 'react';
import { Settings } from 'lucide-react';

interface TimerSettingsProps {
  workTime: number;
  breakTime: number;
  onWorkTimeChange: (minutes: number) => void;
  onBreakTimeChange: (minutes: number) => void;
}

export function TimerSettings({
  workTime,
  breakTime,
  onWorkTimeChange,
  onBreakTimeChange,
}: TimerSettingsProps) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-center mb-4">
        <Settings className="w-5 h-5 text-gray-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-700">Timer Settings</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="workTime" className="text-gray-600">
            Work Duration (minutes):
          </label>
          <input
            id="workTime"
            type="number"
            min="1"
            max="60"
            value={workTime}
            onChange={(e) => onWorkTimeChange(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="breakTime" className="text-gray-600">
            Break Duration (minutes):
          </label>
          <input
            id="breakTime"
            type="number"
            min="1"
            max="30"
            value={breakTime}
            onChange={(e) => onBreakTimeChange(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}