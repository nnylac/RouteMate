import { Test, TestingModule } from '@nestjs/testing';
import { PaymentWrapperServiceController } from './payment-wrapper-service.controller';
import { PaymentWrapperServiceService } from './payment-wrapper-service.service';

describe('PaymentWrapperServiceController', () => {
  let paymentWrapperServiceController: PaymentWrapperServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentWrapperServiceController],
      providers: [PaymentWrapperServiceService],
    }).compile();

    paymentWrapperServiceController = app.get<PaymentWrapperServiceController>(PaymentWrapperServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(paymentWrapperServiceController.getHello()).toBe('Hello World!');
    });
  });
});
