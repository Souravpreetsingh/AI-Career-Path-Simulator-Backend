import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/utils/types';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiResponse } from '../common/api/api-response';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a message to AI chat assistant' })
  async sendMessage(@CurrentUser() user: JwtPayload, @Body() dto: SendMessageDto) {
    const result = await this.chatService.sendMessage(user.sub, dto);
    return ApiResponse.success(result, 'Message sent');
  }

  @Get('history')
  @ApiOperation({ summary: 'Get all chat conversations for current user' })
  async getHistory(@CurrentUser() user: JwtPayload) {
    const chats = await this.chatService.getHistory(user.sub);
    return ApiResponse.success(chats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single chat with all messages' })
  async getChatById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const chat = await this.chatService.getChatById(id, user.sub);
    return ApiResponse.success(chat);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat conversation' })
  async deleteChat(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.chatService.deleteChat(id, user.sub);
    return ApiResponse.noContent('Chat deleted successfully');
  }
}
