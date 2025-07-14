import { useState } from "react";
import { Youtube, Loader2, FileText, AlertCircle, CheckCircle, X, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { youtubeService } from "@/services/youtubeService";
import { aiService } from "@/services/aiService";

interface YouTubeProcessorProps {
  onInsertToNote: (content: string) => void;
  onClose: () => void;
}

export const YouTubeProcessor = ({ onInsertToNote, onClose }: YouTubeProcessorProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [transcript, setTranscript] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [processingStep, setProcessingStep] = useState<'input' | 'extracting' | 'analyzing' | 'complete' | 'error' | 'manual'>('input');
  const [errorMessage, setErrorMessage] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const { toast } = useToast();

  const handleProcessVideo = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube video URL.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('extracting');
    setErrorMessage("");

    try {
      // Step 1: Extract video info and transcript
      const result = await youtubeService.processYouTubeVideo(youtubeUrl);
      
      if (!result.success) {
        // If automatic extraction fails, offer manual input option
        setProcessingStep('manual');

        // Try to get basic video info even if transcript failed
        const videoId = youtubeService.extractVideoId(youtubeUrl);
        if (videoId) {
          const basicInfo = await youtubeService.getVideoInfo(videoId);
          setVideoInfo(basicInfo || { title: "Manual Input", channelName: "User Provided", duration: "", description: "", publishedAt: "" });
        } else {
          setVideoInfo({ title: "Manual Input", channelName: "User Provided", duration: "", description: "", publishedAt: "" });
        }

        setErrorMessage(result.error || 'Failed to extract transcript automatically');
        toast({
          title: "Transcript Extraction Failed",
          description: "Don't worry! You can manually copy the transcript from YouTube and paste it below.",
        });
        setIsProcessing(false);
        return;
      }

      setVideoInfo(result.videoInfo);
      setTranscript(result.transcript || "");

      // Step 2: Generate AI summary
      setProcessingStep('analyzing');

      const cleanedTranscript = youtubeService.cleanTranscript(result.transcript || "");

      // Use the specialized YouTube analysis method
      const aiResult = await aiService.analyzeYouTubeVideo(
        result.videoInfo?.title || "Unknown Title",
        result.videoInfo?.channelName || "Unknown Channel",
        cleanedTranscript
      );
      
      if (aiResult.success) {
        setAiSummary(aiResult.content);
        setProcessingStep('complete');
        
        toast({
          title: "Video Analysis Complete",
          description: "Dr. Mitchell has analyzed the video content. Review the summary below.",
        });
      } else {
        setProcessingStep('error');
        setErrorMessage(aiResult.error || 'Failed to generate AI summary');
        toast({
          title: "AI Analysis Failed",
          description: aiResult.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Video processing error:', error);
      setProcessingStep('error');
      setErrorMessage('An unexpected error occurred while processing the video.');
      toast({
        title: "Processing Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const handleInsertSummary = () => {
    if (!aiSummary) return;

    const formattedContent = `# YouTube Video Analysis

${videoInfo ? youtubeService.formatVideoInfo(videoInfo) : ''}

## Dr. Mitchell's Medical Analysis

${aiSummary}

---
*Source: ${youtubeUrl}*
*Analyzed by Dr. Sarah Mitchell, MD*`;

    onInsertToNote(formattedContent);
    toast({
      title: "Summary Added",
      description: "YouTube video analysis has been added to your notes.",
    });
    onClose();
  };

  const handleManualAnalysis = async () => {
    if (!manualTranscript.trim()) {
      toast({
        title: "Transcript Required",
        description: "Please paste the video transcript to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('analyzing');

    try {
      const aiResult = await aiService.analyzeYouTubeVideo(
        videoInfo?.title || "Manual Input",
        videoInfo?.channelName || "User Provided",
        manualTranscript
      );

      if (aiResult.success) {
        setAiSummary(aiResult.content);
        setTranscript(manualTranscript);
        setProcessingStep('complete');

        toast({
          title: "Manual Analysis Complete",
          description: "Dr. Mitchell has analyzed the transcript content.",
        });
      } else {
        setProcessingStep('error');
        setErrorMessage(aiResult.error || 'Failed to generate AI summary');
        toast({
          title: "AI Analysis Failed",
          description: aiResult.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Manual analysis error:', error);
      setProcessingStep('error');
      setErrorMessage('An unexpected error occurred during analysis.');
      toast({
        title: "Analysis Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const handleReset = () => {
    setYoutubeUrl("");
    setVideoInfo(null);
    setTranscript("");
    setAiSummary("");
    setManualTranscript("");
    setProcessingStep('input');
    setErrorMessage("");
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'extracting':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'analyzing':
        return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Youtube className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            <span className="font-medium text-foreground">YouTube Video Analyzer</span>
            <span className="text-xs text-muted-foreground">Powered by Dr. Mitchell</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-3rem)]">
          {/* URL Input */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                YouTube Video URL
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                💡 <strong>Tip:</strong> Educational channels like Khan Academy, Crash Course, and medical schools usually have transcripts available.
              </p>
              <div className="flex gap-2">
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="flex-1"
                  disabled={isProcessing || processingStep === 'manual'}
                />
                <Button 
                  onClick={handleProcessVideo}
                  disabled={isProcessing || !youtubeUrl.trim() || processingStep === 'manual'}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>
              {processingStep === 'manual' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Currently in manual mode. Click "Try Different Video" below to analyze a new URL.
                </p>
              )}
            </div>

            {/* Processing Steps */}
            {processingStep !== 'input' && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStepIcon('extracting')}
                    <span className={`text-sm ${processingStep === 'extracting' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      Extracting video information and transcript
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStepIcon('analyzing')}
                    <span className={`text-sm ${processingStep === 'analyzing' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      Dr. Mitchell is analyzing medical content
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStepIcon('complete')}
                    <span className={`text-sm ${processingStep === 'complete' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      Analysis complete
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {processingStep === 'error' && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive">Processing Failed</h4>
                  <p className="text-sm text-destructive/80 mt-1">{errorMessage}</p>
                  <Button size="sm" variant="outline" onClick={handleReset} className="mt-2">
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Transcript Input */}
          {processingStep === 'manual' && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full p-2 mt-1">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">Manual Transcript Required</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The video transcript couldn't be extracted automatically. This often happens when:
                    </p>
                    <ul className="text-sm text-muted-foreground mb-4 space-y-1 list-disc list-inside">
                      <li>The video doesn't have auto-generated captions</li>
                      <li>Captions are disabled by the creator</li>
                      <li>The video is private or restricted</li>
                      <li>The transcript service is temporarily unavailable</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                  <h5 className="font-medium text-foreground mb-3">📋 How to get the transcript:</h5>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>Open the video on YouTube in a new tab</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Click the <strong>"..."</strong> (more) button below the video</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <span>Select <strong>"Show transcript"</strong> from the menu</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                      <span>Copy all the text and paste it below</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>💡 Tip:</strong> If "Show transcript" isn't available, the video doesn't have captions.
                      You can still analyze the video by typing a summary of what was discussed.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Video Transcript or Summary:
                  </label>
                  <Textarea
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    placeholder="Paste the video transcript here, or type a summary of the medical content discussed...

Example:
The video discusses cardiovascular anatomy, specifically the four chambers of the heart. It explains how blood flows through the pulmonary and systemic circulation, and covers the cardiac cycle including systole and diastole phases..."
                    className="min-h-[150px] text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {manualTranscript.length} characters • Dr. Mitchell can analyze any amount of text
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleManualAnalysis}
                    disabled={isProcessing || !manualTranscript.trim()}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Dr. Mitchell is analyzing...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Get Dr. Mitchell's Analysis
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Try Different Video
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {processingStep === 'complete' && aiSummary && (
            <div className="space-y-4">
              {/* Video Info */}
              {videoInfo && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Video Information</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {videoInfo.title}</p>
                    <p><strong>Channel:</strong> {videoInfo.channelName}</p>
                  </div>
                </div>
              )}

              {/* AI Summary */}
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dr. Mitchell's Medical Analysis
                </h3>
                <div className="text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {aiSummary}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleReset}>
                  Analyze Another Video
                </Button>
                <Button onClick={handleInsertSummary}>
                  Insert Analysis to Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
