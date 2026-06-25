import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Schema({ timestamps: true })
export class Chat {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Array, default: [] })
  messages: ChatMessage[];

  @Prop({ required: true, default: 'New Chat' })
  title: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ userId: 1, updatedAt: -1 });
