import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoadmapsController } from './roadmaps.controller';
import { RoadmapsService } from './roadmaps.service';
import { Roadmap, RoadmapSchema } from './schemas/roadmap.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Roadmap.name, schema: RoadmapSchema }]),
  ],
  controllers: [RoadmapsController],
  providers: [RoadmapsService],
  exports: [RoadmapsService],
})
export class RoadmapsModule {}
