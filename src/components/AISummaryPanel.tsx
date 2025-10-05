import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, AlertTriangle, Activity, Loader2, RefreshCw } from 'lucide-react';
import aimlApiService, { AISummaryResponse } from '../services/aimlApiService';
import { AirQualityReading } from '../services/nasaApiService';
import { useAuth } from '../contexts/AuthContext';

interface AISummaryPanelProps {
  currentAirQuality: AirQualityReading | null;
  forecastData: AirQualityReading[];
  locationName?: string;
}

const AISummaryPanel: React.FC<AISummaryPanelProps> = ({
  currentAirQuality,
  forecastData,
  locationName
}) => {
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const generateSummary = async () => {
    if (!currentAirQuality || !aimlApiService.isConfigured()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🤖 Generating AI summary...');
      
      // Get user profile if available
      let userProfile = null;
      if (user) {
        try {
          userProfile = await aimlApiService.getUserProfile(user.$id);
        } catch (profileError) {
          console.warn('⚠️ Could not fetch user profile for AI summary');
        }
      }

      const summary = await aimlApiService.generateAirQualitySummary({
        currentAirQuality,
        forecastData,
        userProfile: userProfile || undefined,
        locationName
      });

      setAiSummary(summary);
      console.log('✅ AI summary generated successfully');
    } catch (err) {
      console.error('❌ Failed to generate AI summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI summary');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate summary when component mounts or data changes
  useEffect(() => {
    if (currentAirQuality && aimlApiService.isConfigured()) {
      generateSummary();
    }
  }, [currentAirQuality, user]);

  // Don't render if AI service is not configured
  if (!aimlApiService.isConfigured()) {
    return null;
  }

  return (
    <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-kraken-beige bg-opacity-20 rounded-lg">
            <Brain className="w-5 h-5 text-kraken-beige" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-kraken-light font-mono">
              AI Insights
            </h3>
            <p className="text-sm text-kraken-light opacity-70 font-mono">
              Personalized air quality analysis
            </p>
          </div>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={generateSummary}
          disabled={isLoading || !currentAirQuality}
          className="p-2 text-kraken-light hover:text-kraken-beige transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh AI analysis"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3 text-kraken-light">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-mono text-sm">Analyzing air quality data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-kraken-red bg-opacity-10 border border-kraken-red border-opacity-30 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-kraken-red flex-shrink-0" />
          <div>
            <p className="text-kraken-red text-sm font-mono font-medium">
              AI Analysis Unavailable
            </p>
            <p className="text-kraken-red text-xs font-mono opacity-80 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* AI Summary Content */}
      {aiSummary && !isLoading && !error && (
        <div className="space-y-6">
          {/* Health Alert (if present) */}
          {aiSummary.healthAlert && (
            <div className="bg-kraken-red bg-opacity-10 border border-kraken-red border-opacity-30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-kraken-red flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-kraken-red font-mono font-medium text-sm mb-1">
                    Health Alert
                  </h4>
                  <p className="text-kraken-red font-mono text-sm">
                    {aiSummary.healthAlert}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Summary */}
          <div>
            <h4 className="text-kraken-beige font-mono font-medium text-sm mb-3 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Current Conditions Summary
            </h4>
            <p className="text-kraken-light font-mono text-sm leading-relaxed">
              {aiSummary.summary}
            </p>
          </div>

          {/* Recommendations */}
          {aiSummary.recommendations && aiSummary.recommendations.length > 0 && (
            <div>
              <h4 className="text-kraken-beige font-mono font-medium text-sm mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {aiSummary.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-kraken-beige rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-kraken-light font-mono text-sm leading-relaxed">
                      {recommendation}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Activity Suggestions */}
          {aiSummary.activitySuggestions && aiSummary.activitySuggestions.length > 0 && (
            <div>
              <h4 className="text-kraken-beige font-mono font-medium text-sm mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Activity Suggestions
              </h4>
              <ul className="space-y-2">
                {aiSummary.activitySuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-kraken-beige rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-kraken-light font-mono text-sm leading-relaxed">
                      {suggestion}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Attribution */}
          <div className="pt-4 border-t border-kraken-beige border-opacity-20">
            <p className="text-kraken-light font-mono text-xs opacity-60 flex items-center">
              <Brain className="w-3 h-3 mr-1" />
              Powered by Claude 4 Opus AI • Personalized for your profile
            </p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!currentAirQuality && !isLoading && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-kraken-light opacity-30 mx-auto mb-3" />
          <p className="text-kraken-light opacity-70 font-mono text-sm">
            Waiting for air quality data to generate insights...
          </p>
        </div>
      )}
    </div>
  );
};

export default AISummaryPanel;
