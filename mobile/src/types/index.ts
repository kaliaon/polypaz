/**
 * Shared TypeScript types and interfaces
 */

// Language types
export type Language = 'kazakh' | 'russian' | 'english' | 'spanish';

// CEFR levels
export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Task types
export type TaskType = 'multiple_choice' | 'fill_blank' | 'translation';

// User Profile
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  target_language: Language;
  native_language: Language;
  current_cefr_level: CEFRLevel;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Placement Test types
export interface PlacementTestItem {
  id: number;
  item_type: TaskType;
  question_text: string;
  options?: string[];
  correct_answer: string;
  order: number;
}

export interface PlacementTest {
  id: number;
  language: Language;
  total_items: number;
  items: PlacementTestItem[];
}

export interface PlacementTestResult {
  id: number;
  score: number;
  estimated_cefr_level: CEFRLevel;
  completed_at: string;
}

// Roadmap types
export interface Module {
  id: number;
  title: string;
  description: string;
  objectives: string[];
  order: number;
  is_completed: boolean;
}

export interface Roadmap {
  id: number;
  language: Language;
  cefr_level: CEFRLevel;
  modules: Module[];
  generated_by_ai: boolean;
  created_at: string;
}

// Task types
export interface TaskTemplate {
  id: number;
  task_type: TaskType;
  content: {
    question: string;
    options?: string[];
    context?: string;
  };
  difficulty_level: number;
}

export interface TaskAttempt {
  id: number;
  user_answer: string;
  is_correct: boolean;
  feedback: {
    rule: string;
    example_contrast: string;
    explanation?: string;
  };
  xp_gained: number;
  attempted_at: string;
}

// Dialogue types
export interface DialogueScenario {
  id: number;
  title: string;
  language: Language;
  cefr_level: CEFRLevel;
  context_description: string;
  max_turns: number;
}

export interface DialogueTurn {
  id: number;
  turn_number: number;
  user_message: string;
  ai_response: string;
  corrections?: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  reformulation?: string;
  created_at: string;
}

export interface DialogueSession {
  id: number;
  scenario: DialogueScenario;
  status: 'active' | 'completed';
  turns: DialogueTurn[];
  started_at: string;
  ended_at?: string;
}

// Progress types
export interface ModuleProgress {
  module_id: number;
  module_title: string;
  tasks_attempted: number;
  tasks_completed: number;
  accuracy_percentage: number;
  last_activity_date: string;
}

export interface ProgressOverview {
  modules: ModuleProgress[];
  total_xp: number;
  current_streak_days: number;
  longest_streak_days: number;
  overall_accuracy: number;
}

// API Response types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
