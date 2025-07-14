import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  autoSave: boolean;
  autoSaveInterval: number;
  showGridBackground: boolean;
  gridSize: number;
  defaultNoteFormat: string;
  enableSpellCheck: boolean;
  enableWordWrap: boolean;
  sidebarCollapsed: boolean;
  pdfDefaultZoom: number;
  exportFormat: string;
  enableNotifications: boolean;
  enableKeyboardShortcuts: boolean;
}

export const defaultSettings: AppSettings = {
  theme: 'system',
  fontSize: 16,
  fontFamily: 'Inter',
  autoSave: true,
  autoSaveInterval: 2000,
  showGridBackground: true,
  gridSize: 20,
  defaultNoteFormat: 'richtext',
  enableSpellCheck: true,
  enableWordWrap: true,
  sidebarCollapsed: false,
  pdfDefaultZoom: 100,
  exportFormat: 'pdf',
  enableNotifications: true,
  enableKeyboardShortcuts: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  saveSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('mednote-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        return { ...defaultSettings, ...parsedSettings };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return defaultSettings;
  });

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Auto-save settings immediately
      localStorage.setItem('mednote-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('mednote-settings', JSON.stringify(defaultSettings));
  };

  const saveSettings = () => {
    localStorage.setItem('mednote-settings', JSON.stringify(settings));
  };

  // Apply font settings to document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--app-font-family', settings.fontFamily);
  }, [settings.fontSize, settings.fontFamily]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
