# Kraken Onboarding Quiz System

## Overview

The onboarding quiz system collects user health and lifestyle information during signup to provide personalized air quality recommendations. Users must complete the quiz before their account is created.

## Quick Setup

### 1. Database Setup
Run the SQL schema in your Supabase dashboard:
```bash
# Copy and paste the contents of supabase-schema.sql into your Supabase SQL editor
```

### 2. Test the Flow
1. Go to `/signup`
2. Fill out basic info (name, email, password)
3. Click "Create account" → Quiz appears
4. Complete all required questions
5. Account is created with quiz data stored in Supabase

## Customizing Questions

### Adding New Questions
Edit `/src/config/onboardingQuestions.ts`:

```typescript
{
  id: 'your_question_id',
  question: 'Your question text?',
  type: 'single-choice', // or 'multiple-choice', 'text', 'number'
  category: 'health', // or 'lifestyle', 'location', 'preferences'
  required: true,
  description: 'Optional helper text',
  options: [
    { id: 'option1', label: 'Option 1', value: 'option1' },
    { id: 'option2', label: 'Option 2', value: 'option2' }
  ]
}
```

### Question Types
- **single-choice**: Radio buttons (one selection)
- **multiple-choice**: Checkboxes (multiple selections)
- **text**: Text input field
- **number**: Number input field

### Categories
- **health**: Medical conditions, sensitivities
- **lifestyle**: Activity levels, outdoor habits
- **location**: Geographic preferences
- **preferences**: Notification settings, concerns

### Removing Questions
Simply delete the question object from the `ONBOARDING_QUESTIONS` array.

### Changing Question Order
Reorder items in the `ONBOARDING_QUESTIONS` array.

## Data Storage

### Supabase Tables
- **auth.users**: Basic auth info + onboarding_data in metadata
- **user_profiles**: Structured onboarding data for easy querying

### Accessing User Data
```typescript
// Get current user's profile
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Query users by health conditions
const { data: asthmaUsers } = await supabase
  .from('user_profiles')
  .select('*')
  .contains('health_conditions', ['asthma']);
```

## Validation

### Required Questions
Questions marked with `required: true` must be answered before account creation.

### Custom Validation
Add validation logic in `/src/config/onboardingQuestions.ts`:

```typescript
export const validateAnswers = (answers: Record<string, any>) => {
  // Add custom validation logic here
  // Return { isValid: boolean, missingRequired: string[] }
};
```

## UI Customization

### Styling
The quiz uses Kraken theme colors. Modify `/src/components/OnboardingQuiz.tsx` for styling changes.

### Progress Tracking
- Progress bar shows completion percentage
- Question counter shows current position
- Category badges show question type

### Navigation
- "Previous" button to go back
- "Next" button to advance
- "Complete Setup" on final question

## Integration Points

### AuthContext
The signup flow is integrated with the auth system:
```typescript
await signup(email, password, name, quizAnswers);
```

### Error Handling
- Form validation errors
- Network/database errors
- Incomplete quiz handling

## Example Customizations

### Adding a New Health Question
```typescript
{
  id: 'medication_usage',
  question: 'Do you regularly take any medications that might affect breathing?',
  type: 'multiple-choice',
  category: 'health',
  required: false,
  description: 'This helps us provide more accurate health recommendations.',
  options: [
    { id: 'inhalers', label: 'Inhalers (rescue or maintenance)', value: 'inhalers' },
    { id: 'allergy_meds', label: 'Allergy medications', value: 'allergy_meds' },
    { id: 'blood_pressure', label: 'Blood pressure medications', value: 'blood_pressure' },
    { id: 'none', label: 'None', value: 'none' }
  ]
}
```

### Adding Location-Based Questions
```typescript
{
  id: 'commute_method',
  question: 'How do you typically commute?',
  type: 'single-choice',
  category: 'lifestyle',
  required: true,
  options: [
    { id: 'walking', label: 'Walking', value: 'walking' },
    { id: 'cycling', label: 'Cycling', value: 'cycling' },
    { id: 'public_transit', label: 'Public Transit', value: 'public_transit' },
    { id: 'driving', label: 'Driving', value: 'driving' },
    { id: 'work_from_home', label: 'Work from Home', value: 'work_from_home' }
  ]
}
```

## Best Practices

1. **Keep it Short**: Aim for 5-10 questions max
2. **Clear Language**: Use simple, non-medical terms
3. **Logical Flow**: Group related questions together
4. **Optional Context**: Use description field for clarification
5. **Test Thoroughly**: Verify all question types work correctly

## Troubleshooting

### Common Issues
- **Quiz not showing**: Check `showQuiz` state in SignUp.tsx
- **Data not saving**: Verify Supabase table exists and RLS policies
- **Validation errors**: Check required questions are answered
- **Styling issues**: Verify Tailwind classes are correct

### Debug Mode
Add console logs to track quiz progress:
```typescript
console.log('Quiz answers:', answers);
console.log('Validation result:', validateAnswers(answers));
```
