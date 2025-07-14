import { Settings, X, Save, RotateCcw, Moon, Sun, Monitor, Type, Grid, FileText, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/contexts/ThemeContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your MedNote AI experience with these preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Editor Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Type className="h-4 w-4" />
              Editor
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Grid Background</Label>
                  <p className="text-sm text-muted-foreground">Display drawing pad grid pattern</p>
                </div>
                <Switch
                  checked={settings.showGridBackground}
                  onCheckedChange={(checked) => updateSetting('showGridBackground', checked)}
                />
              </div>

              {settings.showGridBackground && (
                <div className="space-y-2">
                  <Label>Grid Size: {settings.gridSize}px</Label>
                  <Slider
                    value={[settings.gridSize]}
                    onValueChange={([value]) => updateSetting('gridSize', value)}
                    min={10}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Spell Check</Label>
                  <p className="text-sm text-muted-foreground">Check spelling while typing</p>
                </div>
                <Switch
                  checked={settings.enableSpellCheck}
                  onCheckedChange={(checked) => updateSetting('enableSpellCheck', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Word Wrap</Label>
                  <p className="text-sm text-muted-foreground">Wrap long lines automatically</p>
                </div>
                <Switch
                  checked={settings.enableWordWrap}
                  onCheckedChange={(checked) => updateSetting('enableWordWrap', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Auto-Save Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Save className="h-4 w-4" />
              Auto-Save
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save notes while typing</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            {settings.autoSave && (
              <div className="space-y-2">
                <Label>Auto-Save Interval: {settings.autoSaveInterval / 1000}s</Label>
                <Slider
                  value={[settings.autoSaveInterval]}
                  onValueChange={([value]) => updateSetting('autoSaveInterval', value)}
                  min={1000}
                  max={10000}
                  step={1000}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Export Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Export Format</Label>
                <Select value={settings.exportFormat} onValueChange={(value) => updateSetting('exportFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="docx">Word (.docx)</SelectItem>
                    <SelectItem value="txt">Text (.txt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>PDF Default Zoom: {settings.pdfDefaultZoom}%</Label>
                <Slider
                  value={[settings.pdfDefaultZoom]}
                  onValueChange={([value]) => updateSetting('pdfDefaultZoom', value)}
                  min={50}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show system notifications</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Keyboard Shortcuts</Label>
                  <p className="text-sm text-muted-foreground">Enable keyboard shortcuts</p>
                </div>
                <Switch
                  checked={settings.enableKeyboardShortcuts}
                  onCheckedChange={(checked) => updateSetting('enableKeyboardShortcuts', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
