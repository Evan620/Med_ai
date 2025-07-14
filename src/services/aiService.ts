interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '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';
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  
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
      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'your-api-key-here') {
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
        // Handle specific error codes
        if (response.status === 402) {
          return this.getFallbackResponse(messages[0]?.content || '', 'API credits exhausted. Using demo mode.');
        } else if (response.status === 401) {
          return this.getFallbackResponse(messages[0]?.content || '', 'Invalid API key. Using demo mode.');
        } else {
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
}

export const aiService = new AIService();
