import { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  isDarkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  toggleDarkMode: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const fontSizeClasses = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg'
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('fontSize');
    return (saved as 'small' | 'medium' | 'large') || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    // Remove all font size classes
    Object.values(fontSizeClasses).forEach(className => {
      document.documentElement.classList.remove(className);
    });
    // Add current font size class
    document.documentElement.classList.add(fontSizeClasses[fontSize]);
  }, [fontSize]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <SettingsContext.Provider value={{ 
      isDarkMode, 
      fontSize, 
      toggleDarkMode, 
      setFontSize 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}