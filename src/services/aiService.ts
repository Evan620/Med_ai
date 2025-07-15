interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

interface AudioDiscussionResponse extends AIResponse {
  segments?: DiscussionSegment[];
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DiscussionSegment {
  speaker: 'host' | 'expert';
  content: string;
  duration?: number;
}

class AIService {
  private apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    // Debug logging to check if API key is loaded correctly
    console.log('Environment API Key:', import.meta.env.VITE_OPENROUTER_API_KEY);
    console.log('Final API Key:', this.apiKey);
    console.log('API Key length:', this.apiKey?.length);
    console.log('API Key starts with:', this.apiKey?.substring(0, 10));

    // Test API key validity
    this.testApiKey();
  }

  private async testApiKey() {
    if (!this.apiKey) {
      console.log('❌ No API key found');
      return;
    }

    console.log('🔍 Testing API key validity...');
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (response.ok) {
        console.log('✅ API key is valid');
      } else {
        console.log('❌ API key test failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ API key test error:', error);
    }
  }
  
  private systemPrompt = `You are Dr. Sarah Mitchell, a distinguished senior medical practitioner with 30 years of clinical experience. You have:

- MD from Harvard Medical School (1994)
- Board certifications in Internal Medicine and Emergency Medicine
- Former Chief of Medicine at Massachusetts General Hospital
- Published over 150 peer-reviewed medical papers
- Expertise in clinical diagnosis, treatment protocols, and medical education

Your communication style is:
- Professional, authoritative, yet approachable
- Evidence-based with current medical guidelines
- Clear explanations suitable for medical students and practitioners
- Always emphasize patient safety and best practices
- Include relevant clinical pearls and practical insights

When responding:
1. Provide accurate, up-to-date medical information
2. Reference current guidelines when applicable
3. Include differential diagnoses when relevant
4. Mention red flags or critical considerations
5. Use proper medical terminology while explaining concepts clearly
6. Always remind users that your advice doesn't replace clinical judgment or direct patient care

Format your responses professionally with clear headings and bullet points when appropriate.`;

