import { Controller, Get, Post, Patch, Query, Body } from '@nestjs/common';
import { RoutePlannerOrchestratorServiceService } from './route-planner-orchestrator-service.service';

@Controller('route-planner')
export class RoutePlannerOrchestratorServiceController {
  constructor(
    private readonly routePlannerOrchestratorServiceService: RoutePlannerOrchestratorServiceService,
  ) {}

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

  // New endpoint — simulate a line disruption
  @Post('disrupt')
  async handleDisruption(
    @Body('route_id') route_id: number,
    @Body('disrupted_line') disrupted_line: string,
  ) {
    return this.routePlannerOrchestratorServiceService.handleDisruption(
      route_id,
      disrupted_line,
    );
  }
}