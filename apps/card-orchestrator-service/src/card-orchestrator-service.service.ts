import { Injectable } from '@nestjs/common';

@Injectable()
export class CardOrchestratorServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