  async callOpenRouter(messages: OpenRouterMessage[], model = 'anthropic/claude-3.5-sonnet'): Promise<AIResponse> {
    try {
      // Debug logging
      console.log('Attempting API call with key:', this.apiKey?.substring(0, 20) + '...');

      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'your-api-key-here') {
        console.log('No valid API key found, using fallback');
        return this.getFallbackResponse(messages[0]?.content || '');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MedNote AI - Medical Study Companion'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        console.log('API Response not OK:', response.status, response.statusText);
        // Handle specific error codes
        if (response.status === 402) {
          console.log('API credits exhausted');
          return this.getFallbackResponse(messages[0]?.content || '', 'API credits exhausted. Using demo mode.');
        } else if (response.status === 401) {
          console.log('Invalid API key - 401 error');
          return this.getFallbackResponse(messages[0]?.content || '', 'Invalid API key. Using demo mode.');
        } else {
          console.log('Other API error:', response.status);
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return {
          content: data.choices[0].message.content,
          success: true
        };
      } else {
        throw new Error('Invalid response format from OpenRouter API');
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      // Return fallback response instead of empty content
      return this.getFallbackResponse(messages[0]?.content || '', 'AI service temporarily unavailable. Using demo mode.');
    }
  }

  private getFallbackResponse(userInput: string, reason?: string): AIResponse {
    const fallbackContent = `**Dr. Sarah Mitchell, MD - Demo Mode**

${reason ? `*${reason}*\n\n` : ''}Thank you for your question: "${userInput.substring(0, 100)}${userInput.length > 100 ? '...' : ''}"

**Demo Response:**

As Dr. Sarah Mitchell, I appreciate your interest in medical education. In this demo mode, I would typically provide:

## Clinical Analysis
- Comprehensive medical assessment based on current evidence
- Relevant pathophysiology and clinical correlations
- Evidence-based treatment considerations

## Educational Insights
- Key learning objectives for medical students
- Clinical pearls from 30 years of practice
- Important safety considerations and red flags

## Professional Recommendations
- Current medical guidelines and best practices
- Differential diagnosis considerations
- Practical clinical applications

**Note:** This is a demonstration response. For full AI-powered medical analysis, please configure a valid OpenRouter API key in your environment variables.

**Important:** This information is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment.`;

    return {
      content: fallbackContent,
      success: true
    };
  }

  async summarizeText(text: string): Promise<AIResponse> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Please provide a comprehensive medical summary of the following text. Focus on key clinical concepts, important medical terminology, and relevant clinical applications:

"${text}"

Please structure your response with:
- Key Medical Concepts
- Clinical Significance
- Important Terminology
- Practical Applications`
      }
    ];

    return this.callOpenRouter(messages);
  }

  async explainConcept(text: string): Promise<AIResponse> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `As a senior medical practitioner, please provide a detailed explanation of the medical concepts in this text. Include pathophysiology, clinical correlations, and practical insights:

"${text}"

Please include:
- Detailed pathophysiology
- Clinical correlations
- Differential diagnoses (if applicable)
- Treatment considerations
- Clinical pearls from your experience`
      }
    ];

    return this.callOpenRouter(messages);
  }

  async answerQuestion(question: string, context?: string): Promise<AIResponse> {
    let prompt = `As Dr. Sarah Mitchell, please answer this medical question with your 30 years of clinical experience:

"${question}"`;

    if (context) {
      prompt += `\n\nContext from current study material:\n"${context}"`;
    }

    prompt += `\n\nPlease provide:
- A comprehensive answer based on current medical evidence
- Clinical considerations and best practices
- Any relevant guidelines or protocols
- Practical insights from clinical experience
- Important safety considerations or red flags`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.callOpenRouter(messages);
  }

  async generateClinicalNote(patientInfo: string): Promise<AIResponse> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Based on the following patient information, help me structure a comprehensive clinical note following standard medical documentation practices:

"${patientInfo}"

Please provide a well-structured clinical note with appropriate sections:
- Chief Complaint
- History of Present Illness
- Assessment
- Plan
- Clinical reasoning and considerations

Ensure the note follows proper medical documentation standards and includes relevant clinical decision-making rationale.`
      }
    ];

    return this.callOpenRouter(messages);
  }

  async reviewDifferentialDiagnosis(symptoms: string): Promise<AIResponse> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Given these clinical symptoms/findings, please provide a comprehensive differential diagnosis with clinical reasoning:

"${symptoms}"

Please include:
- Primary differential diagnoses (most likely)
- Secondary considerations
- Red flag conditions to rule out
- Recommended diagnostic workup
- Clinical reasoning for each diagnosis
- Next steps in evaluation`
      }
    ];

    return this.callOpenRouter(messages);
  }

  async analyzeYouTubeVideo(videoTitle: string, channelName: string, transcript: string): Promise<AIResponse> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `As Dr. Sarah Mitchell, please analyze this YouTube video from a medical education perspective:

**Video Title:** "${videoTitle}"
**Channel:** "${channelName}"

**Transcript:**
"${transcript}"

Please provide a comprehensive medical analysis including:

## Medical Content Assessment
- **Accuracy**: Evaluate the medical accuracy of the information presented
- **Evidence Base**: Comment on the quality of evidence cited (if any)
- **Clinical Relevance**: How applicable is this to current medical practice

## Key Medical Concepts
- **Primary Topics**: Main medical subjects covered
- **Important Terminology**: Key medical terms and concepts explained
- **Pathophysiology**: Disease mechanisms or physiological processes discussed

## Educational Value
- **Learning Objectives**: What medical students/practitioners should learn
- **Clinical Applications**: How this knowledge applies to patient care
- **Practical Insights**: Real-world clinical applications

