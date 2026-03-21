import { ApiProperty } from '@nestjs/swagger';

export class NotificationRecipientsResponseDto {
  @ApiProperty({
    example: ['studentbob@gmail.com', 'studentagnes@gmail.com'],
    type: [String],
  })
  recipients: string[];
}
