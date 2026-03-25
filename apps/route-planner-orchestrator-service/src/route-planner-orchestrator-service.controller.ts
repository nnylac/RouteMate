import { Controller, Get, Post, Patch, Query, Body } from '@nestjs/common';
import { RoutePlannerOrchestratorServiceService } from './route-planner-orchestrator-service.service';

@Controller('route-planner')
export class RoutePlannerOrchestratorServiceController {
  constructor(
    private readonly routePlannerOrchestratorServiceService: RoutePlannerOrchestratorServiceService,
  ) {}

  // Step 1: User enters origin + destination
  // Gets all route options enriched with arrival timings, saves to route-cache
  @Post('search')
  async searchRoutes(
    @Body('user_id') user_id: number,
    @Body('origin') origin: string,
    @Body('destination') destination: string,
  ) {
    return this.routePlannerOrchestratorServiceService.searchRoutes(
      user_id,
      origin,
      destination,
    );
  }

  // Step 2: User selects a route option — locks it in route-cache
  @Patch('select')
  async selectRoute(
    @Body('route_id') route_id: number,
    @Body('option_id') option_id: number,
  ) {
    return this.routePlannerOrchestratorServiceService.selectRoute(
      route_id,
      option_id,
    );
  }

  // Fetch saved routes for a user
  @Get('routes')
  async getRoutes(
    @Query('user_id') user_id: number,
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.routePlannerOrchestratorServiceService.getRoutes(
      user_id,
      origin,
      destination,
    );
  }
}