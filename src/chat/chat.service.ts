import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument, ChatMessage } from './schemas/chat.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { getMockResponse, SUGGESTED_PROMPTS } from './utils/mock-responses';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) {}

  async sendMessage(userId: string, dto: SendMessageDto) {
    let chat: ChatDocument;

    if (dto.chatId) {
      const existing = await this.chatModel.findOne({ _id: dto.chatId, userId });
      if (!existing) throw new NotFoundException('Chat not found');
      chat = existing;
    } else {
      chat = await this.chatModel.create({
        userId,
        title: dto.message.slice(0, 50),
        messages: [],
      });
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: dto.message,
      timestamp: new Date(),
    };
    chat.messages.push(userMessage);

    const aiResponse = getMockResponse(dto.message);

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };
    chat.messages.push(assistantMessage);

    await chat.save();

    return {
      chatId: chat._id,
      userMessage,
      assistantMessage,
      suggestedPrompts: SUGGESTED_PROMPTS,
    };
  }

  async getHistory(userId: string) {
    return this.chatModel
      .find({ userId })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await this.chatModel.findOne({ _id: chatId, userId });
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async deleteChat(chatId: string, userId: string) {
    const chat = await this.chatModel.findOneAndDelete({ _id: chatId, userId });
    if (!chat) throw new NotFoundException('Chat not found');
    return { message: 'Chat deleted successfully' };
  }
}
