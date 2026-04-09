import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FareComparisonServiceModule } from './../src/fare-comparison-service.module';

describe('FareComparisonServiceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FareComparisonServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/fare/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/fare/health')
      .expect(200)
      .expect({
        status: 'ok',
        service: 'fare-comparison-service',
      });
  });
});
