import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentWrapperServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
