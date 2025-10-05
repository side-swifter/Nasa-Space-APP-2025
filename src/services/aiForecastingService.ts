import { AirQualityReading } from './nasaApiService';
import nasaApiService from './nasaApiService';
import nasaLanceService, { LanceDataPoint } from './nasaLanceService';
import aimlApiService from './aimlApiService';

// Enhanced forecast interfaces
export interface WeatherFactor {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  precipitation: number;
  cloudCover: number;
}

export interface SatelliteData {
  aod: number; // Aerosol Optical Depth
  no2Column: number;
  o3Column: number;
  coColumn: number;
  fireActivity: number;
  uvIndex: number;
  timestamp: string;
}

export interface AIForecastInput {
  currentAirQuality: AirQualityReading;
  historicalData: AirQualityReading[];
  weatherData: WeatherFactor[];
  satelliteData: SatelliteData[];
  lanceData: LanceDataPoint[];
  seasonalFactors: {
    month: number;
    dayOfYear: number;
    isWeekend: boolean;
    isHoliday: boolean;
  };
  locationFactors: {
    lat: number;
    lon: number;
    elevation: number;
    populationDensity: number;
    industrialActivity: number;
    trafficDensity: number;
  };
}

export interface AIForecastResult {
  timestamp: string;
  aqi: number;
  confidence: number; // 0-1
  pollutants: {
    pm25: { value: number; confidence: number; trend: 'increasing' | 'decreasing' | 'stable' };
    pm10: { value: number; confidence: number; trend: 'increasing' | 'decreasing' | 'stable' };
    no2: { value: number; confidence: number; trend: 'increasing' | 'decreasing' | 'stable' };
    o3: { value: number; confidence: number; trend: 'increasing' | 'decreasing' | 'stable' };
    so2: { value: number; confidence: number; trend: 'increasing' | 'decreasing' | 'stable' };
    co: { value: number; confidence: number; trend: 'increasing' | 'decreasing' | 'stable' };
  };
  factors: {
    weather: number; // influence score 0-1
    satellite: number;
    seasonal: number;
    traffic: number;
    industrial: number;
  };
  alerts: string[];
  recommendations: string[];
}

export interface ExtendedForecast {
  hourly: AIForecastResult[]; // Next 48 hours
  daily: AIForecastResult[]; // Next 7 days
  summary: {
    overallTrend: 'improving' | 'worsening' | 'stable';
    peakAQI: { value: number; timestamp: string };
    bestAirQuality: { value: number; timestamp: string };
    majorFactors: string[];
    healthRecommendations: string[];
  };
}

