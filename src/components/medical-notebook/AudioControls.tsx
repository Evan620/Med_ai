import { useState, useEffect } from "react";
import { Play, Pause, Square, SkipForward, SkipBack, Volume2, Loader2, Headphones, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { aiService, type AudioDiscussionResponse } from "@/services/aiService";
import { textToSpeechService, type AudioSegment, type TTSPlaybackState } from "@/services/textToSpeechService";
import { pdfService } from "@/services/pdfService";

interface AudioControlsProps {
  selectedPDF: string | null;
  pdfFile?: File;
  pdfText?: string;
  pdfTitle?: string;
  isCollapsed?: boolean;
}

export const AudioControls = ({ selectedPDF, pdfFile, pdfText, pdfTitle, isCollapsed }: AudioControlsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [discussionResponse, setDiscussionResponse] = useState<AudioDiscussionResponse | null>(null);
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [playbackState, setPlaybackState] = useState<TTSPlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentSegmentIndex: 0,
    totalSegments: 0,
    currentTime: 0,
    totalDuration: 0
  });
  const { toast } = useToast();

  // Set up TTS service callbacks
  useEffect(() => {
    textToSpeechService.onStateChangeCallback(setPlaybackState);
    textToSpeechService.onSegmentChangeCallback((segment, index) => {
      setAudioSegments(prev => prev.map((s, i) => ({
        ...s,
        isPlaying: i === index
      })));
    });

    return () => {
      textToSpeechService.stopDiscussion();
    };
  }, []);

  const generateDiscussion = async () => {
    if (!pdfText) {
      toast({
        title: "No Content",
        description: "Please select a PDF to generate discussion.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // Clean the text by removing markdown and formatting
      const cleanedText = pdfService.cleanTextForAudio(pdfText);
      
      const maxLength = 15000;
      let textToProcess = cleanedText;
      
      if (cleanedText.length > maxLength) {
        textToProcess = cleanedText.substring(0, maxLength) + "...";
        toast({
          title: "Content Truncated",
          description: "PDF content was truncated to fit processing limits.",
        });
      }

      const response = await aiService.generateAudioDiscussion(
        textToProcess,
        pdfTitle || "Medical Document",
        null
      );

      if (response.success) {
        setDiscussionResponse(response);
        
        if (response.segments && response.segments.length > 0) {
          const segments = await textToSpeechService.prepareAudioDiscussion(response.segments);
          setAudioSegments(segments);
        } else {
          // Create fallback segments
          const fallbackSegments = [
            { speaker: 'host' as const, content: 'Welcome to our medical discussion!' },
            { speaker: 'expert' as const, content: response.content || 'Here is the generated discussion content.' }
          ];
          const segments = await textToSpeechService.prepareAudioDiscussion(fallbackSegments);
          setAudioSegments(segments);
        }
        
        toast({
          title: "Discussion Generated",
          description: "Audio discussion is ready to play!",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: response.error || "Could not generate audio discussion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Discussion generation error:', error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating the discussion.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = async () => {
    try {
      if (playbackState.isPaused) {
        textToSpeechService.resumeDiscussion();
      } else {
        await textToSpeechService.playDiscussion();
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: "Playback Error",
        description: "Could not start audio playback.",
        variant: "destructive",
      });
    }
  };

  const handlePause = () => {
    textToSpeechService.pauseDiscussion();
  };

  const handleStop = () => {
    textToSpeechService.stopDiscussion();
    setAudioSegments(prev => prev.map(s => ({ ...s, isPlaying: false })));
  };

  const handleNext = () => {
    textToSpeechService.nextSegment();
  };

  const handlePrevious = () => {
    textToSpeechService.previousSegment();
  };

  const handleClose = () => {
    textToSpeechService.stopDiscussion();
    setDiscussionResponse(null);
    setAudioSegments([]);
  };

  const progressPercentage = playbackState.totalSegments > 0 
    ? (playbackState.currentSegmentIndex / playbackState.totalSegments) * 100 
    : 0;

  if (!textToSpeechService.isSupported()) {
    return null;
  }

  // Don't show anything if no PDF is selected
  if (!selectedPDF) {
    return null;
  }

  return (
    <div className="border-t border-border/50 bg-gradient-to-b from-muted/20 to-muted/40 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 rounded-md">
              <Headphones className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Audio Discussion</span>
              <p className="text-xs text-muted-foreground">AI-powered conversations</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="p-1.5 bg-green-500/10 rounded-md">
              <Headphones className="h-4 w-4 text-green-600" />
            </div>
          </div>
        )}
        {discussionResponse && !isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Close audio discussion"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Generate Button */}
      {!discussionResponse && (
        <Button
          onClick={generateDiscussion}
          disabled={isGenerating || !selectedPDF}
          size="sm"
          className={`w-full bg-green-600 hover:bg-green-700 text-white transition-colors ${
            isCollapsed ? 'h-10' : 'h-9'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              {isCollapsed ? "..." : "Generating..."}
            </>
          ) : (
            <>
              <Headphones className="h-3 w-3 mr-2" />
              {isCollapsed ? "Audio" : "Generate Discussion"}
            </>
          )}
        </Button>
      )}

      {/* Audio Controls */}
      {discussionResponse && audioSegments.length > 0 && (
        <div className="space-y-3">
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={playbackState.currentSegmentIndex === 0}
              className="h-9 w-9 p-0 border-muted-foreground/20 hover:bg-muted/50 transition-colors"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {playbackState.isPlaying && !playbackState.isPaused ? (
              <Button
                onClick={handlePause}
                size="sm"
                className="h-10 w-10 p-0 bg-orange-600 hover:bg-orange-700 text-white rounded-full"
              >
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePlay}
                size="sm"
                className="h-10 w-10 p-0 bg-green-600 hover:bg-green-700 text-white rounded-full"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              disabled={!playbackState.isPlaying}
              className="h-9 w-9 p-0 border-muted-foreground/20 hover:bg-muted/50 transition-colors"
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={playbackState.currentSegmentIndex >= playbackState.totalSegments - 1}
              className="h-9 w-9 p-0 border-muted-foreground/20 hover:bg-muted/50 transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="space-y-1">
              <Progress value={progressPercentage} className="h-2 bg-muted/50" />
              {!isCollapsed && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Segment {playbackState.currentSegmentIndex + 1}</span>
                  <span>{playbackState.totalSegments} total</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Segment Info */}
          {!isCollapsed && audioSegments[playbackState.currentSegmentIndex] && (
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={audioSegments[playbackState.currentSegmentIndex].speaker === 'host' ? 'default' : 'secondary'}
                  className="text-xs px-2 py-1"
                >
                  {audioSegments[playbackState.currentSegmentIndex].speaker === 'host' ? '🎙️ Host' : '👨‍⚕️ Expert'}
                </Badge>
                {audioSegments[playbackState.currentSegmentIndex].isPlaying && (
                  <div className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3 text-green-600 animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">Playing</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {audioSegments[playbackState.currentSegmentIndex].text.substring(0, 100)}...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
