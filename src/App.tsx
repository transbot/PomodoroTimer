import React, { useState } from 'react';
import { Timer } from './components/Timer';
import { TimerSettings } from './components/TimerSettings';
import { Clock } from 'lucide-react';

function App() {
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-red-500 mr-2" />
              <h1 className="text-3xl font-bold text-gray-800">Pomodoro Timer</h1>
            </div>
            <p className="text-gray-600">
              Stay focused and productive with the Pomodoro Technique
            </p>
          </div>
          
          <Timer workTime={workTime} breakTime={breakTime} />
          
          <div className="mt-12 border-t pt-8">
            <TimerSettings
              workTime={workTime}
              breakTime={breakTime}
              onWorkTimeChange={setWorkTime}
              onBreakTimeChange={setBreakTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;