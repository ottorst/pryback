import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SendEmailService } from './sendEmail.service';
import { SendMailDto, SendMailBookingDto, SendMailRegisterDto,sendContactEmailDto } from './dto/sendEmail.dto';
import { SendEmailResponseDto } from './dto/sendEmailResponse.dto';
import { TemplateService } from './template.service';

@ApiTags('email')
@Controller('email')
export class SendEmailController {
  constructor(
    private readonly sendEmailService: SendEmailService,
    private readonly templateService: TemplateService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({
    status: 201,
    description: 'Email sent successfully.',
    type: SendEmailResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: SendMailDto })
  async sendEmail(@Body() sendEmailDto: SendMailDto) {
    const { to, subject, text, html } = sendEmailDto;
    try {
      return await this.sendEmailService.sendMail(to, subject, text, html);
    } catch (error) {
      throw new InternalServerErrorException('Internal server error', error.message);
    }
  }

  @Post('CreateUserEmail')
  @ApiOperation({ summary: 'Send an email upon user creation' })
  @ApiResponse({
    status: 201,
    description: 'Email send successfully.',
    type: SendEmailResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: SendMailRegisterDto })
  async sendCreateUserEmail(@Body() sendCreateUserEmailDto: SendMailRegisterDto) {
    const { to, text, urlHome, name } = sendCreateUserEmailDto;
    try {
      const html = this.templateService.createUserEmail(name, urlHome); 
      return await this.sendEmailService.sendMail(to,"Registration Successful!", text, html);
    } catch (error) {
      throw new InternalServerErrorException('Internal server error', error.message);
    }
  }

  @Post('CreateBookingEmail')
  @ApiOperation({ summary: 'Send an email upon booking' })
  @ApiResponse({
    status: 201,
    description: 'Email send successfully.',
    type: SendEmailResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: SendMailBookingDto })
  async sendCreateBookingEmail(@Body() sendCreateBookingEmailDto: SendMailBookingDto) {
    const { to, text, title, subtitle, description, date, price, location, picture, urlHome } = sendCreateBookingEmailDto;
    try {
      const html = this.templateService.createBookingEmail(title, subtitle, description, date, price, location, picture, urlHome);
      return await this.sendEmailService.sendMail(to, "Booking Successful!", text, html);
    } catch (error) {
      throw new InternalServerErrorException('Internal server error', error.message);
    }
  }
  @Post('contact')
  @ApiOperation({ summary: 'Send an email contact' })
  @ApiResponse({
    status: 201,
    description: 'Email send successfully.',
    type: SendEmailResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: sendContactEmailDto })
  async sendContactEmail(@Body() sendContactEmailDto: sendContactEmailDto) {
    const {fullname, email, message} = sendContactEmailDto;
    let html =""
    try {
      // mensaje de del user 
      const messajeSend = await this.sendEmailService.sendMail(process.env.NODEMAILER_USER, `${fullname} sent you a message!`, message + ` You can reply to the sender's email ${email}`, html);
      if (messajeSend.accepted.length > 0) {
        // confirmacion del mensaje enviado
        await this.sendEmailService.sendMail(email, `your message was sent correctly`, message + ` You can reply to the sender's email ${email}`, html)

        return messajeSend;
      } else {
        // El correo no fue enviado
        throw new InternalServerErrorException('Failed to send email. No recipients accepted the email.');
      }
    } catch (error) {
      throw new InternalServerErrorException('Internal server error', error.message);
    }
  }

}
