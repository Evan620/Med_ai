import { DiscussionSegment } from './aiService';

interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

interface AudioSegment {
  id: string;
  speaker: 'host' | 'expert';
  text: string;
  audioBlob?: Blob;
  duration?: number;
  isPlaying?: boolean;
}

interface TTSPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSegmentIndex: number;
  totalSegments: number;
  currentTime: number;
  totalDuration: number;
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private hostVoice: SpeechSynthesisVoice | null = null;
  private expertVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioSegments: AudioSegment[] = [];
  private playbackState: TTSPlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentSegmentIndex: 0,
    totalSegments: 0,
    currentTime: 0,
    totalDuration: 0
  };
  private onStateChange?: (state: TTSPlaybackState) => void;
  private onSegmentChange?: (segment: AudioSegment, index: number) => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
    console.log('TextToSpeechService: Initializing, speechSynthesis available:', !!this.synthesis);
    this.loadVoices();

    // Listen for voice changes
    this.synthesis.addEventListener('voiceschanged', () => {
      console.log('TextToSpeechService: Voices changed, reloading...');
      this.loadVoices();
    });
  }

  /**
   * Load available voices and select appropriate ones for host and expert
   */
  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
    
    // Try to find good voices for host and expert
    // Prefer different genders/accents for variety
    const femaleVoices = this.voices.filter(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('susan')
    );
    
    const maleVoices = this.voices.filter(voice => 
      voice.name.toLowerCase().includes('male') || 
      voice.name.toLowerCase().includes('man') ||
      voice.name.toLowerCase().includes('daniel') ||
      voice.name.toLowerCase().includes('alex') ||
      voice.name.toLowerCase().includes('tom')
    );

    // Set host voice (prefer female)
    this.hostVoice = femaleVoices[0] || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    
    // Set expert voice (prefer male, different from host)
    this.expertVoice = maleVoices[0] || 
      this.voices.find(v => v !== this.hostVoice && v.lang.startsWith('en')) || 
      this.voices[1] || this.voices[0];
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Set custom voices for host and expert
   */
  setVoices(hostVoice: SpeechSynthesisVoice, expertVoice: SpeechSynthesisVoice): void {
    this.hostVoice = hostVoice;
    this.expertVoice = expertVoice;
  }

  /**
   * Convert discussion segments to audio segments
   */
  async prepareAudioDiscussion(segments: DiscussionSegment[]): Promise<AudioSegment[]> {
    this.audioSegments = segments.map((segment, index) => {
      // Clean the text content for better audio output
      const cleanedText = this.cleanTextForSpeech(segment.content);

      return {
        id: `segment-${index}`,
        speaker: segment.speaker,
        text: cleanedText,
        duration: this.estimateDuration(cleanedText)
      };
    });

    this.playbackState.totalSegments = this.audioSegments.length;
    this.playbackState.totalDuration = this.audioSegments.reduce((total, segment) =>
      total + (segment.duration || 0), 0
    );

    return this.audioSegments;
  }

  /**
   * Clean text specifically for speech synthesis
   */
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/__(.*?)__/g, '$1') // Bold
      .replace(/_(.*?)_/g, '$1') // Italic
      .replace(/`([^`]+)`/g, '$1') // Inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
      // Remove special characters that might cause speech issues
      .replace(/[#*_`~\[\]()]/g, '')
      // Fix common abbreviations for better pronunciation
      .replace(/\bDr\./g, 'Doctor')
      .replace(/\bMr\./g, 'Mister')
      .replace(/\bMrs\./g, 'Missus')
      .replace(/\bMs\./g, 'Miss')
      .replace(/\bProf\./g, 'Professor')
      .replace(/\betc\./g, 'etcetera')
      .replace(/\bi\.e\./g, 'that is')
      .replace(/\be\.g\./g, 'for example')
      .replace(/\bvs\./g, 'versus')
      .replace(/\bno\./g, 'number')
      // Improve pronunciation of medical terms
      .replace(/\bECG\b/g, 'E C G')
      .replace(/\bEKG\b/g, 'E K G')
      .replace(/\bMRI\b/g, 'M R I')
      .replace(/\bCT\b/g, 'C T')
      .replace(/\bDNA\b/g, 'D N A')
      .replace(/\bRNA\b/g, 'R N A')
      .replace(/\bBP\b/g, 'blood pressure')
      .replace(/\bHR\b/g, 'heart rate')
      .replace(/\bIV\b/g, 'intravenous')
      .replace(/\bIM\b/g, 'intramuscular')
      .replace(/\bPO\b/g, 'by mouth')
      // Clean up whitespace and punctuation
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1')
      .replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')
      // Ensure proper sentence endings for natural pauses
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      .trim();
  }

  /**
   * Estimate duration of text in seconds
   */
  private estimateDuration(text: string): number {
    const wordsPerMinute = 150; // Average speaking rate
    const wordCount = text.split(/\s+/).length;
    return Math.ceil((wordCount / wordsPerMinute) * 60);
  }

  /**
   * Play the entire discussion
   */
  async playDiscussion(): Promise<void> {
    if (this.audioSegments.length === 0) {
      throw new Error('No audio segments prepared');
    }

    this.playbackState.isPlaying = true;
    this.playbackState.isPaused = false;
    this.playbackState.currentSegmentIndex = 0;
    this.notifyStateChange();

    await this.playSegment(0);
  }

  /**
   * Play a specific segment
   */
  private async playSegment(index: number): Promise<void> {
    if (index >= this.audioSegments.length) {
      this.stopDiscussion();
      return;
    }

    const segment = this.audioSegments[index];
    this.playbackState.currentSegmentIndex = index;
    
    if (this.onSegmentChange) {
      this.onSegmentChange(segment, index);
    }

    const voice = segment.speaker === 'host' ? this.hostVoice : this.expertVoice;
    
    return new Promise((resolve, reject) => {
      this.currentUtterance = new SpeechSynthesisUtterance(segment.text);
      
      if (voice) {
        this.currentUtterance.voice = voice;
      }
      
      // Configure speech parameters
      this.currentUtterance.rate = segment.speaker === 'host' ? 0.9 : 0.85; // Slightly different rates
      this.currentUtterance.pitch = segment.speaker === 'host' ? 1.1 : 0.9; // Different pitches
      this.currentUtterance.volume = 1.0;

      this.currentUtterance.onend = () => {
        if (this.playbackState.isPlaying && !this.playbackState.isPaused) {
          // Play next segment
          setTimeout(() => {
            this.playSegment(index + 1);
          }, 500); // Small pause between segments
        }
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(new Error('Speech synthesis failed'));
      };

      this.synthesis.speak(this.currentUtterance);
    });
  }

  /**
   * Pause the discussion
   */
  pauseDiscussion(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
      this.playbackState.isPaused = true;
      this.notifyStateChange();
    }
  }

  /**
   * Resume the discussion
   */
  resumeDiscussion(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
      this.playbackState.isPaused = false;
      this.notifyStateChange();
    }
  }

  /**
   * Stop the discussion
   */
  stopDiscussion(): void {
    this.synthesis.cancel();
    this.playbackState.isPlaying = false;
    this.playbackState.isPaused = false;
    this.playbackState.currentSegmentIndex = 0;
    this.playbackState.currentTime = 0;
    this.currentUtterance = null;
    this.notifyStateChange();
  }

  /**
   * Skip to next segment
   */
  nextSegment(): void {
    if (this.playbackState.currentSegmentIndex < this.audioSegments.length - 1) {
      this.synthesis.cancel();
      this.playSegment(this.playbackState.currentSegmentIndex + 1);
    }
  }

  /**
   * Skip to previous segment
   */
  previousSegment(): void {
    if (this.playbackState.currentSegmentIndex > 0) {
      this.synthesis.cancel();
      this.playSegment(this.playbackState.currentSegmentIndex - 1);
    }
  }

  /**
   * Jump to specific segment
   */
  jumpToSegment(index: number): void {
    if (index >= 0 && index < this.audioSegments.length) {
      this.synthesis.cancel();
      this.playSegment(index);
    }
  }

  /**
   * Get current playback state
   */
  getPlaybackState(): TTSPlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Set state change callback
   */
  onStateChangeCallback(callback: (state: TTSPlaybackState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Set segment change callback
   */
  onSegmentChangeCallback(callback: (segment: AudioSegment, index: number) => void): void {
    this.onSegmentChange = callback;
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.playbackState });
    }
  }

  /**
   * Check if speech synthesis is supported
   */
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Get current audio segments
   */
  getAudioSegments(): AudioSegment[] {
    return [...this.audioSegments];
  }
}

export const textToSpeechService = new TextToSpeechService();
export type { TTSOptions, AudioSegment, TTSPlaybackState };
