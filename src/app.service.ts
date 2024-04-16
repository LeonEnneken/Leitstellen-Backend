import { Injectable } from '@nestjs/common';
import { cpu, mem, os } from 'node-os-utils';
import { PrismaService } from './@services/prisma.service';

@Injectable()
export class AppService {

  uptime: number = 0;

  constructor(private prisma: PrismaService) {
    this.uptime = Date.now();
  }

  async getStatus() {
    const cpuUsage = await cpu.usage();
    const loadAverage = cpu.loadavgTime(15);

    const memInfo = await mem.info();

    const uptime = os.uptime();

    return {
      cpu: {
        usage: cpuUsage,
        loadAverage: loadAverage,
      },
      memory: {
        total: memInfo.totalMemMb,
        used: memInfo.usedMemMb,
        free: memInfo.freeMemMb
      },
      uptime: uptime
    }
  }


}
