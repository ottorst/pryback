import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Transaction Number',
    example: '123456785',
  })
  @IsOptional()
  @IsString()
  TransactionNumber?: string;

  @ApiProperty({
    description: 'Quantity of tickets',
    example: 1,
  })
  @IsNotEmpty()
  @Min(1)
  Quantity: number;

  @ApiProperty({
    description: 'Paid amount',
    example: 350,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  Paid: number;

  @ApiProperty({
    description: 'Date of booking',
    example: '2024-08-10T20:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  Date: string;

  @ApiProperty({
    description: 'Event Id',
    example: 1,
  })
  @IsNotEmpty()
  eventsId: number;

  @ApiProperty({
    description: 'User Id',
    example: 4,
  })
  @IsNotEmpty()
  userId: number;
}
