import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { Booking } from '@prisma/client';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { log } from 'console';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async seeder() {
    const bookingsData = fs.readFileSync('src/datainit/booking.json', 'utf8');
    const parseData = JSON.parse(bookingsData);
    const createdBookings = [];
    for (const bookingJson of parseData) {
      try {
        createdBookings.push(await this.create(bookingJson));
      } catch (error) {
        console.log(error);
      }
    }
    return createdBookings;
  }
  async create(createBookingDto: CreateBookingDto) {
    try {
      const fecha = new Date(createBookingDto.Date);

      const booking = await this.prisma.booking.create({
        data: {
          TransactionNumber: createBookingDto.TransactionNumber,
          Quantity: createBookingDto.Quantity,
          Paid: createBookingDto.Paid,
          Date: fecha,
          userId: createBookingDto.userId,
          eventsId: createBookingDto.eventsId,
        },
      });
      console.log(booking);

      return booking;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Booking. Error en el servicio de creación de reserva. Verifica que no tengas duplicados el usuario y el evento',
      );
    }
  }

  async findAll() {
    try {
      const bookings = await this.prisma.booking.findMany({
        // where: { deletedAt: { not: null } },
        where: {
          OR: [{ deletedAt: null }, { TransactionNumber: { not: null } }],
        },
      });
      return bookings;
    } catch (error) {
      throw new Error('Booking. Error en el servicio de búsqueda.');
    }
  }

  async deleteds() {
    // deleteAt IS NULL or TransactionNumber IS NULL
    try {
      const bookings = await this.prisma.booking.findMany({
        where: {
          OR: [{ deletedAt: { not: null } }, { TransactionNumber: null }],
        },
      });
      return bookings;
    } catch (error) {
      throw new Error('Booking. Error en el servicio de búsqueda eliminados.');
    }
  }

  async findOne(idUser: number, idEvent: number) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: {
          userId_eventsId: {
            userId: idUser,
            eventsId: idEvent,
          },
        },
      });
      return booking;
    } catch (error) {
      throw new Error(
        'Booking. Error en el servicio de búsqueda por usuario y evento.',
      );
    }
  }

  async findOneByUser(idUser: number) {
    try {
      const booking = await this.prisma.booking.findMany({
        where: {
          userId: idUser,
        },
      });
      return booking;
    } catch (error) {
      throw new Error('Booking. Error en el servicio de búsqueda por usuario.');
    }
  }

  async findOneByEvent(idEvent: number) {
    try {
      const booking = await this.prisma.booking.findMany({
        where: {
          eventsId: idEvent,
        },
      });
      return booking;
    } catch (error) {
      throw new Error('Booking. Error en el servicio de búsqueda.');
    }
  }

  async update(
    idUser: number,
    idEvent: number,
    updateBookingDto: UpdateBookingDto,
  ) {
    const updateData: Partial<UpdateBookingDto> = { ...updateBookingDto };
    console.log(
      'idUser',
      idUser,
      'idEvent',
      idEvent,
      'updateBookingDto',
      updateBookingDto,
    );
    try {
      const booking = await this.prisma.booking.update({
        where: {
          userId_eventsId: {
            userId: idUser,
            eventsId: idEvent,
          },
        },
        data: updateBookingDto,
      });
      return booking;
    } catch (error) {
      console.log(error);

      throw new Error('Booking: Error en el servicio de actualización.');
    }
  }

  async remove(idUser: number, idEvent: number) {
    try {
      // const booking = await this.prisma.booking.update({
      //   where: {
      //     userId_eventsId: {
      //       userId: idUser,
      //       eventsId: idEvent,
      //     },
      //   },
      //   data: {
      //     deletedAt: new Date(),
      //   },
      // });
      const booking = await this.prisma.booking.delete({
        where: {
          userId_eventsId: {
            userId: idUser,
            eventsId: idEvent,
          },
        },
      });
      return booking;
    } catch (error) {
      throw new Error('Booking: Error en el servicio de eliminación.');
    }
  }
}
