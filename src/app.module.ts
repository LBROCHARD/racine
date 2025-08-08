import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroupModule } from './modules/group/group.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, GroupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
