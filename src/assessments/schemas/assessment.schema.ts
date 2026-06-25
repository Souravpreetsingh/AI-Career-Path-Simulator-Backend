import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssessmentDocument = Assessment & Document;

@Schema({ timestamps: true })
export class Assessment {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: [String], required: true })
  selectedSkills: string[];

  @Prop({ required: true })
  interests: string;

  @Prop()
  careerGoals?: string;

  @Prop({ type: [String], default: [] })
  strengths?: string[];

  @Prop({ type: [String], default: [] })
  weaknesses?: string[];

  @Prop({ type: Object, default: {} })
  scores?: Record<string, number>;

  @Prop({ type: Object, default: {} })
  matchPercentages?: Record<string, number>;

  @Prop()
  completedAt?: Date;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);

AssessmentSchema.index({ userId: 1, completedAt: -1 });
AssessmentSchema.index({ interests: 1 });
