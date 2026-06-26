import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getMockResponse } from '../chat/utils/mock-responses';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';
  private model: string = 'gpt-4o-mini';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || null;
    if (this.apiKey) {
      if (this.apiKey.startsWith('sk-or-v1-')) {
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.model = 'openai/gpt-4o-mini';
        this.logger.log('OpenRouter client initialized');
      } else {
        this.logger.log('OpenAI client initialized');
      }
    } else {
      this.logger.warn('OPENAI_API_KEY not set — using mock responses');
    }
  }

  async generateChatResponse(message: string, context?: { career?: string; interests?: string[] }): Promise<string> {
    if (!this.apiKey) return getMockResponse(message);

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.baseUrl.includes('openrouter') ? { 'X-Title': 'AI Career Path Simulator' } : {}),
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`API error ${response.status}: ${errText}`);
        return 'I apologize, but I encountered an error processing your request. Please try again later.';
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';
    } catch (error) {
      this.logger.error(`API error: ${error.message}`);
      return 'I apologize, but I encountered an error processing your request. Please try again later.';
    }
  }

  private buildSystemPrompt(context?: { career?: string; interests?: string[] }): string {
    let prompt = 'You are a knowledgeable career advisor AI assistant. Provide helpful, concise advice about careers, skills, education paths, job search strategies, and professional development. Keep responses under 200 words unless asked for detailed information.';
    if (context?.career) {
      prompt += ` The user is interested in the career: ${context.career}.`;
    }
    if (context?.interests?.length) {
      prompt += ` The user has interests in: ${context.interests.join(', ')}.`;
    }
    return prompt;
  }
}