## Critical Analysis
- **Strengths**: What was well-presented or particularly valuable
- **Limitations**: Any gaps, oversimplifications, or areas needing clarification
- **Recommendations**: Additional resources or topics to explore

## Clinical Pearls
- **Key Takeaways**: Most important points for clinical practice
- **Red Flags**: Critical safety considerations or warning signs
- **Best Practices**: Evidence-based recommendations

Please format your response professionally and include any relevant clinical guidelines or current best practices. If the content contains any medical inaccuracies, please note them clearly.`
      }
    ];

    return this.callOpenRouter(messages);
  }

  async generateAudioDiscussion(pdfText: string, pdfTitle?: string, pdfMetadata?: any): Promise<AudioDiscussionResponse> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `As Dr. Sarah Mitchell, please create an engaging audio discussion script about this medical document. The discussion should be formatted as a conversation between two medical experts discussing the content in an educational and accessible way, similar to a medical podcast.

**Document Title:** "${pdfTitle || 'Medical Document'}"
${pdfMetadata ? `**Pages:** ${pdfMetadata.pages}` : ''}

**Document Content:**
"${pdfText}"

Please create a natural, conversational discussion script with the following format:

## Audio Discussion Script

**HOST:** [Introduction and overview of the topic]

**EXPERT:** [Response with key medical insights]

**HOST:** [Follow-up questions or clarifications]

**EXPERT:** [Detailed explanations with clinical context]

Continue this conversational format covering:

### Discussion Topics to Cover:
1. **Introduction & Overview**: What is this document about and why is it important?
2. **Key Medical Concepts**: Break down complex medical terminology and concepts
3. **Clinical Significance**: How does this apply to patient care and clinical practice?
4. **Pathophysiology**: Explain disease mechanisms or physiological processes
5. **Diagnostic Considerations**: Discuss relevant diagnostic approaches
6. **Treatment Implications**: Cover therapeutic options and considerations
7. **Clinical Pearls**: Share practical insights and best practices
8. **Safety Considerations**: Highlight important warnings or contraindications
9. **Future Directions**: Discuss emerging trends or research
10. **Key Takeaways**: Summarize the most important points

### Style Guidelines:
- Make it conversational and engaging, like a medical podcast
- Use clear, accessible language while maintaining medical accuracy
- Include relevant examples and case scenarios when appropriate
- Ask thoughtful questions that a medical student or practitioner might have
- Provide practical clinical insights and real-world applications
- Keep segments focused and well-structured
- Include appropriate medical disclaimers

### Format Requirements:
- Use **HOST:** and **EXPERT:** to clearly identify speakers
- Keep individual speaking segments to 2-3 sentences for natural flow
- Include natural transitions between topics
- End with a clear summary and key takeaways

Please ensure the discussion is medically accurate, educationally valuable, and engaging for healthcare professionals and students.`
      }
    ];

    try {
      const response = await this.callOpenRouter(messages);

      if (response.success) {
        // Parse the response to extract discussion segments
        const segments = this.parseDiscussionScript(response.content);

        return {
          ...response,
          segments
        };
      }

      return response;
    } catch (error) {
      console.error('Audio discussion generation error:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate audio discussion'
      };
    }
  }

  private parseDiscussionScript(script: string): DiscussionSegment[] {
    const segments: DiscussionSegment[] = [];
    const lines = script.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('**HOST:**')) {
        const content = trimmedLine.replace('**HOST:**', '').trim();
        if (content) {
          segments.push({
            speaker: 'host',
            content: content
          });
        }
      } else if (trimmedLine.startsWith('**EXPERT:**')) {
        const content = trimmedLine.replace('**EXPERT:**', '').trim();
        if (content) {
          segments.push({
            speaker: 'expert',
            content: content
          });
        }
      }
    }

    return segments;
  }
}

export const aiService = new AIService();
export type { AudioDiscussionResponse, DiscussionSegment };
