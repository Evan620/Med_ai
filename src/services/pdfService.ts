import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pages: number;
  };
}

class PDFService {
  /**
   * Extract text content from a PDF file
   */
  async extractTextFromFile(file: File): Promise<PDFExtractionResult> {
    try {
      console.log('PDFService: Starting text extraction for file:', file.name, 'Size:', file.size);
      const arrayBuffer = await file.arrayBuffer();
      console.log('PDFService: ArrayBuffer created, size:', arrayBuffer.byteLength);
      const result = await this.extractTextFromBuffer(arrayBuffer);
      console.log('PDFService: Extraction completed:', { success: result.success, textLength: result.text?.length });
      return result;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract text from PDF'
      };
    }
  }

  /**
   * Extract text content from a PDF buffer
   */
  async extractTextFromBuffer(buffer: ArrayBuffer): Promise<PDFExtractionResult> {
    try {
      console.log('PDFService: Loading PDF document...');
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      console.log('PDFService: PDF loaded, pages:', pdf.numPages);

      const metadata = await pdf.getMetadata();
      console.log('PDFService: Metadata extracted');

      let fullText = '';
      const numPages = pdf.numPages;

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        console.log(`PDFService: Processing page ${pageNum}/${numPages}`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText) {
          fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
        }
        console.log(`PDFService: Page ${pageNum} processed, text length:`, pageText.length);
      }

      // Clean up the extracted text
      const cleanedText = this.cleanExtractedText(fullText);

      return {
        success: true,
        text: cleanedText,
        metadata: {
          title: metadata.info?.Title || undefined,
          author: metadata.info?.Author || undefined,
          subject: metadata.info?.Subject || undefined,
          creator: metadata.info?.Creator || undefined,
          producer: metadata.info?.Producer || undefined,
          creationDate: metadata.info?.CreationDate ? new Date(metadata.info.CreationDate) : undefined,
          modificationDate: metadata.info?.ModDate ? new Date(metadata.info.ModDate) : undefined,
          pages: numPages
        }
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process PDF'
      };
    }
  }

  /**
   * Clean and format extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page headers/footers patterns (common patterns)
      .replace(/--- Page \d+ ---/g, '\n\n')
      // Fix common OCR issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
      .replace(/(\d+)([A-Za-z])/g, '$1 $2') // Add space between numbers and letters
      .replace(/([A-Za-z])(\d+)/g, '$1 $2') // Add space between letters and numbers
      // Clean up punctuation
      .replace(/\s+([.,;:!?])/g, '$1') // Remove space before punctuation
      .replace(/([.,;:!?])([A-Za-z])/g, '$1 $2') // Add space after punctuation
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  /**
   * Remove markdown formatting and clean text for audio processing
   */
  cleanTextForAudio(text: string): string {
    return text
      // Remove markdown headers (# ## ### etc.)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold (**text** or __text__)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      // Remove markdown italic (*text* or _text_)
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove markdown strikethrough (~~text~~)
      .replace(/~~(.*?)~~/g, '$1')
      // Remove markdown code blocks (```code```)
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code (`code`)
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown images ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove markdown list markers (- * +)
      .replace(/^[\s]*[-*+]\s+/gm, '')
      // Remove numbered list markers (1. 2. etc.)
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove markdown blockquotes (>)
      .replace(/^>\s*/gm, '')
      // Remove markdown horizontal rules (--- or ***)
      .replace(/^[-*]{3,}$/gm, '')
      // Remove HTML tags if any
      .replace(/<[^>]*>/g, '')
      // Remove markdown tables (basic cleanup)
      .replace(/\|/g, ' ')
      // Clean up excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Clean up punctuation spacing
      .replace(/\s+([.,;:!?])/g, '$1')
      .replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')
      // Add proper sentence spacing
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Extract text from specific pages
   */
  async extractTextFromPages(file: File, startPage: number, endPage: number): Promise<PDFExtractionResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const numPages = pdf.numPages;
      const actualStartPage = Math.max(1, startPage);
      const actualEndPage = Math.min(numPages, endPage);
      
      let fullText = '';

      for (let pageNum = actualStartPage; pageNum <= actualEndPage; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText) {
          fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
        }
      }

      const cleanedText = this.cleanExtractedText(fullText);

      return {
        success: true,
        text: cleanedText,
        metadata: {
          pages: actualEndPage - actualStartPage + 1
        }
      };
    } catch (error) {
      console.error('PDF page extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract text from specified pages'
      };
    }
  }

  /**
   * Get PDF metadata without extracting text
   */
  async getPDFMetadata(file: File): Promise<PDFExtractionResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const metadata = await pdf.getMetadata();
      
      return {
        success: true,
        metadata: {
          title: metadata.info?.Title || undefined,
          author: metadata.info?.Author || undefined,
          subject: metadata.info?.Subject || undefined,
          creator: metadata.info?.Creator || undefined,
          producer: metadata.info?.Producer || undefined,
          creationDate: metadata.info?.CreationDate ? new Date(metadata.info.CreationDate) : undefined,
          modificationDate: metadata.info?.ModDate ? new Date(metadata.info.ModDate) : undefined,
          pages: pdf.numPages
        }
      };
    } catch (error) {
      console.error('PDF metadata extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract PDF metadata'
      };
    }
  }

  /**
   * Check if a file is a valid PDF
   */
  async isValidPDF(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Estimate reading time for extracted text
   */
  estimateReadingTime(text: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Split text into chunks for processing
   */
  splitTextIntoChunks(text: string, maxChunkSize: number = 4000): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }

    return chunks;
  }
}

export const pdfService = new PDFService();
export type { PDFExtractionResult };
