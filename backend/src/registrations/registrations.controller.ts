import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CommonStudentsQueryDto } from './dto/common-students-query.dto';
import { CommonStudentsResponseDto } from './dto/common-students-response.dto';
import { NotificationRecipientsResponseDto } from './dto/notification-recipients-response.dto';
import { RegisterDto } from './dto/register.dto';
import { RetrieveNotificationsDto } from './dto/retrieve-notifications.dto';
import { SuspendDto } from './dto/suspend.dto';
import {
  ICommonStudentsResult,
  INotificationRecipientsResult,
} from './interfaces/registration.interface';
import { RegistrationsService } from './registrations.service';

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
    @Query() query: CommonStudentsQueryDto,
  ): Promise<ICommonStudentsResult> {
    return this.registrationsService.getCommonStudents(query.teacher);
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
