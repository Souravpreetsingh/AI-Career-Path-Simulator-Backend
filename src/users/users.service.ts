import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(userId, dto, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteProfile(userId: string) {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Profile deleted successfully' };
  }
}
