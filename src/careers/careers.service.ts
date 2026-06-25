import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Career, CareerDocument } from './schemas/career.schema';
import { CreateCareerDto, UpdateCareerDto } from './dto';
import { getPaginationParams, paginateQuery } from '../common/api/query-helper';
import { buildSearchFilter } from '../common/api/search-helper';

@Injectable()
export class CareersService {
  constructor(
    @InjectModel(Career.name) private careerModel: Model<CareerDocument>,
  ) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const filter = buildSearchFilter(query.search, ['title']);
    const { page, limit } = getPaginationParams(query.page, query.limit);
    return paginateQuery(this.careerModel, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
  }

  async findById(id: string) {
    const career = await this.careerModel.findById(id);
    if (!career) throw new NotFoundException('Career not found');
    return career;
  }

  async create(dto: CreateCareerDto) {
    const existing = await this.careerModel.findOne({ title: dto.title });
    if (existing) throw new ConflictException('Career with this title already exists');
    return this.careerModel.create(dto);
  }

  async update(id: string, dto: UpdateCareerDto) {
    const career = await this.careerModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!career) throw new NotFoundException('Career not found');
    return career;
  }

  async delete(id: string) {
    const career = await this.careerModel.findByIdAndDelete(id);
    if (!career) throw new NotFoundException('Career not found');
    return career;
  }
}
