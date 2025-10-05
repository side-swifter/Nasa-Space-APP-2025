import { AirQualityReading } from './nasaApiService';

interface UserProfile {
  age_group?: string;
  health_conditions?: string[];
  air_sensitivity?: string;
  activity_level?: string;
  outdoor_activities?: string[];
  primary_location?: string;
  notification_preferences?: string[];
  concerns?: string[];
}

interface AISummaryRequest {
  currentAirQuality: AirQualityReading;
  forecastData: AirQualityReading[];
  userProfile?: UserProfile;
  locationName?: string;
}

interface AISummaryResponse {
  warning?: string;
  outdoorActivities?: string[];
  precautions?: string[];
}

class AIMLApiService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.aimlapi.com/v1';
  
  constructor() {
    this.apiKey = import.meta.env.VITE_AIML_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ AI/ML API key not found. AI summaries will not be available.');
    }
  }

  async generateAirQualitySummary(data: AISummaryRequest): Promise<AISummaryResponse> {
    if (!this.apiKey) {
      throw new Error('AI/ML API key not configured');
    }

    try {
      console.log('🤖 Generating AI summary with Claude 4 Opus...');
      
      const prompt = this.buildPrompt(data);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-opus-4',
          messages: [
            {
              role: 'user',
              content: `You are an expert air quality analyst. Analyze this data and provide SHORT, direct advice.

${prompt}

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "warning": "Only include if AQI > 100 OR user has health conditions - one urgent sentence warning",
  "outdoorActivities": ["Activity 1 that's safe", "Activity 2 that's safe", "Activity 3 that's safe"],
  "precautions": ["Precaution 1 if going outside", "Precaution 2 if going outside"]
}

Rules:
- warning: Only if air quality is concerning for this specific user
- outdoorActivities: Only list activities that are SAFE given current conditions and user's health
- precautions: Only if user needs to take special care when going outside
- Omit any field that doesn't apply
- Keep each item under 10 words
- Be specific and actionable`
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ AI/ML API error:', response.status, errorData);
        throw new Error(`AI/ML API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('Invalid response format from AI/ML API');
      }

      const content = result.choices[0].message.content;
      
      // Try to parse as JSON, fallback to text parsing if needed
      try {
        // Clean the content - remove markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        
        const parsedResponse = JSON.parse(cleanContent);
        console.log('✅ AI summary generated successfully');
        return parsedResponse;
      } catch (parseError) {
        console.warn('⚠️ Failed to parse JSON response, using fallback parsing');
        console.log('Raw content:', content);
        return this.parseTextResponse(content);
      }

    } catch (error) {
      console.error('❌ Error generating AI summary:', error);
      throw error;
    }
  }

  private buildPrompt(data: AISummaryRequest): string {
    const { currentAirQuality, forecastData, userProfile, locationName } = data;
    
    let prompt = `Current Air Quality Data for ${locationName || 'your location'}:
- AQI: ${currentAirQuality.aqi}
- PM2.5: ${currentAirQuality.pm25} μg/m³
- PM10: ${currentAirQuality.pm10} μg/m³
- NO₂: ${currentAirQuality.no2} ppb
- O₃: ${currentAirQuality.o3} ppb
- SO₂: ${currentAirQuality.so2} ppb
- CO: ${currentAirQuality.co} ppm

24-Hour Forecast Trend:
`;

    // Add forecast trend
    if (forecastData.length > 0) {
      const avgForecastAQI = forecastData.reduce((sum, reading) => sum + reading.aqi, 0) / forecastData.length;
      const trend = avgForecastAQI > currentAirQuality.aqi ? 'worsening' : 
                   avgForecastAQI < currentAirQuality.aqi ? 'improving' : 'stable';
      prompt += `- Average forecast AQI: ${Math.round(avgForecastAQI)} (${trend})\n`;
    }

    // Add user profile information
    if (userProfile) {
      prompt += `\nUser Profile:`;
      
      if (userProfile.age_group) {
        prompt += `\n- Age group: ${userProfile.age_group}`;
      }
      
      if (userProfile.health_conditions && userProfile.health_conditions.length > 0) {
        prompt += `\n- Health conditions: ${userProfile.health_conditions.join(', ')}`;
      }
      
      if (userProfile.air_sensitivity) {
        prompt += `\n- Air sensitivity: ${userProfile.air_sensitivity}`;
      }
      
      if (userProfile.activity_level) {
        prompt += `\n- Activity level: ${userProfile.activity_level}`;
      }
      
      if (userProfile.outdoor_activities && userProfile.outdoor_activities.length > 0) {
        prompt += `\n- Outdoor activities: ${userProfile.outdoor_activities.join(', ')}`;
      }
      
      if (userProfile.primary_location) {
        prompt += `\n- Location type: ${userProfile.primary_location}`;
      }
      
      if (userProfile.concerns && userProfile.concerns.length > 0) {
        prompt += `\n- Main concerns: ${userProfile.concerns.join(', ')}`;
      }
    }

    prompt += `\n\nPlease provide a personalized air quality summary and recommendations in JSON format.`;
    
    return prompt;
  }

  private parseTextResponse(content: string): AISummaryResponse {
    // Fallback text parsing if JSON parsing fails
    console.log('Attempting to parse text response:', content);
    
    // Try to extract JSON-like content from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse extracted JSON');
      }
    }
    
    // If all else fails, provide a simple response
    return {
      outdoorActivities: [
        'Light walking',
        'Outdoor sitting',
        'Brief errands'
      ],
      precautions: [
        'Monitor how you feel',
        'Come inside if uncomfortable'
      ]
    };
  }

  // Method to get user profile from Supabase
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('⚠️ Could not fetch user profile:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('⚠️ Error fetching user profile:', error);
      return null;
    }
  }

  // Check if API is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

const aimlApiService = new AIMLApiService();
export default aimlApiService;
export type { AISummaryResponse, UserProfile };
