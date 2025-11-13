/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// Default to localhost for development
// This should be overridden by environment variables in production
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    REFRESH: '/api/auth/token/refresh/',
    LOGOUT: '/api/auth/logout/',
    PROFILE: '/api/auth/profile/',
  },

  // Placement test endpoints
  PLACEMENT_TESTS: {
    LIST: '/api/placement-tests/',
    DETAIL: (id: number) => `/api/placement-tests/${id}/`,
    START: (id: number) => `/api/placement-tests/${id}/start/`,
    SUBMIT: (id: number) => `/api/placement-tests/${id}/submit/`,
    RESULTS: '/api/placement-tests/results/',
  },

  // Roadmap endpoints
  ROADMAPS: {
    GENERATE: '/api/roadmaps/generate/',
    CURRENT: '/api/roadmaps/current/',
    MODULES: (id: number) => `/api/roadmaps/${id}/modules/`,
  },

  // Task endpoints
  TASKS: {
    LIST: (moduleId: number) => `/api/modules/${moduleId}/tasks/`,
    DETAIL: (id: number) => `/api/tasks/${id}/`,
    ATTEMPT: (id: number) => `/api/tasks/${id}/attempt/`,
    ATTEMPTS: '/api/tasks/attempts/',
  },

  // Dialogue endpoints
  DIALOGUE: {
    SCENARIOS: '/api/dialogue/scenarios/',
    START: '/api/dialogue/sessions/start/',
    MESSAGE: (sessionId: number) => `/api/dialogue/sessions/${sessionId}/message/`,
    DETAIL: (sessionId: number) => `/api/dialogue/sessions/${sessionId}/`,
    END: (sessionId: number) => `/api/dialogue/sessions/${sessionId}/end/`,
  },

  // Progress endpoints
  PROGRESS: {
    OVERVIEW: '/api/progress/overview/',
    MODULE: (moduleId: number) => `/api/progress/modules/${moduleId}/`,
    GAMIFICATION: '/api/gamification/profile/',
    DAILY_CHECKIN: '/api/gamification/daily-check-in/',
  },
};

export const API_TIMEOUT = 30000; // 30 seconds