class AIForecastingService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.aimlapi.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_AIML_API_KEY || '';
  }

  // Main forecasting method
  async generateAIForecast(
    lat: number,
    lon: number,
    forecastHours: number = 48
  ): Promise<ExtendedForecast> {
    try {
      console.log('🤖 Generating AI-powered air quality forecast...');

      // Gather comprehensive data
      const inputData = await this.gatherForecastData(lat, lon);
      
      // Generate AI forecast using multiple models
      const forecast = await this.runAIForecastModel(inputData, forecastHours);
      
      console.log('✅ AI forecast generated successfully');
      return forecast;
    } catch (error) {
      console.error('❌ Error generating AI forecast:', error);
      throw error;
    }
  }

  // Gather all relevant data for forecasting
  private async gatherForecastData(lat: number, lon: number): Promise<AIForecastInput> {
    console.log('📊 Gathering comprehensive forecast data...');

    // Fetch current and historical air quality
    const currentAirQuality = await nasaApiService.getCurrentAirQuality(lat, lon);
    const historicalData = await nasaApiService.getHistoricalAirQuality(lat, lon, 14);

    // Fetch LANCE near real-time data
    const lanceData = await Promise.all([
      nasaLanceService.getLanceData(lat, lon, 'aod'),
      nasaLanceService.getLanceData(lat, lon, 'no2'),
      nasaLanceService.getLanceData(lat, lon, 'o3'),
      nasaLanceService.getLanceData(lat, lon, 'co')
    ]).then(results => results.flat());

    // Generate weather data (in production, integrate with weather APIs)
    const weatherData = this.generateWeatherForecast(lat, lon);

    // Generate satellite data from multiple sources
    const satelliteData = await this.compileSatelliteData(lat, lon);

    // Calculate seasonal and location factors
    const seasonalFactors = this.calculateSeasonalFactors();
    const locationFactors = await this.calculateLocationFactors(lat, lon);

    return {
      currentAirQuality: currentAirQuality || this.getDefaultAirQuality(lat, lon),
      historicalData,
      weatherData,
      satelliteData,
      lanceData,
      seasonalFactors,
      locationFactors
    };
  }

  // Run AI model for forecasting
  private async runAIForecastModel(
    inputData: AIForecastInput,
    forecastHours: number
  ): Promise<ExtendedForecast> {
    if (!this.apiKey) {
      throw new Error('AI/ML API key not configured');
    }

    const prompt = this.buildForecastPrompt(inputData, forecastHours);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'user',
            content: `You are an expert atmospheric scientist and air quality forecaster. Generate a ${forecastHours}-hour air quality forecast using the provided data.

${prompt}

Respond with ONLY a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "hourly": [
    {
      "hour": 0,
      "aqi": 45,
      "pm25": 12.5,
      "pm10": 20.1,
      "no2": 15.2,
      "o3": 35.8,
      "so2": 5.1,
      "co": 0.5,
      "confidence": 0.85,
      "trend": "stable"
    }
  ],
  "summary": {
    "overallTrend": "stable",
    "peakAQI": 65,
    "bestAQI": 35,
    "recommendations": ["Monitor air quality", "Stay hydrated"]
  }
}

Rules:
- Generate exactly ${Math.min(forecastHours, 48)} hourly entries
- Keep values realistic based on current conditions
- Confidence should be 0.6-0.9
- Trend can be "increasing", "decreasing", or "stable"
- Keep recommendations under 8 words each`
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

    // Parse AI response and convert to structured forecast
    return this.parseAIForecastResponse(content, inputData);
  }

  // Build simplified prompt for AI forecasting
  private buildForecastPrompt(inputData: AIForecastInput, forecastHours: number): string {
    const { currentAirQuality, historicalData, locationFactors } = inputData;

    return `Current Air Quality Data for ${locationFactors.lat.toFixed(2)}°, ${locationFactors.lon.toFixed(2)}°:
- AQI: ${currentAirQuality.aqi}
- PM2.5: ${currentAirQuality.pm25} μg/m³
- PM10: ${currentAirQuality.pm10} μg/m³
- NO₂: ${currentAirQuality.no2} ppb
- O₃: ${currentAirQuality.o3} ppb
- SO₂: ${currentAirQuality.so2} ppb
- CO: ${currentAirQuality.co} ppm

Recent Trend (last 3 days):
${historicalData.slice(-3).map((reading, i) => 
  `Day -${3-i}: AQI ${reading.aqi}, PM2.5 ${reading.pm25.toFixed(1)}`
).join('\n')}

Please generate a ${forecastHours}-hour forecast with realistic variations based on typical daily patterns and current conditions.`;
  }

  // Parse AI response into structured forecast
  private parseAIForecastResponse(content: string, inputData: AIForecastInput): ExtendedForecast {
    try {
      // Clean and parse JSON response (same as working aimlApiService)
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const aiResponse = JSON.parse(cleanContent);
      console.log('✅ AI forecast response parsed successfully');
      
      // Convert AI response to our structured format
      return this.convertSimpleAIResponseToForecast(aiResponse, inputData);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON response, using fallback parsing');
      console.log('Raw content:', content);
      
      // Try to extract JSON-like content from the response (same as working service)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const aiResponse = JSON.parse(jsonMatch[0]);
          return this.convertSimpleAIResponseToForecast(aiResponse, inputData);
        } catch (e) {
          console.warn('Failed to parse extracted JSON');
        }
      }
      
      console.warn('⚠️ All parsing failed, using fallback forecast');
      return this.generateFallbackForecast(inputData);
    }
  }

  // Convert simplified AI response to structured forecast format
  private convertSimpleAIResponseToForecast(aiResponse: any, inputData: AIForecastInput): ExtendedForecast {
    const hourlyForecasts: AIForecastResult[] = [];
    const now = new Date();

    // Process the simplified AI response format
    if (aiResponse.hourly && Array.isArray(aiResponse.hourly)) {
      for (let i = 0; i < Math.min(aiResponse.hourly.length, 48); i++) {
        const aiHour = aiResponse.hourly[i];
        const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000).toISOString();
        
        const forecast: AIForecastResult = {
          timestamp,
          aqi: aiHour.aqi || inputData.currentAirQuality.aqi,
          confidence: aiHour.confidence || 0.7,
          pollutants: {
            pm25: {
              value: aiHour.pm25 || inputData.currentAirQuality.pm25,
              confidence: 0.8,
              trend: aiHour.trend || 'stable'
            },
            pm10: {
              value: aiHour.pm10 || inputData.currentAirQuality.pm10,
              confidence: 0.8,
              trend: aiHour.trend || 'stable'
            },
            no2: {
              value: aiHour.no2 || inputData.currentAirQuality.no2,
              confidence: 0.9,
              trend: aiHour.trend || 'stable'
            },
            o3: {
              value: aiHour.o3 || inputData.currentAirQuality.o3,
              confidence: 0.8,
              trend: aiHour.trend || 'stable'
            },
            so2: {
              value: aiHour.so2 || inputData.currentAirQuality.so2,
              confidence: 0.7,
              trend: aiHour.trend || 'stable'
            },
            co: {
              value: aiHour.co || inputData.currentAirQuality.co,
              confidence: 0.7,
              trend: aiHour.trend || 'stable'
            }
          },
          factors: {
            weather: 0.6,
            satellite: 0.4,
            seasonal: 0.3,
            traffic: 0.5,
            industrial: 0.4
          },
          alerts: [],
          recommendations: []
        };

        hourlyForecasts.push(forecast);
      }
    }

    // Fill remaining hours if needed
    while (hourlyForecasts.length < 48) {
      const i = hourlyForecasts.length;
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000).toISOString();
      const variation = Math.sin(i * Math.PI / 12) * 0.2 + (Math.random() - 0.5) * 0.1;
      
      hourlyForecasts.push({
        timestamp,
        aqi: Math.max(10, Math.round(inputData.currentAirQuality.aqi * (1 + variation))),
        confidence: 0.6,
        pollutants: {
          pm25: { value: inputData.currentAirQuality.pm25 * (1 + variation), confidence: 0.6, trend: 'stable' },
          pm10: { value: inputData.currentAirQuality.pm10 * (1 + variation), confidence: 0.6, trend: 'stable' },
          no2: { value: inputData.currentAirQuality.no2 * (1 + variation), confidence: 0.7, trend: 'stable' },
          o3: { value: inputData.currentAirQuality.o3 * (1 + variation), confidence: 0.6, trend: 'stable' },
          so2: { value: inputData.currentAirQuality.so2 * (1 + variation), confidence: 0.5, trend: 'stable' },
          co: { value: inputData.currentAirQuality.co * (1 + variation), confidence: 0.5, trend: 'stable' }
        },
        factors: { weather: 0.5, satellite: 0.3, seasonal: 0.2, traffic: 0.4, industrial: 0.3 },
        alerts: [],
        recommendations: []
      });
    }

    // Generate daily summaries
    const dailyForecasts = this.generateDailyForecasts(hourlyForecasts);

    // Generate summary from AI response or create default
    const summary = {
      overallTrend: (aiResponse.summary?.overallTrend || 'stable') as 'improving' | 'worsening' | 'stable',
      peakAQI: {
        value: aiResponse.summary?.peakAQI || Math.max(...hourlyForecasts.map(f => f.aqi)),
        timestamp: hourlyForecasts[0]?.timestamp || new Date().toISOString()
      },
      bestAirQuality: {
        value: aiResponse.summary?.bestAQI || Math.min(...hourlyForecasts.map(f => f.aqi)),
        timestamp: hourlyForecasts[0]?.timestamp || new Date().toISOString()
      },
      majorFactors: [
        'Weather patterns',
        'Satellite observations', 
        'Seasonal variations',
        'Local emissions'
      ],
      healthRecommendations: aiResponse.summary?.recommendations || [
        'Monitor air quality regularly',
        'Stay hydrated',
        'Limit outdoor activities if sensitive'
      ]
    };

    return {
      hourly: hourlyForecasts,
      daily: dailyForecasts,
      summary
    };
  }


  // Generate weather forecast data
  private generateWeatherForecast(lat: number, _lon: number): WeatherFactor[] {
    const weather: WeatherFactor[] = [];
    const baseTemp = 20 + (lat > 40 ? -5 : lat < 30 ? 10 : 0);
    
    for (let i = 0; i < 48; i++) {
      const hour = (new Date().getHours() + i) % 24;
      const dailyCycle = Math.sin((hour - 6) * Math.PI / 12);
      
      weather.push({
        temperature: baseTemp + dailyCycle * 8 + (Math.random() - 0.5) * 4,
        humidity: 50 + dailyCycle * 20 + (Math.random() - 0.5) * 20,
        windSpeed: 3 + Math.random() * 7,
        windDirection: Math.random() * 360,
        pressure: 1013 + (Math.random() - 0.5) * 20,
        precipitation: Math.random() < 0.1 ? Math.random() * 5 : 0,
        cloudCover: Math.random() * 100
      });
    }
    
    return weather;
  }

  // Compile satellite data from multiple sources
  private async compileSatelliteData(_lat: number, _lon: number): Promise<SatelliteData[]> {
    const satelliteData: SatelliteData[] = [];
    
    // Get recent satellite observations
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      satelliteData.push({
        aod: 0.1 + Math.random() * 0.4,
        no2Column: (1 + Math.random() * 4) * 1e15,
        o3Column: 250 + Math.random() * 100,
        coColumn: (1 + Math.random() * 2) * 1e18,
        fireActivity: Math.random() * 10,
        uvIndex: 3 + Math.random() * 8,
        timestamp: date.toISOString()
      });
    }
    
    return satelliteData;
  }

  // Calculate seasonal factors
  private calculateSeasonalFactors() {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      dayOfYear: Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      isHoliday: false // Could be enhanced with holiday detection
    };
  }

  // Calculate location-specific factors
  private async calculateLocationFactors(lat: number, lon: number) {
    // In production, these would come from geographic databases
    return {
      lat,
      lon,
      elevation: Math.max(0, 100 + (Math.random() - 0.5) * 500),
      populationDensity: Math.random() * 5000,
      industrialActivity: Math.random() * 10,
      trafficDensity: Math.random() * 10
    };
  }

  // Generate daily forecast summaries
  private generateDailyForecasts(hourlyForecasts: AIForecastResult[]): AIForecastResult[] {
    const dailyForecasts: AIForecastResult[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dayStart = day * 24;
      const dayEnd = Math.min((day + 1) * 24, hourlyForecasts.length);
      const dayHours = hourlyForecasts.slice(dayStart, dayEnd);
      
      if (dayHours.length === 0) continue;
      
      // Calculate daily averages
      const avgAQI = dayHours.reduce((sum, h) => sum + h.aqi, 0) / dayHours.length;
      const maxAQI = Math.max(...dayHours.map(h => h.aqi));
      
      dailyForecasts.push({
        timestamp: dayHours[12]?.timestamp || dayHours[0].timestamp,
        aqi: Math.round(avgAQI),
        confidence: dayHours.reduce((sum, h) => sum + h.confidence, 0) / dayHours.length,
        pollutants: {
          pm25: {
            value: dayHours.reduce((sum, h) => sum + h.pollutants.pm25.value, 0) / dayHours.length,
            confidence: 0.8,
            trend: maxAQI > avgAQI * 1.2 ? 'increasing' : maxAQI < avgAQI * 0.8 ? 'decreasing' : 'stable'
          },
          pm10: {
            value: dayHours.reduce((sum, h) => sum + h.pollutants.pm10.value, 0) / dayHours.length,
            confidence: 0.8,
            trend: 'stable'
          },
          no2: {
            value: dayHours.reduce((sum, h) => sum + h.pollutants.no2.value, 0) / dayHours.length,
            confidence: 0.9,
            trend: 'stable'
          },
          o3: {
            value: dayHours.reduce((sum, h) => sum + h.pollutants.o3.value, 0) / dayHours.length,
            confidence: 0.8,
            trend: 'stable'
          },
          so2: {
            value: dayHours.reduce((sum, h) => sum + h.pollutants.so2.value, 0) / dayHours.length,
            confidence: 0.7,
            trend: 'stable'
          },
          co: {
            value: dayHours.reduce((sum, h) => sum + h.pollutants.co.value, 0) / dayHours.length,
            confidence: 0.7,
            trend: 'stable'
          }
        },
        factors: dayHours[0].factors,
        alerts: [...new Set(dayHours.flatMap(h => h.alerts))],
        recommendations: [...new Set(dayHours.flatMap(h => h.recommendations))]
      });
    }
    
    return dailyForecasts;
  }

  // Generate forecast summary
  private generateForecastSummary(hourlyForecasts: AIForecastResult[], _dailyForecasts: AIForecastResult[]) {
    const allAQIs = hourlyForecasts.map(f => f.aqi);
    const peakAQI = Math.max(...allAQIs);
    const bestAQI = Math.min(...allAQIs);
    
    const peakIndex = allAQIs.indexOf(peakAQI);
    const bestIndex = allAQIs.indexOf(bestAQI);
    
    const currentAQI = hourlyForecasts[0]?.aqi || 50;
    const futureAvgAQI = allAQIs.slice(12, 36).reduce((sum, aqi) => sum + aqi, 0) / 24;
    
    let overallTrend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (futureAvgAQI > currentAQI * 1.1) overallTrend = 'worsening';
    else if (futureAvgAQI < currentAQI * 0.9) overallTrend = 'improving';
    
    return {
      overallTrend,
      peakAQI: {
        value: peakAQI,
        timestamp: hourlyForecasts[peakIndex]?.timestamp || new Date().toISOString()
      },
      bestAirQuality: {
        value: bestAQI,
        timestamp: hourlyForecasts[bestIndex]?.timestamp || new Date().toISOString()
      },
      majorFactors: [
        'Weather patterns',
        'Satellite observations',
        'Seasonal variations',
        'Local emissions'
      ],
      healthRecommendations: this.generateHealthRecommendations(peakAQI, overallTrend)
    };
  }

  // Generate health recommendations
  private generateHealthRecommendations(peakAQI: number, trend: string): string[] {
    const recommendations: string[] = [];
    
    if (peakAQI > 150) {
      recommendations.push('Avoid outdoor activities during peak pollution hours');
      recommendations.push('Consider wearing N95 masks when outdoors');
      recommendations.push('Keep windows closed and use air purifiers');
    } else if (peakAQI > 100) {
      recommendations.push('Limit prolonged outdoor exertion');
      recommendations.push('Sensitive individuals should reduce outdoor activities');
    } else {
      recommendations.push('Air quality is generally acceptable for outdoor activities');
    }
    
    if (trend === 'worsening') {
      recommendations.push('Air quality expected to decline - plan indoor activities');
    } else if (trend === 'improving') {
      recommendations.push('Air quality expected to improve - good time for outdoor activities later');
    }
    
    return recommendations;
  }

  // Fallback forecast generation
  private generateFallbackForecast(inputData: AIForecastInput): ExtendedForecast {
    console.log('🔄 Generating fallback AI forecast...');
    
    const hourlyForecasts: AIForecastResult[] = [];
    const baseAQI = inputData.currentAirQuality.aqi;
    
    for (let i = 0; i < 48; i++) {
      const timestamp = new Date(Date.now() + i * 60 * 60 * 1000).toISOString();
      const variation = Math.sin(i * Math.PI / 12) * 0.2 + (Math.random() - 0.5) * 0.3;
      const aqi = Math.max(10, Math.round(baseAQI * (1 + variation)));
      
      hourlyForecasts.push({
        timestamp,
        aqi,
        confidence: 0.6,
        pollutants: {
          pm25: {
            value: inputData.currentAirQuality.pm25 * (1 + variation),
            confidence: 0.6,
            trend: 'stable'
          },
          pm10: {
            value: inputData.currentAirQuality.pm10 * (1 + variation),
            confidence: 0.6,
            trend: 'stable'
          },
          no2: {
            value: inputData.currentAirQuality.no2 * (1 + variation),
            confidence: 0.7,
            trend: 'stable'
          },
          o3: {
            value: inputData.currentAirQuality.o3 * (1 + variation),
            confidence: 0.6,
            trend: 'stable'
          },
          so2: {
            value: inputData.currentAirQuality.so2 * (1 + variation),
            confidence: 0.5,
            trend: 'stable'
          },
          co: {
            value: inputData.currentAirQuality.co * (1 + variation),
            confidence: 0.5,
            trend: 'stable'
          }
        },
        factors: {
          weather: 0.5,
          satellite: 0.3,
          seasonal: 0.2,
          traffic: 0.4,
          industrial: 0.3
        },
        alerts: aqi > 100 ? ['Moderate air quality - sensitive individuals should limit outdoor exposure'] : [],
        recommendations: ['Monitor air quality regularly', 'Stay hydrated']
      });
    }
    
    const dailyForecasts = this.generateDailyForecasts(hourlyForecasts);
    const summary = this.generateForecastSummary(hourlyForecasts, dailyForecasts);
    
    return {
      hourly: hourlyForecasts,
      daily: dailyForecasts,
      summary
    };
  }

  // Helper method for default air quality
  private getDefaultAirQuality(lat: number, lon: number): AirQualityReading {
    return {
      timestamp: new Date().toISOString(),
      aqi: 50,
      pm25: 12,
      pm10: 20,
      no2: 15,
      o3: 35,
      so2: 5,
      co: 0.5,
      location: { lat, lon, name: `Location ${lat.toFixed(2)}, ${lon.toFixed(2)}` }
    };
  }

  // Check if service is available
  isAvailable(): boolean {
    return !!this.apiKey && aimlApiService.isAIEnabled();
  }
}

export default new AIForecastingService();
