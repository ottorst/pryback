import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  HttpCode,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { IsAdmin } from 'src/decorators/rol/IsAdmin.decorator';
import { RolesGuards } from 'src/guards/role/roles.guard';
import { BookingService } from './booking.service';
import { EventsService } from '../events/events.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiResponse, ApiTags,ApiBearerAuth, } from '@nestjs/swagger';

@Controller('booking')
@ApiTags('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly eventsService: EventsService,
  ) {}

  @Get('seeder')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED, //201
    description: `${HttpStatus.CREATED}: Users database seeded initializer (15 users, 4 admins).`,
  })
  seeder() {
    return this.bookingService.seeder();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // @ApiBearerAuth()
  // @IsAdmin(false)
  // @UseGuards(AuthGuard, RolesGuards)
  async create(@Body() createBookingDto: CreateBookingDto) {
    console.log('controller createBookingDto: ', createBookingDto);
    try {
      console.log('createBookingDto: ', createBookingDto);

      if (new Date(createBookingDto.Date) < new Date()) {
        throw new HttpException(
          'The date cannot be in the past.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const event =
        await this.eventsService.eventDetailCountingBookingsAndPersons(
          createBookingDto.eventsId,
        );
      console.log('Booking controller event: ', event);

      const available = event.maxseats - event.totalPersons;
      if (createBookingDto.Quantity > available) {
        throw new HttpException(
          `There are only ${available} seats available.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const booking = await this.bookingService.create(createBookingDto);
      return booking;
    } catch (error) {
      throw new HttpException(
        `Booking not created. ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @IsAdmin(true)
  // @UseGuards(AuthGuard, RolesGuards)
  async findAll() {
    try {
      const bookings = await this.bookingService.findAll();
      return bookings;
    } catch (error) {
      throw new HttpException(
        `Bookings not found. ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('deleteds')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @IsAdmin(true)
  // @UseGuards(AuthGuard, RolesGuards)
  async findOne(
    @Param('idUser') idUser: string,
    @Param('idEvent') idEvent: string,
  ) {

    try {
      const booking = await this.bookingService.deleteds();
      if (!booking) {
        throw new BadRequestException(`Booking not found deleteds`);
      }
      return booking;
    } catch (error) {
      throw new HttpException(
        `Booking not found. ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('byEvent/:idEvent')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @IsAdmin(true)
  // @UseGuards(AuthGuard, RolesGuards)
  async findOneByEvent(@Param('idEvent') idEvent: string) {
    try {
      const booking = await this.bookingService.findOneByEvent(+idEvent);
      if (!booking) {
        throw new BadRequestException(`Booking not found for event ${idEvent}`);
      }
      return booking;
    } catch (error) {
      throw new HttpException(
        `Booking not found. ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('byUser/:idUser')
  @HttpCode(HttpStatus.OK)
  async findOneByUser(@Param('idUser') idUser: string) {
    try {
      const booking = await this.bookingService.findOneByUser(+idUser);
      if (!booking) {
        throw new BadRequestException(`Booking not found for user ${idUser}`);
      }
      return booking;
    } catch (error) {
      throw new HttpException(
        `Booking not found. ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('/:idUser/:idEvent')
  async update(
    @Param('idUser') idUser: string,
    @Param('idEvent') idEvent: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    console.log('Controller: updateBookingDto', updateBookingDto);

    return await this.bookingService.update(
      +idUser,
      +idEvent,
      updateBookingDto,
    );
  }

  @Delete('/:idUser/:idEvent')
  async remove(
    @Param('idUser') idUser: string,
    @Param('idEvent') idEvent: string,
  ) {
    return await this.bookingService.remove(+idUser, +idEvent);
  }
}
