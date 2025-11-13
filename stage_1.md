# Stage 1 - Super MVP Implementation Plan

## Overview
This document breaks down Stage 1 (Super MVP) into actionable implementation steps. The goal is to deliver a functional, end-to-end learning flow demonstrating the system's core value: placement test → personalized roadmap → interactive tasks → AI feedback → progress tracking.

**Current State:**
- Django backend with basic authentication (JWT)
- React Native frontend needs to be set up
- No existing language learning features yet

---

## Phase 1: Project Setup & Infrastructure ✅ COMPLETE

### Step 1.1: React Native Project Initialization ✅
- [x] Initialize new React Native project using Expo or React Native CLI
- [x] Set up project structure (screens, components, services, utils)
- [x] Configure TypeScript for type safety
- [x] Set up navigation (React Navigation)
- [x] Configure environment variables for API endpoints

### Step 1.2: Backend Configuration Updates ✅
- [x] Add environment variable management (django-environ)
- [x] Configure PostgreSQL database (with SQLite fallback for dev)
- [x] Set up Redis for caching (with local memory fallback)
- [x] Update CORS settings for React Native mobile app
- [x] Add API documentation setup (drf-spectacular with Swagger UI)

### Step 1.3: Gemini API Integration Setup ✅
- [x] Create Gemini API service wrapper in Django
- [x] Implement API key management via environment variables
- [x] Create base prompt templates structure (roadmap, feedback, dialogue)
- [x] Implement error handling and retry logic for API calls
- [x] Add request/response logging for debugging

---

## Phase 2: Data Models & Database Schema

### Step 2.1: User Profile & Language Preferences ✅
**Models created:**
- [x] `UserProfile` - Extended user model with:
  - `target_language` (Kazakh, Russian, English, Spanish)
  - `native_language`
  - `learning_preferences` (JSON field)
  - `current_cefr_level` (A0, A1, A2, B1, B2, C1, C2)
  - `created_at`, `updated_at`
  - Auto-created via signals when User is created
  - Admin interface configured
  - Serializers updated
  - **Migration applied**

### Step 2.2: Placement Test Models ✅
**Models created:**
- [x] `PlacementTest` - Test definitions:
  - `language` (target language)
  - `total_items` (10-12 questions)
  - `is_active` (boolean)
  - `created_at`, `updated_at`

- [x] `PlacementTestItem` - Individual test questions:
  - `test` (ForeignKey to PlacementTest)
  - `item_type` (multiple_choice, cloze, translation)
  - `question_text` (JSON for multilingual)
  - `correct_answer`
  - `options` (JSON for multiple choice)
  - `difficulty_weight`
  - `order`

- [x] `PlacementTestResult` - User test results:
  - `user` (ForeignKey to User)
  - `test` (ForeignKey to PlacementTest)
  - `score`, `max_score`, `percentage` (decimals)
  - `estimated_cefr_level`
  - `answers` (JSON storing user responses)
  - `completed_at`
  - Auto-updates user profile CEFR level
  - Admin interface configured
  - **Migrations applied**

### Step 2.3: Roadmap Models ✅
**Models created:**
- [x] `Roadmap` - Learning path structure:
  - `user` (ForeignKey to User)
  - `language`
  - `cefr_level`
  - `generated_by_ai` (boolean)
  - `roadmap_data` (JSON containing modules)
  - `created_at`, `updated_at`
  - `is_active` (auto-deactivates other roadmaps)
  - Admin interface configured
  - **Migrations applied**

- [x] `Module` - Individual learning modules:
  - `roadmap` (ForeignKey to Roadmap)
  - `title`
  - `description`
  - `objectives` (JSON array)
  - `order`
  - `checkpoint_criteria` (JSON)
  - `is_completed`
  - `completed_at`
  - `check_completion()` method
  - Admin interface with custom action
  - **Migrations applied**

### Step 2.4: Task & Exercise Models ✅
**Models created:**
- [x] `TaskTemplate` - Reusable task definitions:
  - `module` (ForeignKey to Module)
  - `task_type` (multiple_choice, fill_blank, translation, speaking, listening)
  - `content` (JSON with question, options, etc.)
  - `correct_answer`
  - `rule_explanation`
  - `example_contrast`
  - `difficulty_level` (1-5)
  - `created_by_ai` (boolean)
  - `order`
  - Admin interface configured
  - **Migrations applied**

- [x] `TaskInstance` - User-specific task instances:
  - `user` (ForeignKey to User)
  - `template` (ForeignKey to TaskTemplate)
  - `status` (pending, in_progress, completed)
  - `attempts_count` (auto-updated)
  - `best_attempt_correct`
  - `created_at`, `updated_at`
  - Admin interface configured
  - **Migrations applied**

