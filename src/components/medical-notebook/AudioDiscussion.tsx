import { useState, useEffect } from "react";
import { Play, Pause, Square, SkipForward, SkipBack, Volume2, Loader2, Mic, MicOff, Minimize2, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { aiService, type AudioDiscussionResponse, type DiscussionSegment } from "@/services/aiService";
import { textToSpeechService, type AudioSegment, type TTSPlaybackState } from "@/services/textToSpeechService";
import { pdfService, type PDFExtractionResult } from "@/services/pdfService";

interface AudioDiscussionProps {
  pdfFile?: File;
  pdfText?: string;
  pdfTitle?: string;
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const AudioDiscussion = ({ pdfFile, pdfText, pdfTitle, onClose, isMinimized = false, onToggleMinimize }: AudioDiscussionProps) => {
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
  const [extractedText, setExtractedText] = useState<string>("");
  const [pdfMetadata, setPdfMetadata] = useState<any>(null);
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

  // Extract text from PDF if file is provided
  useEffect(() => {
    if (pdfFile && !pdfText) {
      extractPDFText();
    } else if (pdfText) {
      setExtractedText(pdfText);
    }
  }, [pdfFile, pdfText]);

  const extractPDFText = async () => {
    if (!pdfFile) return;

    try {
      setIsGenerating(true);
      const result: PDFExtractionResult = await pdfService.extractTextFromFile(pdfFile);
      
      if (result.success && result.text) {
        setExtractedText(result.text);
        setPdfMetadata(result.metadata);
        toast({
          title: "PDF Text Extracted",
          description: "Ready to generate audio discussion.",
        });
      } else {
        toast({
          title: "PDF Extraction Failed",
          description: result.error || "Could not extract text from PDF.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
      toast({
        title: "Extraction Error",
        description: "An error occurred while extracting PDF text.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDiscussion = async () => {
    if (!extractedText) {
      toast({
        title: "No Content",
        description: "Please provide PDF content to generate discussion.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Clean the text by removing markdown and formatting
      const cleanedText = pdfService.cleanTextForAudio(extractedText);
      console.log('Original text length:', extractedText.length);
      console.log('Cleaned text length:', cleanedText.length);
      console.log('Original text sample:', extractedText.substring(0, 200));
      console.log('Cleaned text sample:', cleanedText.substring(0, 200));

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
        pdfTitle || pdfFile?.name || "Medical Document",
        pdfMetadata
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

  const handleSegmentClick = (index: number) => {
    textToSpeechService.jumpToSegment(index);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = playbackState.totalSegments > 0 
    ? (playbackState.currentSegmentIndex / playbackState.totalSegments) * 100 
    : 0;

  const createTestSegments = () => {
    const testSegments = [
      { speaker: 'host' as const, content: 'Welcome to our medical discussion about cardiovascular health!' },
      { speaker: 'expert' as const, content: 'Thank you for having me. Today we will explore the fascinating world of cardiac physiology and its clinical implications.' },
      { speaker: 'host' as const, content: 'Let us start with the basic anatomy. Can you describe the structure of the heart?' },
      { speaker: 'expert' as const, content: 'Certainly! The heart is a four-chambered organ with two atria and two ventricles, each serving specific functions in circulation.' }
    ];
    textToSpeechService.prepareAudioDiscussion(testSegments).then(segments => {
      setAudioSegments(segments);
      toast({
        title: "Test Audio Ready",
        description: "Test audio segments have been prepared.",
      });
    });
  };

  if (!textToSpeechService.isSupported()) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicOff className="h-5 w-5" />
            Audio Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your browser does not support text-to-speech functionality.
            Please try using a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Minimized compact player view
  if (isMinimized && discussionResponse && audioSegments.length > 0) {
    return (
      <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            {playbackState.isPlaying && !playbackState.isPaused ? (
              <Button onClick={handlePause} size="sm" variant="outline">
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handlePlay} size="sm" variant="outline">
                <Play className="h-4 w-4" />
              </Button>
            )}

            {/* Progress and Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="truncate">{pdfTitle || "Audio Discussion"}</span>
                <span>{playbackState.currentSegmentIndex + 1}/{playbackState.totalSegments}</span>
              </div>
              <Progress value={progressPercentage} className="h-1" />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={playbackState.currentSegmentIndex === 0}
                className="h-8 w-8 p-0"
              >
                <SkipBack className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={playbackState.currentSegmentIndex >= playbackState.totalSegments - 1}
                className="h-8 w-8 p-0"
              >
                <SkipForward className="h-3 w-3" />
              </Button>

              {/* Expand Button */}
              {onToggleMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMinimize}
                  className="h-8 w-8 p-0"
                  title="Expand player"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              )}

              {/* Close Button */}
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                  title="Close player"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Current segment indicator */}
          {audioSegments[playbackState.currentSegmentIndex] && (
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Badge variant={audioSegments[playbackState.currentSegmentIndex].speaker === 'host' ? 'default' : 'secondary'} className="text-xs px-1 py-0">
                  {audioSegments[playbackState.currentSegmentIndex].speaker === 'host' ? 'Host' : 'Expert'}
                </Badge>
                <span className="truncate">
                  {audioSegments[playbackState.currentSegmentIndex].text.substring(0, 60)}...
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Discussion Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate an engaging audio discussion from the currently opened PDF, similar to Google NotebookLM
            </p>
          </div>

          {/* Minimize and Close buttons */}
          <div className="flex items-center gap-1">
            {discussionResponse && audioSegments.length > 0 && onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                title="Minimize player"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* PDF Info */}
        {(pdfFile || pdfTitle) && (
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <h3 className="font-medium mb-2 text-primary">Currently Opened PDF</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Title:</strong> {pdfTitle || pdfFile?.name || "Unknown"}
            </p>
            {pdfMetadata && (
              <p className="text-sm text-muted-foreground">
                <strong>Pages:</strong> {pdfMetadata.pages}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 italic">
              Audio discussion will be generated for this PDF content
            </p>
          </div>
        )}

        {/* Generate Discussion Button */}
        {!discussionResponse && (
          <div className="text-center space-y-4">
            <Button 
              onClick={generateDiscussion} 
              disabled={isGenerating || !extractedText}
              size="lg"
              className="w-full max-w-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {pdfFile && !extractedText ? "Extracting PDF..." : "Generating Discussion..."}
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Generate Audio Discussion
                </>
              )}
            </Button>

            {!extractedText && !isGenerating && (
              <div className="text-sm text-muted-foreground">
                <p>No PDF content available. Please select a PDF from the sidebar first.</p>
              </div>
            )}
          </div>
        )}

        {/* Audio Controls */}
        {discussionResponse && audioSegments.length > 0 && (
          <div className="space-y-4">
            {/* Playback Controls */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={playbackState.currentSegmentIndex === 0}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                {playbackState.isPlaying && !playbackState.isPaused ? (
                  <Button onClick={handlePause} size="lg">
                    <Pause className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button onClick={handlePlay} size="lg">
                    <Play className="h-5 w-5" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStop}
                  disabled={!playbackState.isPlaying}
                >
                  <Square className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={playbackState.currentSegmentIndex >= playbackState.totalSegments - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={progressPercentage} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Segment {playbackState.currentSegmentIndex + 1} of {playbackState.totalSegments}</span>
                  <span>~{formatDuration(playbackState.totalDuration)} total</span>
                </div>
              </div>
            </div>

            {/* Discussion Segments */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <h3 className="font-medium">Discussion Script</h3>
              {audioSegments.map((segment, index) => (
                <div
                  key={segment.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    segment.isPlaying
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card hover:bg-muted'
                  }`}
                  onClick={() => handleSegmentClick(index)}
                >
                  <div className="flex items-start gap-3">
                    <Badge variant={segment.speaker === 'host' ? 'default' : 'secondary'}>
                      {segment.speaker === 'host' ? 'Host' : 'Expert'}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm">{segment.text}</p>
                      {segment.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ~{formatDuration(segment.duration)}
                        </p>
                      )}
                    </div>
                    {segment.isPlaying && (
                      <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Audio Button */}
        {discussionResponse && audioSegments.length === 0 && (
          <div className="text-center">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Discussion generated but no audio segments found. Click below to test the audio functionality.
              </p>
            </div>
            <Button
              onClick={createTestSegments}
              variant="outline"
              size="sm"
            >
              Create Test Audio Segments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
