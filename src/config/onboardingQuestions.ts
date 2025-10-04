export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'single-choice' | 'multiple-choice' | 'text' | 'number';
  options?: QuestionOption[];
  required: boolean;
  category: 'health' | 'lifestyle' | 'location' | 'preferences';
  description?: string;
}

// Easy to modify question configuration
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'age_group',
    question: 'What is your age group?',
    type: 'single-choice',
    category: 'health',
    required: true,
    options: [
      { id: 'under_18', label: 'Under 18', value: 'under_18' },
      { id: '18_29', label: '18-29', value: '18_29' },
      { id: '30_44', label: '30-44', value: '30_44' },
      { id: '45_64', label: '45-64', value: '45_64' },
      { id: '65_plus', label: '65+', value: '65_plus' }
    ]
  },
  {
    id: 'health_conditions',
    question: 'Do you have any of the following health conditions?',
    type: 'multiple-choice',
    category: 'health',
    required: true,
    description: 'Select all that apply. This helps us provide personalized air quality recommendations.',
    options: [
      { id: 'asthma', label: 'Asthma', value: 'asthma' },
      { id: 'copd', label: 'COPD', value: 'copd' },
      { id: 'allergies', label: 'Seasonal Allergies', value: 'allergies' },
      { id: 'heart_disease', label: 'Heart Disease', value: 'heart_disease' },
      { id: 'diabetes', label: 'Diabetes', value: 'diabetes' },
      { id: 'pregnancy', label: 'Pregnancy', value: 'pregnancy' },
      { id: 'none', label: 'None of the above', value: 'none' }
    ]
  },
  {
    id: 'activity_level',
    question: 'How would you describe your typical outdoor activity level?',
    type: 'single-choice',
    category: 'lifestyle',
    required: true,
    options: [
      { id: 'very_active', label: 'Very Active (Daily outdoor exercise)', value: 'very_active' },
      { id: 'moderately_active', label: 'Moderately Active (3-4 times per week)', value: 'moderately_active' },
      { id: 'lightly_active', label: 'Lightly Active (1-2 times per week)', value: 'lightly_active' },
      { id: 'sedentary', label: 'Mostly Indoor/Sedentary', value: 'sedentary' }
    ]
  },
  {
    id: 'outdoor_activities',
    question: 'Which outdoor activities do you regularly participate in?',
    type: 'multiple-choice',
    category: 'lifestyle',
    required: false,
    description: 'This helps us provide activity-specific air quality alerts.',
    options: [
      { id: 'running', label: 'Running/Jogging', value: 'running' },
      { id: 'cycling', label: 'Cycling', value: 'cycling' },
      { id: 'hiking', label: 'Hiking', value: 'hiking' },
      { id: 'sports', label: 'Outdoor Sports', value: 'sports' },
      { id: 'walking', label: 'Walking', value: 'walking' },
      { id: 'gardening', label: 'Gardening', value: 'gardening' },
      { id: 'commuting', label: 'Outdoor Commuting', value: 'commuting' },
      { id: 'none', label: 'None regularly', value: 'none' }
    ]
  },
  {
    id: 'air_sensitivity',
    question: 'How sensitive are you to air quality changes?',
    type: 'single-choice',
    category: 'health',
    required: true,
    description: 'This helps us calibrate alert thresholds for your needs.',
    options: [
      { id: 'very_sensitive', label: 'Very Sensitive (Notice small changes)', value: 'very_sensitive' },
      { id: 'moderately_sensitive', label: 'Moderately Sensitive (Notice obvious changes)', value: 'moderately_sensitive' },
      { id: 'not_very_sensitive', label: 'Not Very Sensitive (Only notice severe changes)', value: 'not_very_sensitive' },
      { id: 'unsure', label: 'Not Sure', value: 'unsure' }
    ]
  },
  {
    id: 'notification_preferences',
    question: 'When would you like to receive air quality alerts?',
    type: 'multiple-choice',
    category: 'preferences',
    required: true,
    options: [
      { id: 'poor_quality', label: 'When air quality is poor', value: 'poor_quality' },
      { id: 'very_poor_quality', label: 'Only when air quality is very poor', value: 'very_poor_quality' },
      { id: 'daily_forecast', label: 'Daily air quality forecast', value: 'daily_forecast' },
      { id: 'before_activities', label: 'Before planned outdoor activities', value: 'before_activities' },
      { id: 'health_alerts', label: 'Health-specific recommendations', value: 'health_alerts' },
      { id: 'minimal', label: 'Minimal notifications only', value: 'minimal' }
    ]
  },
  {
    id: 'primary_location',
    question: 'What type of area do you primarily live in?',
    type: 'single-choice',
    category: 'location',
    required: true,
    options: [
      { id: 'urban_center', label: 'Urban Center/Downtown', value: 'urban_center' },
      { id: 'suburban', label: 'Suburban Area', value: 'suburban' },
      { id: 'rural', label: 'Rural Area', value: 'rural' },
      { id: 'industrial', label: 'Near Industrial Area', value: 'industrial' },
      { id: 'coastal', label: 'Coastal Area', value: 'coastal' }
    ]
  },
  {
    id: 'concerns',
    question: 'What are your main concerns about air quality?',
    type: 'multiple-choice',
    category: 'preferences',
    required: false,
    description: 'Help us prioritize the information most important to you.',
    options: [
      { id: 'health_impact', label: 'Health Impact', value: 'health_impact' },
      { id: 'exercise_planning', label: 'Exercise Planning', value: 'exercise_planning' },
      { id: 'family_safety', label: 'Family Safety', value: 'family_safety' },
      { id: 'long_term_exposure', label: 'Long-term Exposure', value: 'long_term_exposure' },
      { id: 'travel_planning', label: 'Travel Planning', value: 'travel_planning' },
      { id: 'general_awareness', label: 'General Awareness', value: 'general_awareness' }
    ]
  }
];

// Helper function to get questions by category
export const getQuestionsByCategory = (category: string): OnboardingQuestion[] => {
  return ONBOARDING_QUESTIONS.filter(q => q.category === category);
};

// Helper function to get required questions
export const getRequiredQuestions = (): OnboardingQuestion[] => {
  return ONBOARDING_QUESTIONS.filter(q => q.required);
};

// Helper function to validate answers
export const validateAnswers = (answers: Record<string, any>): { isValid: boolean; missingRequired: string[] } => {
  const requiredQuestions = getRequiredQuestions();
  const missingRequired: string[] = [];

  requiredQuestions.forEach(question => {
    if (!answers[question.id] || 
        (Array.isArray(answers[question.id]) && answers[question.id].length === 0)) {
      missingRequired.push(question.id);
    }
  });

  return {
    isValid: missingRequired.length === 0,
    missingRequired
  };
};
