import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsService } from '../events/events.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [BookingService, EventsService,AuthGuard],
  exports: [BookingService],
})
export class BookingModule {}
