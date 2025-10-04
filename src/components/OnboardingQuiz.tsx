import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { ONBOARDING_QUESTIONS, validateAnswers, type OnboardingQuestion } from '../config/onboardingQuestions';

interface OnboardingQuizProps {
  onComplete: (answers: Record<string, any>) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete, onBack, isLoading = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const currentQuestion = ONBOARDING_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ONBOARDING_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setErrors(prev => prev.filter(id => id !== questionId));
  };

  const handleNext = () => {
    // Validate current question if required
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      setErrors([currentQuestion.id]);
      return;
    }

    if (isLastQuestion) {
      // Final validation
      const validation = validateAnswers(answers);
      if (!validation.isValid) {
        setErrors(validation.missingRequired);
        return;
      }
      onComplete(answers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const renderQuestionInput = (question: OnboardingQuestion) => {
    const hasError = errors.includes(question.id);
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  currentAnswer === option.value
                    ? 'border-kraken-beige bg-kraken-beige bg-opacity-10'
                    : hasError
                    ? 'border-kraken-red border-opacity-50 bg-kraken-red bg-opacity-5'
                    : 'border-kraken-beige border-opacity-30 hover:border-kraken-beige hover:border-opacity-50'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  currentAnswer === option.value
                    ? 'border-kraken-beige bg-kraken-beige'
                    : 'border-kraken-light border-opacity-30'
                }`}>
                  {currentAnswer === option.value && (
                    <div className="w-2 h-2 rounded-full bg-kraken-dark"></div>
                  )}
                </div>
                <span className="text-kraken-light font-mono">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple-choice':
        const selectedValues = Array.isArray(currentAnswer) ? currentAnswer : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const isNoneOption = option.value === 'none';
              
              return (
                <label
                  key={option.id}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-kraken-beige bg-kraken-beige bg-opacity-10'
                      : hasError
                      ? 'border-kraken-red border-opacity-50 bg-kraken-red bg-opacity-5'
                      : 'border-kraken-beige border-opacity-30 hover:border-kraken-beige hover:border-opacity-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      let newValues = [...selectedValues];
                      
                      if (isNoneOption) {
                        // If "none" is selected, clear all other selections
                        newValues = e.target.checked ? [option.value] : [];
                      } else {
                        // If any other option is selected, remove "none"
                        newValues = newValues.filter(v => v !== 'none');
                        
                        if (e.target.checked) {
                          newValues.push(option.value);
                        } else {
                          newValues = newValues.filter(v => v !== option.value);
                        }
                      }
                      
                      handleAnswer(question.id, newValues);
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                    isSelected
                      ? 'border-kraken-beige bg-kraken-beige'
                      : 'border-kraken-light border-opacity-30'
                  }`}>
                    {isSelected && (
                      <Check className="w-3 h-3 text-kraken-dark" />
                    )}
                  </div>
                  <span className="text-kraken-light font-mono">{option.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className={`w-full p-4 rounded-lg border bg-kraken-dark bg-opacity-50 text-kraken-light placeholder-kraken-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-kraken-beige font-mono ${
              hasError
                ? 'border-kraken-red border-opacity-50'
                : 'border-kraken-beige border-opacity-30 focus:border-kraken-beige focus:border-opacity-50'
            }`}
            placeholder="Enter your answer..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(question.id, parseInt(e.target.value) || '')}
            className={`w-full p-4 rounded-lg border bg-kraken-dark bg-opacity-50 text-kraken-light placeholder-kraken-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-kraken-beige font-mono ${
              hasError
                ? 'border-kraken-red border-opacity-50'
                : 'border-kraken-beige border-opacity-30 focus:border-kraken-beige focus:border-opacity-50'
            }`}
            placeholder="Enter a number..."
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-kraken-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-8">
            <img
              src="/main-krak.svg"
              alt="Kraken Octopus"
              className="w-32 h-32 mx-auto object-contain animate-pulse"
            />
          </div>
          <h2 className="text-3xl font-bold text-kraken-light font-mono mb-2">
            Complete Your Profile
          </h2>
          <p className="text-kraken-light opacity-70 font-mono">
            Help us personalize your air quality experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-full h-2">
          <div
            className="bg-kraken-beige h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question Counter */}
        <div className="text-center">
          <span className="text-kraken-light opacity-70 font-mono text-sm">
            Question {currentQuestionIndex + 1} of {ONBOARDING_QUESTIONS.length}
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-kraken-light font-mono mb-2">
              {currentQuestion.question}
              {currentQuestion.required && (
                <span className="text-kraken-red ml-1">*</span>
              )}
            </h3>
            {currentQuestion.description && (
              <p className="text-kraken-light opacity-70 font-mono text-sm">
                {currentQuestion.description}
              </p>
            )}
          </div>

          {/* Error Message */}
          {errors.includes(currentQuestion.id) && (
            <div className="mb-6 bg-kraken-red bg-opacity-10 border border-kraken-red border-opacity-30 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-kraken-red flex-shrink-0" />
              <p className="text-kraken-red text-sm font-mono">
                This question is required. Please select an answer.
              </p>
            </div>
          )}

          {/* Question Input */}
          <div className="mb-8">
            {renderQuestionInput(currentQuestion)}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              className="flex items-center space-x-2 px-6 py-3 bg-kraken-dark bg-opacity-50 text-kraken-light rounded-lg font-mono hover:bg-opacity-70 transition-colors border border-kraken-beige border-opacity-20"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{currentQuestionIndex === 0 ? 'Back to Sign Up' : 'Previous'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-kraken-beige text-kraken-dark rounded-lg font-mono hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-kraken-dark"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>{isLastQuestion ? 'Complete Setup' : 'Next'}</span>
                  {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category Indicator */}
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-kraken-beige bg-opacity-20 text-kraken-beige border border-kraken-beige border-opacity-30">
            {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;
