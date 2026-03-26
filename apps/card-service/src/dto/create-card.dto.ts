import { IsIn, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  userId: string;

  @IsString()
  @IsIn(['adult', 'student', 'senior'])
  cardType: string;
}
