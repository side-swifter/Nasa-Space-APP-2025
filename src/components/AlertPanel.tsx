import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, Brain, Loader2, Settings } from 'lucide-react';
import { AirQualityReading } from '../services/nasaApiService';
import aimlApiService, { AISummaryResponse } from '../services/aimlApiService';
import notificationService, { NotificationSettings } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

interface AlertPanelProps {
  currentAirQuality: AirQualityReading | null;
  forecastData?: AirQualityReading[];
  historicalData?: AirQualityReading[];
  onShowNotificationConfig?: () => void;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ currentAirQuality, forecastData = [], historicalData = [], onShowNotificationConfig }) => {
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [userSettings, setUserSettings] = useState<NotificationSettings | null>(null);
  const [customAlerts, setCustomAlerts] = useState<Alert[]>([]);
  const { user } = useAuth();

  // Load user notification settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      try {
        const { supabase } = await import('../lib/supabase');
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.$id)
          .single();

        if (!error && data) {
          const settings: NotificationSettings = {
            aiPromptVariables: {
              healthConditions: data.health_conditions || [],
              ageGroup: data.age_group || 'adult',
              airSensitivity: data.air_sensitivity || 'normal',
              activityLevel: data.activity_level || 'moderate',
              outdoorActivities: data.outdoor_activities || [],
              primaryLocation: data.primary_location || 'urban',
              concerns: data.concerns || [],
              notificationThresholds: data.notification_thresholds || {
                aqiWarning: 100,
                pm25Warning: 35,
                ozoneWarning: 70
              }
            },
            notificationPreferences: {
              enableHealthAlerts: data.enable_health_alerts ?? true,
              enableAIInsights: data.enable_ai_insights ?? true,
              enableForecastAlerts: data.enable_forecast_alerts ?? true,
              alertFrequency: data.alert_frequency || 'immediate',
              customPromptTemplate: data.custom_prompt_template || ''
            }
          };
          setUserSettings(settings);
        }
      } catch (error) {
        console.warn('Failed to load user notification settings:', error);
      }
    };

    loadUserSettings();
  }, [user]);

  // Generate AI insights with actual API calls (no caching for fresh responses)
  useEffect(() => {
    const generateAIInsights = async () => {
      // Only run if we have data and AI is configured
      if (!currentAirQuality || !aimlApiService.isConfigured() || isLoadingAI || !user) {
        return;
      }

      setIsLoadingAI(true);
      
      try {
        console.log('🤖 Generating fresh AI insights with actual API call...');
        
        // Get user profile for context
        let userProfile = null;
        try {
          userProfile = await aimlApiService.getUserProfile(user.$id);
        } catch (profileError) {
          console.warn('⚠️ Could not fetch user profile for AI insights');
        }

        // Generate NEW AI summary with actual API call and ALL available data
        const summary = await aimlApiService.generateAirQualitySummary({
          currentAirQuality,
          forecastData,
          userProfile: userProfile || undefined,
          locationName: currentAirQuality?.location?.name,
          // Include all additional context data
          historicalData: historicalData,
          weatherData: undefined, // Weather data not available in current structure
          siteMetadata: {
            dataSource: 'NASA TEMPO + EPA AirNow',
            lastUpdated: currentAirQuality?.timestamp,
            coordinates: {
              lat: currentAirQuality?.location?.lat,
              lon: currentAirQuality?.location?.lon
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        });

        setAiSummary(summary);
        setIsUsingCache(false);
        
        // Generate custom alerts based on user settings if available
        if (userSettings) {
          const result = await notificationService.triggerNotifications({
            type: 'health',
            airQuality: currentAirQuality,
            forecastData,
            userSettings,
            userId: user.$id
          });
          
          if (result.success && result.alerts.length > 0) {
            setCustomAlerts(result.alerts);
          }
        }
        
        console.log('✅ Fresh AI insights generated successfully');
        
      } catch (error) {
        console.error('❌ Failed to generate AI insights:', error);
      } finally {
        setIsLoadingAI(false);
      }
    };

    // Generate fresh insights whenever air quality data changes
    if (currentAirQuality && user && aimlApiService.isConfigured()) {
      generateAIInsights();
    }
  }, [currentAirQuality?.aqi, currentAirQuality?.pm25, currentAirQuality?.o3, user?.$id]); // Depend on key air quality metrics

  // Generate alerts based on air quality data and user settings
  const generateAlerts = (): Alert[] => {
    // Use custom alerts from notification service if available
    if (customAlerts.length > 0) {
      return customAlerts;
    }
    
    // Fallback to default alerts
    const alerts: Alert[] = [];
    const now = new Date();

    if (!currentAirQuality) {
      return [{
        id: '1',
        type: 'info',
        title: 'No Data Available',
        message: 'Air quality data is currently unavailable for your location.',
        timestamp: now.toISOString(),
      }];
    }

    // Use user thresholds if available, otherwise use defaults
    const aqiThreshold = userSettings?.aiPromptVariables.notificationThresholds.aqiWarning || 100;
    const pm25Threshold = userSettings?.aiPromptVariables.notificationThresholds.pm25Warning || 35;
    const ozoneThreshold = userSettings?.aiPromptVariables.notificationThresholds.ozoneWarning || 70;

    // AQI-based alerts using user thresholds
    if (currentAirQuality.aqi > 150) {
      alerts.push({
        id: '1',
        type: 'danger',
        title: 'Unhealthy Air Quality Alert',
        message: 'Air quality is unhealthy. Limit outdoor activities and consider wearing a mask.',
        timestamp: now.toISOString(),
      });
    } else if (currentAirQuality.aqi >= aqiThreshold) {
      alerts.push({
        id: '2',
        type: 'warning',
        title: `AQI Alert: ${currentAirQuality.aqi}`,
        message: `Air quality has exceeded your personal threshold of ${aqiThreshold}. Consider reducing outdoor activities.`,
        timestamp: now.toISOString(),
      });
    } else if (currentAirQuality.aqi <= 50) {
      alerts.push({
        id: '3',
        type: 'success',
        title: 'Good Air Quality',
        message: 'Air quality is good. Perfect conditions for outdoor activities.',
        timestamp: now.toISOString(),
      });
    }

    // PM2.5 specific alerts using user thresholds
    if (currentAirQuality.pm25 >= pm25Threshold) {
      alerts.push({
        id: '4',
        type: 'warning',
        title: 'PM2.5 Alert',
        message: `PM2.5 levels (${currentAirQuality.pm25.toFixed(1)} μg/m³) exceed your threshold of ${pm25Threshold} μg/m³.`,
        timestamp: now.toISOString(),
      });
    }

    // Ozone alerts using user thresholds
    if (currentAirQuality.o3 >= ozoneThreshold) {
      alerts.push({
        id: '5',
        type: 'warning',
        title: 'Ozone Alert',
        message: `Ground-level ozone (${currentAirQuality.o3.toFixed(1)} ppb) exceeds your threshold of ${ozoneThreshold} ppb.`,
        timestamp: now.toISOString(),
      });
    }

    return alerts.slice(0, 4); // Limit to 4 alerts
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getAlertBorderColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'border-red-400';
      case 'warning':
        return 'border-yellow-400';
      case 'success':
        return 'border-green-400';
      case 'info':
      default:
        return 'border-blue-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-kraken-beige font-mono">
          Health Alerts & Notifications
        </h3>
        <div className="text-sm text-kraken-light opacity-70 font-mono">
          {alerts.length} active
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 ${getAlertBorderColor(alert.type)} bg-kraken-dark bg-opacity-50 p-3 rounded-r-lg`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-kraken-light font-mono">
                    {alert.title}
                  </h4>
                  <span className="text-xs text-kraken-light opacity-60 font-mono">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-kraken-light opacity-80 font-mono">
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI-Powered Health Recommendations */}
      <div className="mt-6 pt-4 border-t border-kraken-beige border-opacity-20">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-kraken-beige font-mono flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            AI Health Insights
          </h4>
          <div className="flex items-center space-x-2">
            {onShowNotificationConfig && (
              <button
                onClick={onShowNotificationConfig}
                className="flex items-center space-x-1 px-2 py-1 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded text-xs font-mono hover:bg-opacity-30 transition-colors"
                title="Configure AI settings"
              >
                <Settings className="w-3 h-3" />
                <span>Config</span>
              </button>
            )}
            {isLoadingAI && (
              <div className="flex items-center space-x-1 text-kraken-beige text-xs font-mono">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Generating AI insights...</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Warning */}
        {aiSummary?.warning && (
          <div className="mb-4 p-3 bg-kraken-red bg-opacity-10 rounded-lg border border-kraken-red border-opacity-30">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-kraken-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-kraken-red font-mono leading-relaxed">
                <strong>Warning:</strong> {aiSummary.warning}
              </p>
            </div>
          </div>
        )}

        {/* Safe Outdoor Activities */}
        {aiSummary?.outdoorActivities && aiSummary.outdoorActivities.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-kraken-beige font-mono mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Safe Outdoor Activities
            </h5>
            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              {aiSummary.outdoorActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-2 text-kraken-light">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="leading-relaxed">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Precautions */}
        {aiSummary?.precautions && aiSummary.precautions.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-kraken-beige font-mono mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Precautions When Going Outside
            </h5>
            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              {aiSummary.precautions.map((precaution, index) => (
                <div key={index} className="flex items-start space-x-2 text-kraken-light">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="leading-relaxed">{precaution}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show message if no AI data yet */}
        {(!aiSummary?.warning && !aiSummary?.outdoorActivities && !aiSummary?.precautions) && !isLoadingAI && aimlApiService.isConfigured() ? (
          <div className="text-center py-2">
            <p className="text-kraken-light opacity-60 font-mono text-xs">
              AI insights will appear here once data is processed
            </p>
          </div>
        ) : !aimlApiService.isConfigured() ? (
          // Fallback to static recommendations if AI is not configured
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2 text-kraken-light">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Check air quality before outdoor activities</span>
            </div>
            <div className="flex items-center space-x-2 text-kraken-light">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Use air purifiers indoors when AQI {'>'}100</span>
            </div>
            <div className="flex items-center space-x-2 text-kraken-light">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Wear N95 masks when AQI {'>'} 150</span>
            </div>
            <div className="flex items-center space-x-2 text-kraken-light">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Stay hydrated and avoid strenuous exercise</span>
            </div>
          </div>
        ) : isLoadingAI ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-kraken-beige animate-spin mr-2" />
            <span className="text-kraken-light font-mono text-sm">Generating personalized insights...</span>
          </div>
        ) : null}

        {/* AI Attribution */}
        {aimlApiService.isConfigured() && (
          <div className="mt-4 pt-3 border-t border-kraken-beige border-opacity-10">
            <div className="flex items-center justify-between">
              <p className="text-kraken-light font-mono text-xs opacity-60 flex items-center">
                <Brain className="w-3 h-3 mr-1" />
                Powered by Claude 4 Opus AI • Personalized for your health profile
              </p>
              {isUsingCache && (
                <div className="flex items-center text-green-400 font-mono text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Cached (Today)
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
