import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Brain, Info, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

interface NotificationConfigProps {
  onSettingsChange?: (settings: NotificationSettings) => void;
  onTriggerAI?: () => void;
}

const defaultSettings: NotificationSettings = {
  aiPromptVariables: {
    healthConditions: [],
    ageGroup: 'adult',
    airSensitivity: 'normal',
    activityLevel: 'moderate',
    outdoorActivities: [],
    primaryLocation: 'urban',
    concerns: [],
    notificationThresholds: {
      aqiWarning: 100,
      pm25Warning: 35,
      ozoneWarning: 70
    }
  },
  notificationPreferences: {
    enableHealthAlerts: true,
    enableAIInsights: true,
    enableForecastAlerts: true,
    alertFrequency: 'immediate',
    customPromptTemplate: ''
  }
};

const NotificationConfig: React.FC<NotificationConfigProps> = ({ 
  onSettingsChange, 
  onTriggerAI 
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { user } = useAuth();

  // Load settings from user profile on mount
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { supabase } = await import('../lib/supabase');
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.$id)
          .single();

        if (!error && data) {
          const userSettings: NotificationSettings = {
            aiPromptVariables: {
              healthConditions: data.health_conditions || [],
              ageGroup: data.age_group || 'adult',
              airSensitivity: data.air_sensitivity || 'normal',
              activityLevel: data.activity_level || 'moderate',
              outdoorActivities: data.outdoor_activities || [],
              primaryLocation: data.primary_location || 'urban',
              concerns: data.concerns || [],
              notificationThresholds: data.notification_thresholds || defaultSettings.aiPromptVariables.notificationThresholds
            },
            notificationPreferences: {
              enableHealthAlerts: data.enable_health_alerts ?? true,
              enableAIInsights: data.enable_ai_insights ?? true,
              enableForecastAlerts: data.enable_forecast_alerts ?? true,
              alertFrequency: data.alert_frequency || 'immediate',
              customPromptTemplate: data.custom_prompt_template || ''
            }
          };
          setSettings(userSettings);
        }
      } catch (error) {
        console.warn('Failed to load user notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { supabase } = await import('../lib/supabase');
      
      const updateData = {
        health_conditions: settings.aiPromptVariables.healthConditions,
        age_group: settings.aiPromptVariables.ageGroup,
        air_sensitivity: settings.aiPromptVariables.airSensitivity,
        activity_level: settings.aiPromptVariables.activityLevel,
        outdoor_activities: settings.aiPromptVariables.outdoorActivities,
        primary_location: settings.aiPromptVariables.primaryLocation,
        concerns: settings.aiPromptVariables.concerns,
        notification_thresholds: settings.aiPromptVariables.notificationThresholds,
        enable_health_alerts: settings.notificationPreferences.enableHealthAlerts,
        enable_ai_insights: settings.notificationPreferences.enableAIInsights,
        enable_forecast_alerts: settings.notificationPreferences.enableForecastAlerts,
        alert_frequency: settings.notificationPreferences.alertFrequency,
        custom_prompt_template: settings.notificationPreferences.customPromptTemplate,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.$id,
          ...updateData
        });

      if (error) throw error;

      onSettingsChange?.(settings);
      console.log('✅ Notification settings saved successfully');
    } catch (error) {
      console.error('❌ Failed to save notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerAI = () => {
    onTriggerAI?.();
  };

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newSettings;
    });
  };

  const addArrayItem = (path: string, item: string) => {
    if (!item.trim()) return;
    
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]] as string[];
      if (!array.includes(item.trim())) {
        current[keys[keys.length - 1]] = [...array, item.trim()];
      }
      
      return newSettings;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]] as string[];
      current[keys[keys.length - 1]] = array.filter((_, i) => i !== index);
      
      return newSettings;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-kraken-beige animate-spin mr-3" />
          <span className="text-kraken-light font-mono">Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-kraken-beige" />
          <h3 className="text-xl font-bold text-kraken-beige font-mono">
            Notification & AI Settings
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerAI}
            className="flex items-center space-x-2 px-3 py-2 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded-lg font-mono text-sm hover:bg-opacity-30 transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>Trigger AI</span>
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-kraken-red text-white rounded-lg font-mono text-sm hover:bg-opacity-80 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-kraken-light font-mono mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Preferences
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notificationPreferences.enableHealthAlerts}
              onChange={(e) => updateSettings('notificationPreferences.enableHealthAlerts', e.target.checked)}
              className="w-4 h-4 text-kraken-red bg-kraken-dark border-kraken-beige rounded focus:ring-kraken-red"
            />
            <span className="text-kraken-light font-mono text-sm">Enable Health Alerts</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notificationPreferences.enableAIInsights}
              onChange={(e) => updateSettings('notificationPreferences.enableAIInsights', e.target.checked)}
              className="w-4 h-4 text-kraken-red bg-kraken-dark border-kraken-beige rounded focus:ring-kraken-red"
            />
            <span className="text-kraken-light font-mono text-sm">Enable AI Insights</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notificationPreferences.enableForecastAlerts}
              onChange={(e) => updateSettings('notificationPreferences.enableForecastAlerts', e.target.checked)}
              className="w-4 h-4 text-kraken-red bg-kraken-dark border-kraken-beige rounded focus:ring-kraken-red"
            />
            <span className="text-kraken-light font-mono text-sm">Enable Forecast Alerts</span>
          </label>
          
          <div>
            <label className="block text-kraken-light font-mono text-sm mb-2">Alert Frequency</label>
            <select
              value={settings.notificationPreferences.alertFrequency}
              onChange={(e) => updateSettings('notificationPreferences.alertFrequency', e.target.value)}
              className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
            >
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Prompt Variables */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-kraken-light font-mono mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          AI Prompt Variables
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Health Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">Age Group</label>
              <select
                value={settings.aiPromptVariables.ageGroup}
                onChange={(e) => updateSettings('aiPromptVariables.ageGroup', e.target.value)}
                className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
              >
                <option value="child">Child (0-12)</option>
                <option value="teen">Teen (13-17)</option>
                <option value="adult">Adult (18-64)</option>
                <option value="senior">Senior (65+)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">Air Sensitivity</label>
              <select
                value={settings.aiPromptVariables.airSensitivity}
                onChange={(e) => updateSettings('aiPromptVariables.airSensitivity', e.target.value)}
                className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
              >
                <option value="low">Low Sensitivity</option>
                <option value="normal">Normal Sensitivity</option>
                <option value="high">High Sensitivity</option>
                <option value="very_high">Very High Sensitivity</option>
              </select>
            </div>
            
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">Activity Level</label>
              <select
                value={settings.aiPromptVariables.activityLevel}
                onChange={(e) => updateSettings('aiPromptVariables.activityLevel', e.target.value)}
                className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="high">High Activity</option>
                <option value="athlete">Athlete Level</option>
              </select>
            </div>
            
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">Primary Location</label>
              <select
                value={settings.aiPromptVariables.primaryLocation}
                onChange={(e) => updateSettings('aiPromptVariables.primaryLocation', e.target.value)}
                className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
              >
                <option value="urban">Urban</option>
                <option value="suburban">Suburban</option>
                <option value="rural">Rural</option>
                <option value="industrial">Industrial Area</option>
                <option value="coastal">Coastal</option>
              </select>
            </div>
          </div>
          
          {/* Alert Thresholds */}
          <div className="space-y-4">
            <h5 className="text-md font-bold text-kraken-beige font-mono">Alert Thresholds</h5>
            
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">AQI Warning Level</label>
              <input
                type="number"
                value={settings.aiPromptVariables.notificationThresholds.aqiWarning}
                onChange={(e) => updateSettings('aiPromptVariables.notificationThresholds.aqiWarning', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
                min="0"
                max="500"
              />
            </div>
            
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">PM2.5 Warning (μg/m³)</label>
              <input
                type="number"
                value={settings.aiPromptVariables.notificationThresholds.pm25Warning}
                onChange={(e) => updateSettings('aiPromptVariables.notificationThresholds.pm25Warning', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
                min="0"
                max="500"
              />
            </div>
            
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">Ozone Warning (ppb)</label>
              <input
                type="number"
                value={settings.aiPromptVariables.notificationThresholds.ozoneWarning}
                onChange={(e) => updateSettings('aiPromptVariables.notificationThresholds.ozoneWarning', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
                min="0"
                max="200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Arrays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Health Conditions */}
        <div>
          <label className="block text-kraken-light font-mono text-sm mb-2">Health Conditions</label>
          <div className="space-y-2">
            {settings.aiPromptVariables.healthConditions.map((condition, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1 px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm">
                  {condition}
                </span>
                <button
                  onClick={() => removeArrayItem('aiPromptVariables.healthConditions', index)}
                  className="px-2 py-2 bg-kraken-red text-white rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Add health condition..."
              className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addArrayItem('aiPromptVariables.healthConditions', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
        
        {/* Outdoor Activities */}
        <div>
          <label className="block text-kraken-light font-mono text-sm mb-2">Outdoor Activities</label>
          <div className="space-y-2">
            {settings.aiPromptVariables.outdoorActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1 px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm">
                  {activity}
                </span>
                <button
                  onClick={() => removeArrayItem('aiPromptVariables.outdoorActivities', index)}
                  className="px-2 py-2 bg-kraken-red text-white rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Add outdoor activity..."
              className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addArrayItem('aiPromptVariables.outdoorActivities', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="border-t border-kraken-beige border-opacity-20 pt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-kraken-beige font-mono text-sm hover:text-kraken-light transition-colors mb-4"
        >
          <Settings className="w-4 h-4" />
          <span>Advanced Settings</span>
          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {showAdvanced && (
          <div className="space-y-4">
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">Custom AI Prompt Template</label>
              <textarea
                value={settings.notificationPreferences.customPromptTemplate}
                onChange={(e) => updateSettings('notificationPreferences.customPromptTemplate', e.target.value)}
                placeholder="Enter custom prompt template (leave empty for default)..."
                className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none h-24 resize-none"
              />
              <p className="text-xs text-kraken-light opacity-60 font-mono mt-1">
                Use variables like {'{aqiValue}'}, {'{userAge}'}, {'{healthConditions}'} in your template
              </p>
            </div>
            
            {/* Concerns */}
            <div>
              <label className="block text-kraken-light font-mono text-sm mb-2">Primary Concerns</label>
              <div className="space-y-2">
                {settings.aiPromptVariables.concerns.map((concern, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="flex-1 px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm">
                      {concern}
                    </span>
                    <button
                      onClick={() => removeArrayItem('aiPromptVariables.concerns', index)}
                      className="px-2 py-2 bg-kraken-red text-white rounded-lg hover:bg-opacity-80 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add concern..."
                  className="w-full px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg text-kraken-light font-mono text-sm focus:border-kraken-beige focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('aiPromptVariables.concerns', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-kraken-beige bg-opacity-10 rounded-lg border border-kraken-beige border-opacity-30">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-kraken-beige flex-shrink-0 mt-0.5" />
          <div className="text-sm text-kraken-light font-mono">
            <p className="mb-2">
              <strong>AI Prompt Variables:</strong> These settings customize how the AI generates health recommendations and alerts based on your personal profile.
            </p>
            <p>
              <strong>Trigger AI:</strong> Use the "Trigger AI" button to manually generate new insights with your current settings. AI insights are normally generated automatically when air quality data changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationConfig;