- [x] `TaskAttempt` - User answers and results:
  - `task_instance` (ForeignKey to TaskInstance)
  - `user_answer`
  - `is_correct` (boolean)
  - `feedback` (JSON with rule, contrast, etc.)
  - `xp_gained` (auto-calculated: 10 × difficulty_level)
  - `attempted_at`
  - Auto-updates TaskInstance and GamificationProfile
  - Admin interface configured (read-only)
  - **Migrations applied**

### Step 2.5: Dialogue Models (Prototype) ✅
**Models created:**
- [x] `DialogueScenario` - Conversation templates:
  - `title` (e.g., "At a Café")
  - `language`
  - `cefr_level`
  - `context_description`
  - `max_turns` (default 10 for MVP)
  - `created_at`, `updated_at`
  - Admin interface configured
  - **Migrations applied**

- [x] `DialogueSession` - User conversation sessions:
  - `user` (ForeignKey to User)
  - `scenario` (ForeignKey to DialogueScenario)
  - `status` (active, completed)
  - `turn_count` (auto-updated)
  - `started_at`, `ended_at`
  - `can_add_turn()` and `complete_session()` methods
  - Admin interface with inline turns
  - **Migrations applied**

- [x] `DialogueTurn` - Individual messages:
  - `session` (ForeignKey to DialogueSession)
  - `turn_number`
  - `user_message`
  - `ai_response`
  - `corrections` (JSON array with inline corrections)
  - `reformulation`
  - `created_at`
  - Auto-updates session turn_count and completion
  - Admin interface configured (read-only)
  - **Migrations applied**

### Step 2.6: Progress & Gamification Models ✅
**Models created:**
- [x] `ProgressSnapshot` - User progress metrics:
  - `user` (ForeignKey to User)
  - `module` (ForeignKey to Module)
  - `tasks_attempted`
  - `tasks_completed`
  - `accuracy_percentage` (decimal)
  - `last_activity_date`
  - `snapshot_date` (auto-updated)
  - `calculate_accuracy()` method
  - Admin interface with recalculate action
  - **Migrations applied**

- [x] `GamificationProfile` - XP and streaks:
  - `user` (OneToOne to User)
  - `total_xp`
  - `current_streak_days`
  - `longest_streak_days`
  - `last_activity_date`
  - `xp_history` (JSON - date: xp_amount)
  - `created_at`, `updated_at`
  - `update_streak()` and `add_xp()` methods
  - Admin interface with reset streaks action
  - **Migrations applied**

### Step 2.7: Run Migrations ✅
- [x] Create all migrations (5 migration files created)
- [x] Run migrations on development database
- [x] Create admin interfaces for all models (13 models total)
- [ ] Seed initial data (placement tests, basic scenarios) - TODO for Phase 5

---

## Phase 3: Backend API Development

### Step 3.1: Authentication Endpoints ✅
- [x] Verify JWT token generation works
- [x] Test login/register endpoints
- [x] Token refresh endpoint exists and works
- [x] User profile endpoint works

### Step 3.2: Placement Test API ✅
**Endpoints created:**
- [x] `GET /api/placement-tests/` - List available tests by language
- [x] `GET /api/placement-tests/{id}/` - Get specific test details
- [x] `POST /api/placement-tests/{id}/submit/` - Submit test answers
- [x] `GET /api/placement-tests/results/` - Get user's test results

**Business Logic:**
- [x] Implement CEFR level calculation algorithm
- [x] Create scoring system based on item difficulty weights
- [x] Add answer validation
- [x] Create seed data for English and Kazakh tests

### Step 3.3: Roadmap Generation API ✅
**Endpoints created:**
- [x] `POST /api/roadmaps/generate/` - Generate AI roadmap based on test result
- [x] `GET /api/roadmaps/current/` - Get user's active roadmap
- [x] `GET /api/roadmaps/{id}/modules/` - List roadmap modules

**Gemini Integration:**
- [x] Create prompt template for roadmap generation
- [x] Implement JSON schema validation for AI response
- [x] Create fallback static roadmap templates (English A0/A1/B1, Kazakh A0/A1)
- [x] Add roadmap generation with automatic fallback
- [x] Implement transaction-safe module creation
- [x] Auto-deactivate previous roadmaps (one active per user)

### Step 3.4: Task Management API ✅
**Endpoints created:**
- [x] `GET /api/modules/{id}/tasks/` - List tasks for a module
- [x] `GET /api/tasks/{id}/` - Get specific task details
- [x] `POST /api/tasks/{id}/attempt/` - Submit task answer
- [x] `GET /api/tasks/attempts/` - Get user's task attempts history

**Business Logic:**
- [x] Implement answer evaluation logic (multiple_choice, fill_blank, translation)
- [x] Create AI feedback generation with fallback (rule + example contrast + tip)
- [x] Add XP calculation and award logic (base_xp × difficulty_level)
- [x] Implement streak tracking
- [x] Create progress snapshot updates
- [x] Add fuzzy matching for translations (80% similarity)
- [x] Create seed data with 16 sample tasks

