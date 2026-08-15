import { IsBoolean } from 'class-validator';

export class UpdateReviewActiveDto {
  @IsBoolean()
  isActive!: boolean;
}
