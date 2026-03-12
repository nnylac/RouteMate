import { Injectable } from '@nestjs/common';

@Injectable()
export class RouteServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
