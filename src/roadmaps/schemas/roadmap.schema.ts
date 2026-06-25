import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoadmapDocument = Roadmap & Document;

@Schema({ timestamps: true })
export class Roadmap {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Career' })
  careerId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  phases: string[];

  @Prop({ default: 0 })
  progress: number;

  @Prop({ type: [String], default: [] })
  completedSteps: string[];
}

export const RoadmapSchema = SchemaFactory.createForClass(Roadmap);

RoadmapSchema.index({ userId: 1, careerId: 1 }, { unique: true });
