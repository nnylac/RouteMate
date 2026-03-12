import { Injectable } from '@nestjs/common';

@Injectable()
export class FareServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
