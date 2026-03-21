import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { RegisterDto } from './dto/register.dto';
import { SuspendDto } from './dto/suspend.dto';
import { RetrieveNotificationsDto } from './dto/retrieve-notifications.dto';
import { CommonStudentsResponseDto } from './dto/common-students-response.dto';
import { NotificationRecipientsResponseDto } from './dto/notification-recipients-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import {
  ICommonStudentsResult,
  INotificationRecipientsResult,
} from './interfaces/registration.interface';

@ApiTags('registrations')
@Controller('api')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Register one or more students to a teacher' })
  @ApiResponse({ status: 204, description: 'Students registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  async register(@Body() dto: RegisterDto): Promise<void> {
    await this.registrationsService.register(dto);
  }

  @Get('commonstudents')
  @ApiOperation({
    summary: 'Retrieve students common to a given list of teachers',
  })
  @ApiQuery({
    name: 'teacher',
    required: true,
    isArray: true,
    example: 'teacherken@gmail.com',
    description: 'One or more teacher email addresses',
  })
  @ApiResponse({
    status: 200,
    description: 'List of common students',
    type: CommonStudentsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  async commonStudents(
    @Query('teacher') teacher: string | string[],
  ): Promise<ICommonStudentsResult> {
    const teacherEmails = Array.isArray(teacher) ? teacher : [teacher];
    return this.registrationsService.getCommonStudents(teacherEmails);
  }

  @Post('suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Suspend a specified student' })
  @ApiResponse({ status: 204, description: 'Student suspended successfully' })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  async suspend(@Body() dto: SuspendDto): Promise<void> {
    await this.registrationsService.suspendStudent(dto.student);
  }

  @Post('retrievefornotifications')
  @ApiOperation({
    summary: 'Retrieve students who can receive a given notification',
    description:
      'Returns all non-suspended students who are either registered to the teacher ' +
      'or @mentioned in the notification text.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notification recipients',
    type: NotificationRecipientsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Teacher not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  async retrieveForNotifications(
    @Body() dto: RetrieveNotificationsDto,
  ): Promise<INotificationRecipientsResult> {
    return this.registrationsService.retrieveForNotifications(dto);
  }
}
