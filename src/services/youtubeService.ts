interface YouTubeVideoInfo {
  title: string;
  description: string;
  duration: string;
  channelName: string;
  publishedAt: string;
}

interface YouTubeTranscript {
  text: string;
  start: number;
  duration: number;
}

interface YouTubeProcessResult {
  success: boolean;
  videoInfo?: YouTubeVideoInfo;
  transcript?: string;
  error?: string;
}

class YouTubeService {
  // Extract video ID from various YouTube URL formats
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  // Validate if URL is a YouTube URL
  isYouTubeUrl(url: string): boolean {
    const youtubePatterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/,
      /^(youtube\.com|youtu\.be)/,
    ];
    
    return youtubePatterns.some(pattern => pattern.test(url));
  }

  // Get video information using YouTube oEmbed API (no API key required)
  async getVideoInfo(videoId: string): Promise<YouTubeVideoInfo | null> {
    try {
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video info');
      }
      
      const data = await response.json();
      
      return {
        title: data.title || 'Unknown Title',
        description: '', // oEmbed doesn't provide description
        duration: '', // oEmbed doesn't provide duration
        channelName: data.author_name || 'Unknown Channel',
        publishedAt: '', // oEmbed doesn't provide publish date
      };
    } catch (error) {
      console.error('Error fetching video info:', error);
      return null;
    }
  }

  // Extract transcript using multiple methods
  async getTranscript(videoId: string): Promise<string | null> {
    const methods = [
      () => this.getTranscriptMethod1(videoId),
      () => this.getTranscriptMethod2(videoId),
      () => this.getTranscriptMethod3(videoId)
    ];

    for (const method of methods) {
      try {
        const transcript = await method();
        if (transcript && transcript.length > 50) { // Ensure we got meaningful content
          return transcript;
        }
      } catch (error) {
        console.log('Transcript method failed, trying next...', error);
        continue;
      }
    }

    console.log('All transcript extraction methods failed');
    return null;
  }

  // Method 1: Using youtube-transcript-api
  private async getTranscriptMethod1(videoId: string): Promise<string | null> {
    const transcriptUrl = `https://youtube-transcript-api.herokuapp.com/transcript?video_id=${videoId}`;

    const response = await fetch(transcriptUrl);

    if (!response.ok) {
      throw new Error('Method 1 failed');
    }

    const transcriptData: YouTubeTranscript[] = await response.json();

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('No transcript data');
    }

    return transcriptData
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Method 2: Using alternative API
  private async getTranscriptMethod2(videoId: string): Promise<string | null> {
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://youtubetranscript.com/?server_vid=${videoId}`
    )}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Method 2 failed');
    }

    const data = await response.json();

    // This would need parsing based on the actual response format
    if (data.contents && data.contents.includes('transcript')) {
      // Basic extraction - this is simplified
      const textMatch = data.contents.match(/"text":"([^"]+)"/g);
      if (textMatch) {
        return textMatch
          .map((match: string) => match.replace(/"text":"([^"]+)"/, '$1'))
          .join(' ')
          .replace(/\\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }

    throw new Error('No transcript found in method 2');
  }

  // Method 3: Direct YouTube page scraping (simplified)
  private async getTranscriptMethod3(videoId: string): Promise<string | null> {
    try {
      // This is a simplified approach - in production you'd want more robust parsing
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`
      )}`;

      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error('Method 3 failed');
      }

      const data = await response.json();
      const htmlContent = data.contents;

      // Look for captions data in the page
      const captionMatch = htmlContent.match(/"captions":\s*({[^}]+})/);

      if (captionMatch) {
        // This is a very basic implementation
        // In production, you'd need more sophisticated parsing
        throw new Error('Method 3 needs more implementation');
      }

      throw new Error('No captions found in method 3');
    } catch (error) {
      throw new Error('Method 3 failed: ' + error);
    }
  }



  // Main method to process YouTube video
  async processYouTubeVideo(url: string): Promise<YouTubeProcessResult> {
    try {
      // Validate URL
      if (!this.isYouTubeUrl(url)) {
        return {
          success: false,
          error: 'Invalid YouTube URL. Please provide a valid YouTube video link.',
        };
      }

      // Extract video ID
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        return {
          success: false,
          error: 'Could not extract video ID from the provided URL.',
        };
      }

      // Get video information
      const videoInfo = await this.getVideoInfo(videoId);
      if (!videoInfo) {
        return {
          success: false,
          error: 'Could not fetch video information. The video might be private or unavailable.',
        };
      }

      // Get transcript
      const transcript = await this.getTranscript(videoId);
      if (!transcript) {
        return {
          success: false,
          error: 'Could not extract transcript. The video might not have captions available, or captions might be disabled.',
        };
      }

      return {
        success: true,
        videoInfo,
        transcript,
      };
    } catch (error) {
      console.error('YouTube processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred while processing the video.',
      };
    }
  }

  // Format video info for display
  formatVideoInfo(videoInfo: YouTubeVideoInfo): string {
    return `**Video Information:**
- **Title:** ${videoInfo.title}
- **Channel:** ${videoInfo.channelName}
${videoInfo.duration ? `- **Duration:** ${videoInfo.duration}` : ''}
${videoInfo.publishedAt ? `- **Published:** ${videoInfo.publishedAt}` : ''}

---`;
  }

  // Clean and prepare transcript for AI processing
  cleanTranscript(transcript: string): string {
    return transcript
      .replace(/\[.*?\]/g, '') // Remove timestamp markers
      .replace(/\(.*?\)/g, '') // Remove parenthetical notes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}

export const youtubeService = new YouTubeService();
