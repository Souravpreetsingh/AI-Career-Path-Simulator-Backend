import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { getMockResponse } from '../chat/utils/mock-responses';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not set — using mock responses');
    }
  }

  async generateChatResponse(message: string, context?: { career?: string; interests?: string[] }): Promise<string> {
    if (this.openai) {
      try {
        const systemPrompt = this.buildSystemPrompt(context);
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        });
        return completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
      } catch (error) {
        this.logger.error(`OpenAI API error: ${error.message}`);
        return 'I apologize, but I encountered an error processing your request. Please try again later.';
      }
    }
    return getMockResponse(message);
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
