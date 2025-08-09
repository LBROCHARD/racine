import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroupModule } from './modules/group/group.module';
import { PagesController } from './modules/pages/pages.controller';
import { PagesService } from './modules/pages/pages.service';
import { PagesModule } from './modules/pages/pages.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, GroupModule, PagesModule],
  controllers: [AppController, PagesController],
  providers: [AppService, PagesService],
})
export class AppModule {}
