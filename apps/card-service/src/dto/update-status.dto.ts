import { IsIn, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['active', 'blocked', 'inactive'])
  status: string;
}
