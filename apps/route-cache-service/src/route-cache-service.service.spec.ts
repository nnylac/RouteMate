import { BadRequestException } from '@nestjs/common';
import { RouteCacheService } from './route-cache-service.service';

describe('RouteCacheService', () => {
  let service: RouteCacheService;

  const routeCacheModel = {
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RouteCacheService(routeCacheModel as any);
  });

  describe('saveRouteCache', () => {
    it('upserts by user_id and route_id', async () => {
      const payload = {
        route_id: 321,
        user_id: 99,
        origin_label: 'SMU',
        destination_label: 'Changi Airport',
      };

      routeCacheModel.findOneAndUpdate.mockResolvedValue(payload);

      const result = await service.saveRouteCache(payload as any);

      expect(result).toEqual(payload);
      expect(routeCacheModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user_id: 99, route_id: 321 },
        payload,
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
        },
      );
    });

    it('rejects requests without user_id or route_id', async () => {
      await expect(service.saveRouteCache({ route_id: 321 } as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(service.saveRouteCache({ user_id: 99 } as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(routeCacheModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});
