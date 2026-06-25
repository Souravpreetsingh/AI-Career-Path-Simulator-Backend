import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Roadmap, RoadmapDocument } from './schemas/roadmap.schema';
import { SaveRoadmapDto } from './dto/save-roadmap.dto';

@Injectable()
export class RoadmapsService {
  constructor(
    @InjectModel(Roadmap.name) private roadmapModel: Model<RoadmapDocument>,
  ) {}

  async findAll(userId: string) {
    return this.roadmapModel
      .find({ userId })
      .populate('careerId', 'title description')
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const roadmap = await this.roadmapModel
      .findById(id)
      .populate('careerId', 'title description estimatedSalary requiredSkills');
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    return roadmap;
  }

  async save(userId: string, dto: SaveRoadmapDto) {
    const existing = await this.roadmapModel.findOne({
      userId,
      careerId: dto.careerId,
    });

    if (existing) {
      existing.phases = dto.phases || existing.phases;
      existing.progress = dto.progress ?? existing.progress;
      existing.completedSteps = dto.completedSteps || existing.completedSteps;
      return existing.save();
    }

    return this.roadmapModel.create({
      userId,
      careerId: dto.careerId,
      phases: dto.phases || [],
      progress: dto.progress || 0,
      completedSteps: dto.completedSteps || [],
    });
  }
}
