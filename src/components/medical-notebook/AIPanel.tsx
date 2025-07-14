import { useState } from "react";
import { X, Sparkles, Send, BookOpen, Lightbulb, Copy, Stethoscope, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";

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

  const handleAIAction = async (action: "summarize" | "explain" | "custom" | "differential" | "clinical-note") => {
    setIsLoading(true);

    try {
      let result;

      switch (action) {
        case "summarize":
          result = await aiService.summarizeText(highlightedText);
          break;

        case "explain":
          result = await aiService.explainConcept(highlightedText);
          break;

        case "custom":
          result = await aiService.answerQuestion(customPrompt, highlightedText);
          break;

        case "differential":
          result = await aiService.reviewDifferentialDiagnosis(highlightedText);
          break;

        case "clinical-note":
          result = await aiService.generateClinicalNote(highlightedText);
          break;

        default:
          result = { content: "Unknown action", success: false };
      }

      if (result.success) {
        setAiResponse(result.content);
        toast({
          title: "Dr. Mitchell's Response Ready",
          description: "Professional medical analysis completed. Click 'Insert to Note' to add to your notes.",
        });
      } else {
        setAiResponse(`**Error:** ${result.error || 'Failed to get AI response. Please try again.'}`);
        toast({
          title: "AI Service Error",
          description: "There was an issue connecting to the AI service. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('AI Action Error:', error);
      setAiResponse("**Error:** Unable to process request. Please try again.");
      toast({
        title: "Request Failed",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
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
          <Stethoscope className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Dr. Sarah Mitchell, MD</span>
          <span className="text-xs text-muted-foreground">30 years experience</span>
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
        <div className="grid grid-cols-2 gap-2">
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
          <Button
            size="sm"
            onClick={() => handleAIAction("differential")}
            disabled={isLoading}
            className="flex-1"
          >
            <Stethoscope className="h-3 w-3 mr-1" />
            Differential
          </Button>
          <Button
            size="sm"
            onClick={() => handleAIAction("clinical-note")}
            disabled={isLoading}
            className="flex-1"
          >
            <FileText className="h-3 w-3 mr-1" />
            Clinical Note
          </Button>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Ask Dr. Mitchell:</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask any medical question about the selected text or general medical inquiry..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 min-h-[60px] text-sm"
            />
            <Button
              size="sm"
              onClick={() => handleAIAction("custom")}
              disabled={isLoading || !customPrompt.trim()}
              title="Get professional medical insight"
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
              <span className="text-sm text-muted-foreground">Dr. Mitchell is analyzing...</span>
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