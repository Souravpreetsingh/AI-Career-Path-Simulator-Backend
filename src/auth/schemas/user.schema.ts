import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../common/utils/roles.enum';

export type UserDocument = User & Document;
export type AuthProvider = 'email' | 'google';

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ trim: true })
  collegeName?: string;

  @Prop({ trim: true })
  course?: string;

  @Prop()
  graduationYear?: number;

  @Prop()
  avatar?: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ select: false })
  password?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ index: true })
  googleId?: string;

  @Prop({ required: true, enum: ['email', 'google'], default: 'email' })
  provider: AuthProvider;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1, provider: 1 });
