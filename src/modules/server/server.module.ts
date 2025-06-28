import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServerController],
  providers: [ServerService],
  exports: [ServerService],
})
export class ServerModule {}
