import { AirQualityReading } from './nasaApiService';
import aimlApiService, { AISummaryResponse } from './aimlApiService';
import simpleAICache from './simpleAICache';

interface NotificationSettings {
  aiPromptVariables: {
    healthConditions: string[];
    ageGroup: string;
    airSensitivity: string;
    activityLevel: string;
    outdoorActivities: string[];
    primaryLocation: string;
    concerns: string[];
    notificationThresholds: {
      aqiWarning: number;
      pm25Warning: number;
      ozoneWarning: number;
    };
  };
  notificationPreferences: {
    enableHealthAlerts: boolean;
    enableAIInsights: boolean;
    enableForecastAlerts: boolean;
    alertFrequency: 'immediate' | 'hourly' | 'daily';
    customPromptTemplate: string;
  };
}

interface NotificationTrigger {
  type: 'health' | 'forecast' | 'manual';
  airQuality: AirQualityReading;
  forecastData?: AirQualityReading[];
  userSettings: NotificationSettings;
  userId: string;
}

interface NotificationResult {
  success: boolean;
  aiSummary?: AISummaryResponse;
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    title: string;
    message: string;
    timestamp: string;
  }>;
  error?: string;
}

class NotificationService {
  private lastNotificationTime: { [userId: string]: number } = {};
  