### Step 3.5: Dialogue Mode API
**Endpoints to create:**
- [ ] `GET /api/dialogue/scenarios/` - List available scenarios
- [ ] `POST /api/dialogue/sessions/start/` - Start dialogue session
- [ ] `POST /api/dialogue/sessions/{id}/message/` - Send user message
- [ ] `GET /api/dialogue/sessions/{id}/` - Get session history
- [ ] `POST /api/dialogue/sessions/{id}/end/` - End session

**Gemini Integration:**
- [ ] Create dialogue system prompt with scenario context
- [ ] Implement inline correction detection
- [ ] Add reformulation generation
- [ ] Enforce 10-turn limit

### Step 3.6: Progress & Statistics API
**Endpoints to create:**
- [ ] `GET /api/progress/overview/` - Get overall progress summary
- [ ] `GET /api/progress/modules/{id}/` - Get module-specific progress
- [ ] `GET /api/gamification/profile/` - Get XP and streak data
- [ ] `POST /api/gamification/daily-check-in/` - Record daily activity

**Business Logic:**
- [ ] Calculate accuracy percentages
- [ ] Update progress snapshots after each task
- [ ] Manage daily streak logic
- [ ] Award XP based on task completion

---

## Phase 4: Frontend Development (React Native)

### Step 4.1: Core Services Setup
- [ ] Create API client service (axios/fetch wrapper)
- [ ] Implement authentication service with token management
- [ ] Create secure storage for tokens (AsyncStorage + encryption)
- [ ] Set up global state management (Context API/Redux/Zustand)
- [ ] Implement error handling and toast notifications

### Step 4.2: Authentication Screens
- [ ] Login screen with email/password
- [ ] Registration screen
- [ ] Password validation
- [ ] Error handling and loading states
- [ ] Token persistence on successful login

### Step 4.3: Onboarding Flow
- [ ] Welcome screen explaining the app
- [ ] Language selection screen (target language)
- [ ] Native language selection
- [ ] Learning preferences screen (optional)
- [ ] Navigate to placement test

### Step 4.4: Placement Test Screens
- [ ] Test introduction screen (explanation)
- [ ] Question display component (supports all 3 types):
  - Multiple choice renderer
  - Cloze/fill-in-the-blank renderer
  - Translation input renderer
- [ ] Progress indicator (X of 12 questions)
- [ ] Navigation (Next/Previous buttons)
- [ ] Test submission confirmation
- [ ] Results screen with CEFR level

### Step 4.5: Roadmap Display
- [ ] Roadmap overview screen showing all modules
- [ ] Module card component with:
  - Title and description
  - Progress indicator
  - Completion status
  - Lock/unlock state
- [ ] Module detail screen showing objectives
- [ ] Navigation to tasks

### Step 4.6: Task/Exercise Screens
- [ ] Task list screen (per module)
- [ ] Task detail screen with question display
- [ ] Answer input components (by task type)
- [ ] Submit button with validation
- [ ] Feedback display screen showing:
  - Correctness indicator
  - Rule explanation
  - Example contrast
  - XP gained
- [ ] Continue button to next task

### Step 4.7: Dialogue Mode Screens
- [ ] Scenario selection screen
- [ ] Scenario introduction screen
- [ ] Chat interface:
  - Message input field
  - Send button
  - Message history display
  - Turn counter (X/10)
- [ ] Correction display (inline highlighting)
- [ ] Reformulation display
- [ ] Session completion screen

### Step 4.8: Progress Dashboard
- [ ] Statistics overview screen:
  - Total XP
  - Current streak
  - Modules completed
  - Overall accuracy
- [ ] Module-wise progress breakdown
- [ ] Last activity display
- [ ] XP history visualization (simple chart)

### Step 4.9: Navigation & Layout
- [ ] Bottom tab navigation with:
  - Home/Roadmap tab
  - Practice/Tasks tab
  - Dialogue tab
  - Progress tab
- [ ] Header with user profile access
- [ ] Drawer/menu with logout option

---

## Phase 5: AI Integration & Content Generation

### Step 5.1: Placement Test Content
- [ ] Create 10-12 test items per language (Kazakh, Russian, English, Spanish)
- [ ] Mix of multiple choice, cloze, and translation
- [ ] Assign difficulty weights
- [ ] Test CEFR calculation algorithm with sample data

### Step 5.2: Roadmap Prompt Engineering
- [ ] Design Gemini prompt for roadmap generation
- [ ] Define JSON schema for roadmap output
- [ ] Test with different CEFR levels
- [ ] Create fallback static roadmaps (3 modules per language)
- [ ] Implement schema validation

