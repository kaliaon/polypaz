/**
 * Roadmap Service
 * Handles learning roadmap operations
 */

import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { Roadmap, Module, ApiResponse } from '../types';

interface GenerateRoadmapParams {
  placement_test_result_id?: number;
  language?: string;
  cefr_level?: string;
}

class RoadmapService {
  /**
   * Generate a new roadmap based on placement test or manual selection
   */
  async generateRoadmap(params: GenerateRoadmapParams): Promise<ApiResponse<Roadmap>> {
    return apiService.post<Roadmap>(API_ENDPOINTS.ROADMAPS.GENERATE, params);
  }

  /**
   * Get current active roadmap for the user
   */
  async getCurrentRoadmap(): Promise<ApiResponse<Roadmap>> {
    return apiService.get<Roadmap>(API_ENDPOINTS.ROADMAPS.CURRENT);
  }

  /**
   * Get modules for a specific roadmap
   */
  async getRoadmapModules(roadmapId: number): Promise<ApiResponse<Module[]>> {
    return apiService.get<Module[]>(API_ENDPOINTS.ROADMAPS.MODULES(roadmapId));
  }
}

export default new RoadmapService();
