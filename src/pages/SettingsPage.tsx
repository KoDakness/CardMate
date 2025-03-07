import { useState } from 'react';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import Logo from '../components/Logo';

export default function SettingsPage() {
  const { isDarkMode, fontSize, toggleDarkMode, setFontSize } = useSettings();
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Logo className="w-12 h-12" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">Sound Effects</span>
            </div>
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isSoundEnabled ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-gray-900 dark:text-white">Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}