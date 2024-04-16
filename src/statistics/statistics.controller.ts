import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth, UserAuth } from 'src/auth/auth.decorator';
import { BackendTrackings } from './statistics.entity';
import { StatisticsService } from './statistics.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {

  constructor(private service: StatisticsService) {

  }

  @UserAuth('Count statistics')
  @Get('counts')
  async getCounts() {
    return this.service.getCounts();
  }

  @PermissionsAuth('STATISTICS_TRACKINGS_SHOW', 'Get trackings between two dates')
  @Get('trackings/:startDate/:endDate')
  @ApiOkResponse({
    type: BackendTrackings,
    isArray: true
  })
  async getTrackings(@Param('startDate') startDate: number, @Param('endDate') endDate: number) {
    return this.service.getTrackings(startDate, endDate);
  }

}