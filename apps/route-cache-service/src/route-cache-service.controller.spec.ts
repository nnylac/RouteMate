import { Test, TestingModule } from '@nestjs/testing';
import { RouteCacheServiceController } from './route-cache-service.controller';
import { RouteCacheService } from './route-cache-service.service';
import { RouteSearchStatus } from './enums/route-cache.enums';

describe('RouteCacheServiceController', () => {
  let controller: RouteCacheServiceController;

  const mockRouteCacheService = {
    findCachedRoute: jest.fn(),
    saveRouteCache: jest.fn(),
    deleteRouteCache: jest.fn(),
    findRouteById: jest.fn(),
    selectRouteOption: jest.fn(),
    getRoutesByUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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

  describe('getCachedRoute', () => {
    it('should return a cached route', async () => {
      const query = {
        user_id: 1001,
        origin: 'SMU',
        destination: 'Jurong East',
      };

      const responseBody = {
        route_id: 1,
        user_id: 1001,
        origin_label: 'SMU',
        destination_label: 'Jurong East',
        route_payload_json: { duration: 1200 },
        selected_option_id: null,
        is_locked: false,
        search_status: RouteSearchStatus.GENERATED,
        route_options: [],
      };

      mockRouteCacheService.findCachedRoute.mockResolvedValue(responseBody);

      const result = await controller.getCachedRoute(query);

      expect(result).toEqual(responseBody);
      expect(mockRouteCacheService.findCachedRoute).toHaveBeenCalledWith(
        1001,
        'SMU',
        'Jurong East',
      );
    });
  });

  describe('getRouteById', () => {
    it('should return a route by route id', async () => {
      const query = { route_id: 1 };

      const responseBody = {
        route_id: 1,
        user_id: 1001,
        origin_label: 'SMU',
        destination_label: 'Jurong East',
        route_payload_json: { duration: 1200 },
        selected_option_id: null,
        is_locked: false,
        search_status: RouteSearchStatus.GENERATED,
        route_options: [],
      };

      mockRouteCacheService.findRouteById.mockResolvedValue(responseBody);

      const result = await controller.getRouteById(query);

      expect(result).toEqual(responseBody);
      expect(mockRouteCacheService.findRouteById).toHaveBeenCalledWith(1);
    });
  });

  describe('saveRouteCache', () => {
    it('should save a route cache', async () => {
      const body = {
        route_id: 1,
        user_id: 1001,
        origin_label: 'SMU',
        destination_label: 'Jurong East',
        route_payload_json: { duration: 1200 },
        is_locked: false,
        search_status: RouteSearchStatus.GENERATED,
        route_options: [],
      };

      mockRouteCacheService.saveRouteCache.mockResolvedValue(body);

      const result = await controller.saveRouteCache(body);

      expect(result).toEqual(body);
      expect(mockRouteCacheService.saveRouteCache).toHaveBeenCalledWith(body);
    });
  });

  describe('deleteRouteCache', () => {
    it('should delete a cached route', async () => {
      const query = {
        user_id: 1001,
        origin: 'SMU',
        destination: 'Jurong East',
      };

      const responseBody = {
        acknowledged: true,
        deletedCount: 1,
      };

      mockRouteCacheService.deleteRouteCache.mockResolvedValue(responseBody);

      const result = await controller.deleteRouteCache(query);

      expect(result).toEqual(responseBody);
      expect(mockRouteCacheService.deleteRouteCache).toHaveBeenCalledWith(
        1001,
        'SMU',
        'Jurong East',
      );
    });
  });

  describe('selectRouteOption', () => {
    it('should select a route option', async () => {
      const query = {
        route_id: 1,
        option_id: 2,
      };

      const responseBody = {
        route_id: 1,
        user_id: 1001,
        origin_label: 'SMU',
        destination_label: 'Jurong East',
        route_payload_json: { duration: 1200 },
        selected_option_id: 2,
        is_locked: true,
        search_status: RouteSearchStatus.SELECTED,
        route_options: [
          {
            option_id: 1,
            summary: 'Option 1',
            total_duration_mins: 40,
            total_distance_km: 15,
            transfer_count: 1,
            is_public_transport: true,
            segments: [],
          },
          {
            option_id: 2,
            summary: 'Option 2',
            total_duration_mins: 35,
            total_distance_km: 16,
            transfer_count: 0,
            is_public_transport: true,
            segments: [],
          },
        ],
      };

      mockRouteCacheService.selectRouteOption.mockResolvedValue(responseBody);

      const result = await controller.selectRouteOption(query);

      expect(result).toEqual(responseBody);
      expect(mockRouteCacheService.selectRouteOption).toHaveBeenCalledWith(
        1,
        2,
      );
    });
  });

  describe('getUserRouteHistory', () => {
    it('should return recent routes for a user', async () => {
      const responseBody = [
        {
          route_id: 2,
          user_id: 1001,
          origin_label: 'SMU',
          destination_label: 'HarbourFront',
        },
        {
          route_id: 1,
          user_id: 1001,
          origin_label: 'SMU',
          destination_label: 'Jurong East',
        },
      ];

      mockRouteCacheService.getRoutesByUser.mockResolvedValue(responseBody);

      const result = await controller.getUserRouteHistory('1001' as any);

      expect(result).toEqual(responseBody);
      expect(mockRouteCacheService.getRoutesByUser).toHaveBeenCalledWith(1001);
    });
  });
});
