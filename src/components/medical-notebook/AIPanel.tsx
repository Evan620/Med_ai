import { useState } from "react";
import { X, Sparkles, Send, BookOpen, Lightbulb, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AIPanelProps {
  highlightedText: string;
  onClose: () => void;
  onInsertToNote: (content: string) => void;
}

export const AIPanel = ({ highlightedText, onClose, onInsertToNote }: AIPanelProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAIAction = async (action: "summarize" | "explain" | "custom") => {
    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let response = "";
    
    switch (action) {
      case "summarize":
        response = `**AI Summary:**

The highlighted text discusses the cardiovascular system, focusing on:
• Heart anatomy with four chambers (2 atria, 2 ventricles)
• Blood circulation through pulmonary and systemic pathways
• Cardiac cycle phases: systole and diastole
• Function of each chamber in blood circulation

Key concept: The heart serves as a dual pump system - right side for pulmonary circulation, left side for systemic circulation.`;
        break;
        
      case "explain":
        response = `**AI Detailed Explanation:**

**Cardiovascular System Deep Dive:**

The cardiovascular system is essentially a closed-loop transportation network. Here's how it works:

**Heart Chambers Function:**
- **Right Atrium**: Collection point for deoxygenated blood from body tissues
- **Right Ventricle**: Pumps blood to lungs for oxygenation (pulmonary circulation)
- **Left Atrium**: Receives freshly oxygenated blood from lungs
- **Left Ventricle**: Most muscular chamber, pumps oxygenated blood throughout body

**Clinical Significance:**
Understanding this anatomy is crucial for diagnosing conditions like:
- Heart valve disorders
- Congenital heart defects
- Heart failure pathophysiology

**Study Tip:** Remember the flow: Body → RA → RV → Lungs → LA → LV → Body`;
        break;
        
      case "custom":
        response = `**AI Response to: "${customPrompt}"**

Based on your question about the cardiovascular content, here's a comprehensive answer:

The relationship between cardiac anatomy and clinical practice is fundamental to medical diagnosis. When examining patients with cardiovascular symptoms, understanding the normal flow patterns helps identify where problems might occur.

For example, if a patient presents with shortness of breath, knowing that the right ventricle pumps to the lungs helps you consider pulmonary circulation issues, while left-sided symptoms might indicate systemic circulation problems.

This anatomical foundation supports clinical reasoning in cardiology.`;
        break;
    }
    
    setAiResponse(response);
    setIsLoading(false);
    
    toast({
      title: "AI Response Generated",
      description: "Click 'Insert to Note' to add this to your notes.",
    });
  };

  const handleInsertToNote = () => {
    onInsertToNote(aiResponse);
    toast({
      title: "Added to Note",
      description: "AI-generated content has been inserted into your note.",
    });
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResponse);
    toast({
      title: "Copied",
      description: "AI response copied to clipboard.",
    });
  };

  return (
    <div className="absolute bottom-4 right-4 w-96 max-h-96 bg-card border border-border rounded-lg shadow-lg animate-slide-up z-50">
      {/* Panel Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">AI Assistant</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Panel Content */}
      <div className="p-4 space-y-4 max-h-80 overflow-auto">
        {/* Highlighted Text Display */}
        {highlightedText && (
          <div className="bg-selection-bg p-3 rounded-md">
            <p className="text-sm font-medium text-foreground mb-1">Selected Text:</p>
            <p className="text-sm text-muted-foreground italic">"{highlightedText.substring(0, 100)}..."</p>
          </div>
        )}

        {/* Quick AI Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => handleAIAction("summarize")}
            disabled={isLoading}
            className="flex-1"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Summarize
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleAIAction("explain")}
            disabled={isLoading}
            className="flex-1"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Explain
          </Button>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Ask AI:</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask anything about the selected text..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 min-h-[60px] text-sm"
            />
            <Button 
              size="sm" 
              onClick={() => handleAIAction("custom")}
              disabled={isLoading || !customPrompt.trim()}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* AI Response */}
        {isLoading && (
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-sm text-muted-foreground">AI is thinking...</span>
            </div>
          </div>
        )}

        {aiResponse && !isLoading && (
          <div className="bg-accent p-3 rounded-md space-y-3">
            <div className="text-sm text-foreground whitespace-pre-wrap">{aiResponse}</div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInsertToNote} className="flex-1">
                Insert to Note
              </Button>
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};