import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecommendationCareerDocument = RecommendationCareer & Document;

@Schema({ timestamps: true })
export class RecommendationCareer {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  requiredSkills: string[];

  @Prop({ type: [String], default: [] })
  recommendedInterests: string[];

  @Prop({ required: false })
  averageSalary?: string;

  @Prop({ required: false })
  futureDemand?: string;

  @Prop({ default: 0 })
  growthRate: number;

  @Prop({ type: [String], default: [] })
  roadmap: string[];
}

export const RecommendationCareerSchema = SchemaFactory.createForClass(RecommendationCareer);
