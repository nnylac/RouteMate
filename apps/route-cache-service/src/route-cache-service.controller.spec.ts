import { Test, TestingModule } from '@nestjs/testing';
import { RouteCacheServiceController } from './route-cache-service.controller';
import { RouteCacheService } from './route-cache-service.service';

describe('RouteCacheServiceController', () => {
  let controller: RouteCacheServiceController;

  const mockRouteCacheService = {
    findCachedRoute: jest.fn(),
    saveRouteCache: jest.fn(),
    deleteRouteCache: jest.fn(),
    findRouteById: jest.fn(),
    selectRouteOption: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteCacheServiceController],
      providers: [
        {
          provide: RouteCacheService,
          useValue: mockRouteCacheService,
        },
      ],
    }).compile();

    controller = module.get<RouteCacheServiceController>(
      RouteCacheServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a cached route', async () => {
    const responseBody = {
      route_id: 1,
      user_id: 1001,
      origin_label: 'SMU',
      destination_label: 'Jurong East',
      route_payload_json: { duration: 1200 },
      selected_option_id: null,
      is_locked: false,
      search_status: 'GENERATED',
      route_options: [],
    };

    mockRouteCacheService.findCachedRoute.mockResolvedValue(responseBody);

    const result = await controller.getCachedRoute(1001, 'SMU', 'Jurong East');

    expect(result).toEqual(responseBody);
    expect(mockRouteCacheService.findCachedRoute).toHaveBeenCalledWith(
      1001,
      'SMU',
      'Jurong East',
    );
  });
});
