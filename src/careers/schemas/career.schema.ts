import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CareerDocument = Career & Document;

@Schema({ timestamps: true })
export class Career {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true, index: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  estimatedSalary?: string;

  @Prop()
  futureDemand?: string;

  @Prop({ type: [String], default: [] })
  requiredSkills: string[];

  @Prop({ type: [String], default: [] })
  roadmapSteps: string[];
}

export const CareerSchema = SchemaFactory.createForClass(Career);
