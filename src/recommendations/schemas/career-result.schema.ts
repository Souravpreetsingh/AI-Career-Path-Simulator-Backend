import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CareerResultDocument = CareerResult & Document;

export interface CareerMatchEmbedded {
  career: string;
  matchPercentage: number;
  reason: string;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
}

export interface InsightEmbedded {
  type: 'strength' | 'weakness' | 'opportunity' | 'suggestion';
  message: string;
  category: string;
}

@Schema({ timestamps: true })
export class CareerResult {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Assessment' })
  assessmentId: Types.ObjectId;

  @Prop({ type: Array, default: [] })
  careerMatches: CareerMatchEmbedded[];

  @Prop({ type: Array, default: [] })
  generatedInsights: InsightEmbedded[];

  @Prop({ default: Date.now })
  generatedAt: Date;
}

export const CareerResultSchema = SchemaFactory.createForClass(CareerResult);

CareerResultSchema.index({ userId: 1, generatedAt: -1 });
CareerResultSchema.index({ assessmentId: 1 });
CareerResultSchema.index({ 'careerMatches.matchPercentage': -1 });