  /**
   * Trigger AI-powered notifications based on air quality and user settings
   */
  async triggerNotifications(trigger: NotificationTrigger): Promise<NotificationResult> {
    const { type, airQuality, forecastData = [], userSettings, userId } = trigger;
    
    try {
      console.log(`🔔 Triggering ${type} notification for user ${userId}`);
      
      // Check if notifications are enabled
      if (!this.shouldTriggerNotification(trigger)) {
        return {
          success: false,
          alerts: [],
          error: 'Notifications disabled or rate limited'
        };
      }
      
      // Generate alerts based on thresholds
      const alerts = this.generateAlerts(airQuality, userSettings);
      
      let aiSummary: AISummaryResponse | undefined;
      
      // Generate AI insights if enabled
      if (userSettings.notificationPreferences.enableAIInsights && aimlApiService.isConfigured()) {
        try {
          aiSummary = await this.generateAIInsights(trigger);
        } catch (error) {
          console.warn('⚠️ Failed to generate AI insights for notification:', error);
        }
      }
      
      // Update last notification time
      this.lastNotificationTime[userId] = Date.now();
      
      console.log(`✅ ${type} notification triggered successfully`);
      
      return {
        success: true,
        aiSummary,
        alerts
      };
      
    } catch (error) {
      console.error(`❌ Failed to trigger ${type} notification:`, error);
      return {
        success: false,
        alerts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Generate AI insights with enhanced prompt using user variables
   */
  private async generateAIInsights(trigger: NotificationTrigger): Promise<AISummaryResponse> {
    const { airQuality, forecastData, userSettings, userId } = trigger;
    
    // Check cache first
    const cachedInsight = await simpleAICache.getCachedInsight(userId);
    if (cachedInsight) {
      console.log('✅ Using cached AI insight - no API credits used!');
      return cachedInsight;
    }
    
    // Get user profile for AI context
    let userProfile = null;
    try {
      userProfile = await aimlApiService.getUserProfile(userId);
    } catch (error) {
      console.warn('⚠️ Could not fetch user profile for AI insights');
    }
    
    // Generate AI summary with enhanced user profile
    const summary = await aimlApiService.generateAirQualitySummary({
      currentAirQuality: airQuality,
      forecastData: forecastData || [],
      userProfile: userProfile || this.convertSettingsToProfile(userSettings),
      locationName: airQuality?.location?.name
    });
    
    // Cache the result
    await simpleAICache.cacheInsight(userId, summary);
    
    return summary;
  }
  
  /**
   * Build enhanced AI prompt using user-defined variables (currently unused but kept for future enhancement)
   */
  private buildEnhancedPrompt(
    airQuality: AirQualityReading, 
    forecastData: AirQualityReading[], 
    userSettings: NotificationSettings
  ): string {
    const { aiPromptVariables, notificationPreferences } = userSettings;
    
    // Use custom template if provided
    if (notificationPreferences.customPromptTemplate) {
      return this.interpolateTemplate(
        notificationPreferences.customPromptTemplate,
        airQuality,
        aiPromptVariables
      );
    }
    
    // Build default enhanced prompt
    let prompt = `Current Air Quality Analysis for ${airQuality.location?.name || 'your location'}:
- AQI: ${airQuality.aqi}
- PM2.5: ${airQuality.pm25} μg/m³
- PM10: ${airQuality.pm10} μg/m³
- NO₂: ${airQuality.no2} ppb
- O₃: ${airQuality.o3} ppb
- SO₂: ${airQuality.so2} ppb
- CO: ${airQuality.co} ppm

User Profile Context:
- Age Group: ${aiPromptVariables.ageGroup}
- Air Sensitivity: ${aiPromptVariables.airSensitivity}
- Activity Level: ${aiPromptVariables.activityLevel}
- Primary Location Type: ${aiPromptVariables.primaryLocation}`;

    if (aiPromptVariables.healthConditions.length > 0) {
      prompt += `\n- Health Conditions: ${aiPromptVariables.healthConditions.join(', ')}`;
    }
    
    if (aiPromptVariables.outdoorActivities.length > 0) {
      prompt += `\n- Preferred Outdoor Activities: ${aiPromptVariables.outdoorActivities.join(', ')}`;
    }
    
    if (aiPromptVariables.concerns.length > 0) {
      prompt += `\n- Primary Concerns: ${aiPromptVariables.concerns.join(', ')}`;
    }
    
    // Add threshold context
    prompt += `\n\nUser Alert Thresholds:
- AQI Warning: ${aiPromptVariables.notificationThresholds.aqiWarning}
- PM2.5 Warning: ${aiPromptVariables.notificationThresholds.pm25Warning} μg/m³
- Ozone Warning: ${aiPromptVariables.notificationThresholds.ozoneWarning} ppb`;
    
    // Add forecast context if available
    if (forecastData.length > 0) {
      const avgForecastAQI = forecastData.reduce((sum, reading) => sum + reading.aqi, 0) / forecastData.length;
      const trend = avgForecastAQI > airQuality.aqi ? 'worsening' : 
                   avgForecastAQI < airQuality.aqi ? 'improving' : 'stable';
      prompt += `\n\n24-Hour Forecast:
- Average forecast AQI: ${Math.round(avgForecastAQI)} (${trend})`;
    }
    
    prompt += `\n\nPlease provide personalized health recommendations considering this user's specific profile, sensitivity level, and alert thresholds.`;
    
    return prompt;
  }
  
  /**
   * Interpolate custom template with actual values
   */
  private interpolateTemplate(
    template: string, 
    airQuality: AirQualityReading, 
    variables: NotificationSettings['aiPromptVariables']
  ): string {
    const replacements: { [key: string]: string } = {
      '{aqiValue}': airQuality.aqi.toString(),
      '{pm25Value}': airQuality.pm25.toString(),
      '{pm10Value}': airQuality.pm10.toString(),
      '{no2Value}': airQuality.no2.toString(),
      '{o3Value}': airQuality.o3.toString(),
      '{so2Value}': airQuality.so2.toString(),
      '{coValue}': airQuality.co.toString(),
      '{userAge}': variables.ageGroup,
      '{airSensitivity}': variables.airSensitivity,
      '{activityLevel}': variables.activityLevel,
      '{primaryLocation}': variables.primaryLocation,
      '{healthConditions}': variables.healthConditions.join(', '),
      '{outdoorActivities}': variables.outdoorActivities.join(', '),
      '{concerns}': variables.concerns.join(', '),
      '{aqiThreshold}': variables.notificationThresholds.aqiWarning.toString(),
      '{pm25Threshold}': variables.notificationThresholds.pm25Warning.toString(),
      '{ozoneThreshold}': variables.notificationThresholds.ozoneWarning.toString(),
      '{locationName}': airQuality.location?.name || 'your location',
      '{timestamp}': new Date().toISOString()
    };
    
    let result = template;
    Object.entries(replacements).forEach(([key, value]) => {
      result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    return result;
  }
  
  /**
   * Generate alerts based on user thresholds and air quality data
   */
  private generateAlerts(
    airQuality: AirQualityReading, 
    userSettings: NotificationSettings
  ): Array<{
    id: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    title: string;
    message: string;
    timestamp: string;
  }> {
    const alerts: Array<{
      id: string;
      type: 'info' | 'warning' | 'danger' | 'success';
      title: string;
      message: string;
      timestamp: string;
    }> = [];
    const now = new Date().toISOString();
    const thresholds = userSettings.aiPromptVariables.notificationThresholds;
    
    // AQI-based alerts using user thresholds
    if (airQuality.aqi >= thresholds.aqiWarning) {
      const severity: 'warning' | 'danger' = airQuality.aqi > 150 ? 'danger' : 'warning';
      alerts.push({
        id: `aqi-${Date.now()}`,
        type: severity,
        title: `AQI Alert: ${airQuality.aqi}`,
        message: `Air quality has exceeded your threshold of ${thresholds.aqiWarning}. Consider limiting outdoor activities.`,
        timestamp: now
      });
    }
    
    // PM2.5 alerts using user thresholds
    if (airQuality.pm25 >= thresholds.pm25Warning) {
      alerts.push({
        id: `pm25-${Date.now()}`,
        type: 'warning' as const,
        title: 'PM2.5 Alert',
        message: `PM2.5 levels (${airQuality.pm25.toFixed(1)} μg/m³) exceed your threshold of ${thresholds.pm25Warning} μg/m³.`,
        timestamp: now
      });
    }
    
    // Ozone alerts using user thresholds
    if (airQuality.o3 >= thresholds.ozoneWarning) {
      alerts.push({
        id: `ozone-${Date.now()}`,
        type: 'warning' as const,
        title: 'Ozone Alert',
        message: `Ground-level ozone (${airQuality.o3.toFixed(1)} ppb) exceeds your threshold of ${thresholds.ozoneWarning} ppb.`,
        timestamp: now
      });
    }
    
    // Good air quality alert (green color for good news)
    if (airQuality.aqi <= 50 && alerts.length === 0) {
      alerts.push({
        id: `good-${Date.now()}`,
        type: 'success' as const,
        title: 'Good Air Quality',
        message: 'Air quality is good. Perfect conditions for your outdoor activities.',
        timestamp: now
      });
    }
    
    return alerts;
  }
  
  /**
   * Check if notification should be triggered based on settings and rate limiting
   */
  private shouldTriggerNotification(trigger: NotificationTrigger): boolean {
    const { userSettings, userId, type } = trigger;
    
    // Check if notifications are enabled
    if (type === 'health' && !userSettings.notificationPreferences.enableHealthAlerts) {
      return false;
    }
    
    if (type === 'forecast' && !userSettings.notificationPreferences.enableForecastAlerts) {
      return false;
    }
    
    // Manual triggers always allowed
    if (type === 'manual') {
      return true;
    }
    
    // Rate limiting based on frequency setting
    const lastTime = this.lastNotificationTime[userId] || 0;
    const now = Date.now();
    const frequency = userSettings.notificationPreferences.alertFrequency;
    
    let minInterval = 0; // immediate
    if (frequency === 'hourly') minInterval = 60 * 60 * 1000; // 1 hour
    if (frequency === 'daily') minInterval = 24 * 60 * 60 * 1000; // 24 hours
    
    return (now - lastTime) >= minInterval;
  }
  
  /**
   * Convert notification settings to user profile format
   */
  private convertSettingsToProfile(settings: NotificationSettings) {
    return {
      age_group: settings.aiPromptVariables.ageGroup,
      health_conditions: settings.aiPromptVariables.healthConditions,
      air_sensitivity: settings.aiPromptVariables.airSensitivity,
      activity_level: settings.aiPromptVariables.activityLevel,
      outdoor_activities: settings.aiPromptVariables.outdoorActivities,
      primary_location: settings.aiPromptVariables.primaryLocation,
      concerns: settings.aiPromptVariables.concerns,
      notification_preferences: [settings.notificationPreferences.alertFrequency]
    };
  }
  
  /**
   * Force trigger AI insights (bypass cache and rate limiting)
   */
  async forceGenerateAIInsights(
    airQuality: AirQualityReading,
    forecastData: AirQualityReading[],
    userSettings: NotificationSettings,
    userId: string
  ): Promise<AISummaryResponse> {
    console.log('🤖 Force generating AI insights...');
    
    // Clear cache to force regeneration
    await simpleAICache.clearCache(userId);
    
    // Generate new insights
    return this.generateAIInsights({
      type: 'manual',
      airQuality,
      forecastData,
      userSettings,
      userId
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
export type { NotificationSettings, NotificationTrigger, NotificationResult };
