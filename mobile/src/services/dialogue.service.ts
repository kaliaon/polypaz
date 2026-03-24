/**
 * Dialogue Service
 * Handles dialogue mode operations for conversational practice
 */

import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { DialogueScenario, DialogueSession, DialogueTurn, ApiResponse } from '../types';

interface StartSessionParams {
  scenario_id: number;
}

interface SendMessageParams {
  message: string;
}

class DialogueService {
  /**
   * Get all available dialogue scenarios
   */
  async getScenarios(): Promise<ApiResponse<DialogueScenario[]>> {
    return apiService.get<DialogueScenario[]>(API_ENDPOINTS.DIALOGUE.SCENARIOS);
  }

  /**
   * Start a new dialogue session
   */
  async startSession(params: StartSessionParams): Promise<ApiResponse<DialogueSession>> {
    return apiService.post<DialogueSession>(API_ENDPOINTS.DIALOGUE.START, params);
  }

  /**
   * Get dialogue session details and history
   */
  async getSession(sessionId: number): Promise<ApiResponse<DialogueSession>> {
    return apiService.get<DialogueSession>(API_ENDPOINTS.DIALOGUE.DETAIL(sessionId));
  }

  /**
   * Send a message in the dialogue session
   */
  async sendMessage(
    sessionId: number,
    params: SendMessageParams
  ): Promise<ApiResponse<DialogueTurn>> {
    return apiService.post<DialogueTurn>(API_ENDPOINTS.DIALOGUE.MESSAGE(sessionId), params);
  }

  /**
   * End a dialogue session
   */
  async endSession(sessionId: number): Promise<ApiResponse<DialogueSession>> {
    return apiService.post<DialogueSession>(API_ENDPOINTS.DIALOGUE.END(sessionId));
  }
}

export default new DialogueService();
