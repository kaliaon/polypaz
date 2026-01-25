/**
 * Placement Test Service
 * Handles placement test operations
 */

import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { PlacementTest, PlacementTestResult, ApiResponse } from '../types';

class PlacementTestService {
  /**
   * Get all available placement tests
   */
  async getTests(): Promise<ApiResponse<PlacementTest[]>> {
    return apiService.get<PlacementTest[]>(API_ENDPOINTS.PLACEMENT_TESTS.LIST);
  }

  /**
   * Get specific placement test by ID
   */
  async getTest(id: number): Promise<ApiResponse<PlacementTest>> {
    return apiService.get<PlacementTest>(API_ENDPOINTS.PLACEMENT_TESTS.DETAIL(id));
  }

  /**
   * Submit placement test answers
   */
  async submitTest(
    testId: number,
    answers: Record<number, string>
  ): Promise<ApiResponse<PlacementTestResult>> {
    return apiService.post<PlacementTestResult>(
      API_ENDPOINTS.PLACEMENT_TESTS.SUBMIT(testId),
      { answers }
    );
  }

  /**
   * Get user's placement test results
   */
  async getResults(): Promise<ApiResponse<PlacementTestResult[]>> {
    return apiService.get<PlacementTestResult[]>(API_ENDPOINTS.PLACEMENT_TESTS.RESULTS);
  }
}

export default new PlacementTestService();
