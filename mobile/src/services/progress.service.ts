/**
 * Progress Service
 * Handles progress tracking and gamification
 */

import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { ProgressOverview, ModuleProgress, ApiResponse } from '../types';

interface GamificationProfile {
  total_xp: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string;
  xp_history: Record<string, number>;
}

interface DailyCheckInResponse {
  streak_updated: boolean;
  current_streak_days: number;
  xp_gained: number;
}

class ProgressService {
  /**
   * Get overall progress overview
   */
  async getProgressOverview(): Promise<ApiResponse<ProgressOverview>> {
    return apiService.get<ProgressOverview>(API_ENDPOINTS.PROGRESS.OVERVIEW);
  }

  /**
   * Get progress for a specific module
   */
  async getModuleProgress(moduleId: number): Promise<ApiResponse<ModuleProgress>> {
    return apiService.get<ModuleProgress>(API_ENDPOINTS.PROGRESS.MODULE(moduleId));
  }

  /**
   * Get gamification profile (XP, streaks, etc.)
   */
  async getGamificationProfile(): Promise<ApiResponse<GamificationProfile>> {
    return apiService.get<GamificationProfile>(API_ENDPOINTS.PROGRESS.GAMIFICATION);
  }

  /**
   * Record daily check-in to maintain streak
   */
  async dailyCheckIn(): Promise<ApiResponse<DailyCheckInResponse>> {
    return apiService.post<DailyCheckInResponse>(API_ENDPOINTS.PROGRESS.DAILY_CHECKIN);
  }
}

export default new ProgressService();
