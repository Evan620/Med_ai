import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface KeyboardShortcutsProps {
  onNewNote?: () => void;
  onSaveNote?: () => void;
  onToggleSidebar?: () => void;
  onFocusSearch?: () => void;
  onDownload?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewNote,
  onSaveNote,
  onToggleSidebar,
  onFocusSearch,
  onDownload
}: KeyboardShortcutsProps) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings.enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      // Prevent shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Only allow Ctrl+S for save when in text areas
        if (isCtrlOrCmd && event.key === 's' && onSaveNote) {
          event.preventDefault();
          onSaveNote();
        }
        return;
      }

      if (isCtrlOrCmd) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            onNewNote?.();
            break;
          case 's':
            event.preventDefault();
            onSaveNote?.();
            break;
          case 'b':
            event.preventDefault();
            onToggleSidebar?.();
            break;
          case 'k':
            event.preventDefault();
            onFocusSearch?.();
            break;
          case 'd':
            event.preventDefault();
            onDownload?.();
            break;
        }
      }

      // ESC key to close panels
      if (event.key === 'Escape') {
        // This could be used to close AI panel or other modals
        // For now, we'll just prevent default
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.enableKeyboardShortcuts, onNewNote, onSaveNote, onToggleSidebar, onFocusSearch, onDownload]);
};
