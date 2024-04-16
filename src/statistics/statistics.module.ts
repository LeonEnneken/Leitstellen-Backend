import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/@services/prisma.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [
    StatisticsService
  ],
  controllers: [
    StatisticsController
  ]
})
export class StatisticsModule {
  
}