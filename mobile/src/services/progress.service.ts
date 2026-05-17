/**
 * Progress Service
 * Handles progress tracking and gamification
 */

import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { ProgressOverview, ModuleProgress, ApiResponse, AchievementsResponse } from '../types';

interface GamificationProfile {
  username: string;
  cefr_level: string;
  total_xp: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string;
  xp_history?: Record<string, number>;
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
   * Get the global XP leaderboard
   */
  async getLeaderboard(): Promise<ApiResponse<GamificationProfile[]>> {
    return apiService.get<GamificationProfile[]>(API_ENDPOINTS.PROGRESS.LEADERBOARD);
  }

  /**
   * Get the friends-only XP leaderboard (includes the current user)
   */
  async getFriendsLeaderboard(): Promise<ApiResponse<GamificationProfile[]>> {
    return apiService.get<GamificationProfile[]>(API_ENDPOINTS.PROGRESS.LEADERBOARD_FRIENDS);
  }

  /**
   * Record daily check-in to maintain streak
   */
  async dailyCheckIn(): Promise<ApiResponse<DailyCheckInResponse>> {
    return apiService.post<DailyCheckInResponse>(API_ENDPOINTS.PROGRESS.DAILY_CHECKIN);
  }

  /**
   * Get the user's achievement catalog with earned/unearned state
   */
  async getAchievements(): Promise<ApiResponse<AchievementsResponse>> {
    return apiService.get<AchievementsResponse>(API_ENDPOINTS.PROGRESS.ACHIEVEMENTS);
  }
}

export default new ProgressService();
