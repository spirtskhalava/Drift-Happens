import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SegmentsModule } from './segments/segments.module';

@Module({
  imports: [SegmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
