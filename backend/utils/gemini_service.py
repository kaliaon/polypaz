"""
Gemini AI Service
Handles all interactions with Google's Gemini API
"""

import json
import logging
from typing import Dict, Any, Optional, List
from django.conf import settings
from django.core.cache import cache
from google import genai

logger = logging.getLogger(__name__)

MODEL_NAME = 'gemini-2.5-flash'


class GeminiService:
    """
    Service class for interacting with Google Gemini API
    """

    def __init__(self):
        """Initialize Gemini service with API key"""
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            logger.warning("Gemini API key not configured")
            self.client = None

    def _get_cache_key(self, prompt: str, params: Optional[Dict] = None) -> str:
        """Generate cache key for a prompt"""
        cache_data = f"{prompt}:{json.dumps(params or {})}"
        return f"gemini:{hash(cache_data)}"

    def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        cache_timeout: int = 3600,
        use_cache: bool = True,
        **kwargs
    ) -> Optional[str]:
        """
        Generate content using Gemini API

        Args:
            prompt: The prompt to send to Gemini
            system_instruction: Optional system instruction for context
            cache_timeout: Cache timeout in seconds (default: 1 hour)
            use_cache: Whether to use caching (default: True)
            **kwargs: Additional parameters for generation

        Returns:
            Generated text or None if error
        """
        if not self.client:
            logger.error("Gemini client not initialized")
            return None

        # Check cache first
        cache_key = self._get_cache_key(prompt, kwargs)
        if use_cache:
            cached_response = cache.get(cache_key)
            if cached_response:
                logger.info(f"Cache hit for prompt: {prompt[:50]}...")
                return cached_response

        try:
            config = {}
            if system_instruction:
                config['system_instruction'] = system_instruction

            response = self.client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=config if config else None,
            )

            # Extract text from response
            result_text = response.text

            # Cache the response
            if use_cache and result_text:
                cache.set(cache_key, result_text, cache_timeout)

            logger.info(f"Successfully generated content for prompt: {prompt[:50]}...")
            return result_text

        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            return None

    def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        schema: Optional[Dict] = None,
        cache_timeout: int = 3600,
        use_cache: bool = True,
    ) -> Optional[Dict]:
        """
        Generate JSON response using Gemini API

        Args:
            prompt: The prompt to send to Gemini
            system_instruction: Optional system instruction for context
            schema: Optional JSON schema for validation
            cache_timeout: Cache timeout in seconds
            use_cache: Whether to use caching

        Returns:
            Parsed JSON dict or None if error
        """
        # Add JSON instruction to prompt
        json_prompt = f"{prompt}\n\nPlease respond with valid JSON only."

        response_text = self.generate_content(
            json_prompt,
            system_instruction=system_instruction,
            cache_timeout=cache_timeout,
            use_cache=use_cache,
        )

        if not response_text:
            return None

        try:
            # Extract JSON from response (handle markdown code blocks)
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]

            # Parse JSON
            result = json.loads(response_text.strip())

            # Validate against schema if provided
            if schema:
                # Basic schema validation (can be extended)
                if not self._validate_schema(result, schema):
                    logger.error("Response does not match expected schema")
                    return None

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            logger.error(f"Response text: {response_text}")
            return None

    def _validate_schema(self, data: Dict, schema: Dict) -> bool:
        """
        Basic schema validation

        Args:
            data: Data to validate
            schema: Schema definition

        Returns:
            True if valid, False otherwise
        """
        # Simple validation - check required keys exist
        if 'required' in schema:
            for key in schema['required']:
                if key not in data:
                    logger.error(f"Missing required key: {key}")
                    return False
        return True

    def generate_roadmap(
        self,
        language: str,
        cefr_level: str,
        modules_count: int = 3
    ) -> Optional[Dict]:
        """
        Generate a learning roadmap for a language and CEFR level

        Args:
            language: Target language
            cefr_level: CEFR level (A0, A1, A2, etc.)
            modules_count: Number of modules to generate

        Returns:
            Roadmap dict or None if error
        """
        system_instruction = (
            "You are an expert language learning curriculum designer. "
            "Create structured, pedagogically sound learning roadmaps."
        )

        prompt = f"""
Create a {modules_count}-module learning roadmap for {language} at {cefr_level} level.

Each module should include:
- title: Clear, descriptive module title
- description: Brief description of what learners will achieve
- objectives: List of 3-5 specific learning objectives
- checkpoint_criteria: Success criteria for completing the module

Return the response as a JSON object with this structure:
{{
  "modules": [
    {{
      "title": "Module title",
      "description": "Module description",
      "objectives": ["objective 1", "objective 2", "objective 3"],
      "checkpoint_criteria": {{
        "accuracy_threshold": 0.85,
        "min_tasks_completed": 10
      }}
    }}
  ]
}}
"""

        schema = {
            'required': ['modules'],
        }

        return self.generate_json(
            prompt,
            system_instruction=system_instruction,
            schema=schema,
            cache_timeout=86400,  # Cache for 24 hours
        )

    def generate_task_feedback(
        self,
        user_answer: str,
        correct_answer: str,
        task_type: str,
        context: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Generate feedback for a user's task attempt

        Args:
            user_answer: User's submitted answer
            correct_answer: The correct answer
            task_type: Type of task (multiple_choice, fill_blank, translation)
            context: Optional context about the task

        Returns:
            Feedback dict with rule, example_contrast, and explanation
        """
        system_instruction = (
            "You are a helpful language teacher. Provide concise, clear feedback "
            "that helps learners understand their mistakes and learn from them."
        )

        context_str = f"\nContext: {context}" if context else ""

        prompt = f"""
The user attempted a {task_type} task.
User's answer: {user_answer}
Correct answer: {correct_answer}{context_str}

Provide feedback with:
1. A brief explanation of the relevant grammar/vocabulary rule
2. An example contrast showing the difference between correct and incorrect usage
3. A short tip to remember the rule

Return as JSON:
{{
  "rule": "Brief explanation of the rule",
  "example_contrast": "Correct: ... vs Incorrect: ...",
  "tip": "Helpful tip to remember"
}}
"""

        schema = {
            'required': ['rule', 'example_contrast'],
        }

        return self.generate_json(
            prompt,
            system_instruction=system_instruction,
            schema=schema,
            cache_timeout=3600,
        )

    def generate_tasks(
        self,
        module_title: str,
        module_description: str,
        language: str,
        cefr_level: str,
        count: int = 5
    ) -> Optional[List[Dict]]:
        """
        Generate learning tasks/exercises for a specific module

        Args:
            module_title: Title of the module
            module_description: Description of the module
            language: Target language
            cefr_level: CEFR level
            count: Number of tasks to generate

        Returns:
            List of task dicts or None if error
        """
        system_instruction = (
            "You are an expert language teacher. Create engaging, level-appropriate "
            "exercises for language learners. Follow the requested JSON format strictly."
        )

        prompt = f"""
Create {count} learning exercises for the module "{module_title}".
Module context: {module_description}
Target language: {language}
CEFR level: {cefr_level}

Types of exercises to include (mix them):
- multiple_choice: Question with 4 options
- fill_blank: Question with a blank and a hint
- translation: Translate a phrase from the learner's native language to {language}

For each exercise, provide:
- task_type: one of [multiple_choice, fill_blank, translation]
- content:
    - for multiple_choice: {{"question": "...", "options": ["...", "...", "...", "..."]}}
    - for fill_blank: {{"question": "...", "hint": "..."}}
    - for translation: {{"question": "Translate: 'phrase in English'", "context": "..."}}
- correct_answer: The exact correct answer string
- rule_explanation: 1-2 sentences explaining the grammar/vocabulary rule
- example_contrast: Correct vs Incorrect example
- difficulty_level: 1 (easy), 2 (medium), or 3 (hard)

Return as a JSON object with a "tasks" key containing the list of exercises.
"""

        schema = {
            'required': ['tasks'],
        }

        result = self.generate_json(
            prompt,
            system_instruction=system_instruction,
            schema=schema,
            cache_timeout=86400,
        )

        return result.get('tasks') if result else None

    def generate_dialogue_response(
        self,
        scenario_context: str,
        conversation_history: List[Dict[str, str]],
        user_message: str,
        target_language: str,
        cefr_level: str
    ) -> Optional[Dict]:
        """
        Generate AI response for dialogue mode with corrections

        Args:
            scenario_context: Description of the dialogue scenario
            conversation_history: Previous messages in the conversation
            user_message: User's latest message
            target_language: The language being learned
            cefr_level: User's CEFR level

        Returns:
            Dict with ai_response, corrections, and reformulation
        """
        system_instruction = (
            f"You are a friendly {target_language} tutor having a conversation "
            f"with a {cefr_level} level learner. Be encouraging and helpful."
        )

        history_text = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'AI'}: {msg['content']}"
            for msg in conversation_history
        ])

        prompt = f"""
Scenario: {scenario_context}

Previous conversation:
{history_text}

User's latest message: {user_message}

Please:
1. Respond naturally to the user's message in {target_language}
2. Identify any errors in the user's message and provide corrections
3. Provide a reformulated version of the user's message if there were errors

Return as JSON:
{{
  "ai_response": "Your natural response in {target_language}",
  "corrections": [
    {{
      "original": "the incorrect part",
      "corrected": "the correct version",
      "explanation": "brief explanation"
    }}
  ],
  "reformulation": "Full corrected version of user's message (only if errors exist)"
}}
"""

        schema = {
            'required': ['ai_response', 'corrections'],
        }

        return self.generate_json(
            prompt,
            system_instruction=system_instruction,
            schema=schema,
            use_cache=False,  # Don't cache dialogue responses
        )


# Singleton instance
gemini_service = GeminiService()