### Step 5.3: Task Generation
- [ ] Create prompt templates for task generation by type
- [ ] Generate initial task templates for first modules
- [ ] Store in database with AI flag
- [ ] Test answer evaluation logic

### Step 5.4: Feedback Generation
- [ ] Design prompt for rule explanation generation
- [ ] Test example contrast generation
- [ ] Ensure concise, learner-friendly output
- [ ] Add caching for repeated errors

### Step 5.5: Dialogue System Prompts
- [ ] Create "At a Café" scenario prompt
- [ ] Test AI responses for naturalness
- [ ] Test inline correction detection
- [ ] Test reformulation quality
- [ ] Ensure 10-turn limit enforcement

---

## Phase 6: Testing & Quality Assurance

### Step 6.1: Backend Testing
- [ ] Write unit tests for models
- [ ] Write unit tests for API endpoints
- [ ] Test CEFR calculation algorithm
- [ ] Test XP and streak logic
- [ ] Test Gemini API integration with mocks
- [ ] Integration tests for complete user flows

### Step 6.2: Frontend Testing
- [ ] Test authentication flow (login/register/logout)
- [ ] Test placement test flow end-to-end
- [ ] Test roadmap generation and display
- [ ] Test task submission and feedback
- [ ] Test dialogue mode
- [ ] Test progress tracking updates

### Step 6.3: Performance Testing
- [ ] Verify API response times < 2 seconds (non-AI)
- [ ] Test AI response times (acceptable for MVP)
- [ ] Test app performance on iOS and Android
- [ ] Check memory usage and optimize

### Step 6.4: User Flow Testing
- [ ] Complete onboarding as new user
- [ ] Take placement test → get roadmap
- [ ] Complete tasks → receive feedback
- [ ] Check progress updates
- [ ] Try dialogue mode
- [ ] Verify gamification (XP, streaks)

---

## Phase 7: Polish & Deployment Preparation

### Step 7.1: Error Handling & Edge Cases
- [ ] Handle network errors gracefully
- [ ] Handle AI API failures (fallback logic)
- [ ] Handle invalid schema responses from AI
- [ ] Handle empty states (no tasks, no progress)
- [ ] Handle concurrent access issues

### Step 7.2: UI/UX Polish
- [ ] Consistent styling and theming
- [ ] Loading states and skeletons
- [ ] Error messages user-friendly
- [ ] Animations and transitions
- [ ] Responsive layouts for different screen sizes

### Step 7.3: Documentation
- [ ] API documentation (Swagger/Postman)
- [ ] Setup instructions (README)
- [ ] Environment variable documentation
- [ ] Deployment guide
- [ ] User guide (basic usage)

### Step 7.4: Deployment Setup
- [ ] Set up PostgreSQL database (production)
- [ ] Set up Redis instance
- [ ] Configure environment variables
- [ ] Set up backend hosting (Heroku/DigitalOcean/AWS)
- [ ] Set up mobile app for testing (Expo/TestFlight)
- [ ] Configure logging and monitoring

---

## Success Criteria for Stage 1

The Stage 1 MVP is complete when:

1. ✅ A new user can register and log in
2. ✅ User can take a placement test (10-12 questions) and receive CEFR level
3. ✅ AI generates a personalized 3-module roadmap OR fallback static roadmap loads
4. ✅ User can see and access tasks within modules
5. ✅ User can complete tasks and receive immediate AI-powered feedback (correctness + rule + example)
6. ✅ User can start a dialogue session ("At a Café") with 10-turn limit
7. ✅ AI provides inline corrections and reformulations in dialogue
8. ✅ Progress dashboard shows:
   - Module accuracy percentages
   - Tasks attempted and completed
   - Last activity date
   - Total XP
   - Current daily streak
9. ✅ XP is awarded per completed task
10. ✅ Daily streak counter increments with activity
11. ✅ API response time < 2 seconds for non-AI endpoints
12. ✅ AI schema validation works with fallback to static content

---

## Estimated Timeline

- **Phase 1 (Setup):** 2-3 days
- **Phase 2 (Models):** 3-4 days
- **Phase 3 (Backend API):** 5-7 days
- **Phase 4 (Frontend):** 8-10 days
- **Phase 5 (AI Integration):** 4-5 days
- **Phase 6 (Testing):** 3-4 days
- **Phase 7 (Polish):** 2-3 days

**Total: 27-36 days (approximately 5-7 weeks)**

---

## Next Steps

1. Review and approve this implementation plan
2. Set up development environment (PostgreSQL, Redis, React Native)
3. Begin with Phase 1: Project Setup
4. Work through phases sequentially while maintaining working software at each step
5. Regular testing and iteration throughout development

---

## Notes

- Prioritize working software over perfect code
- Test each phase before moving to next
- Keep AI prompts simple and iterative
- Focus on core user flow first, polish later
- Document decisions and challenges as you go
