/**
 * Task Service
 * Handles task and exercise operations
 */

import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { TaskTemplate, TaskAttempt, ApiResponse } from '../types';

interface TaskInstance {
  id: number;
  template: TaskTemplate;
  status: 'pending' | 'in_progress' | 'completed';
  attempts_count: number;
  best_attempt_correct: boolean | null;
}

interface SubmitTaskResponse {
  attempt: TaskAttempt;
  task_status: string;
}

class TaskService {
  /**
   * Get all tasks for a specific module
   */
  async getModuleTasks(moduleId: number): Promise<ApiResponse<TaskInstance[]>> {
    return apiService.get<TaskInstance[]>(API_ENDPOINTS.TASKS.LIST(moduleId));
  }

  /**
   * Get specific task details
   */
  async getTask(taskId: number): Promise<ApiResponse<TaskInstance>> {
    return apiService.get<TaskInstance>(API_ENDPOINTS.TASKS.DETAIL(taskId));
  }

  /**
   * Submit task answer
   */
  async submitTaskAttempt(
    taskId: number,
    userAnswer: string
  ): Promise<ApiResponse<SubmitTaskResponse>> {
    return apiService.post<SubmitTaskResponse>(API_ENDPOINTS.TASKS.ATTEMPT(taskId), {
      user_answer: userAnswer,
    });
  }

  /**
   * Get user's task attempt history
   */
  async getAttempts(): Promise<ApiResponse<TaskAttempt[]>> {
    return apiService.get<TaskAttempt[]>(API_ENDPOINTS.TASKS.ATTEMPTS);
  }
}

export default new TaskService();
