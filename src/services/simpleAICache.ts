import { AISummaryResponse } from './aimlApiService';

class SimpleAICache {
  
  /**
   * Check if the cached AI insight is from today
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Get cached AI insight if it's from today
   */
  async getCachedInsight(userId: string): Promise<AISummaryResponse | null> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      console.log('🔍 Checking user profile for cached AI insight...');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('ai_insight_data, ai_insight_updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('❌ Error fetching user profile:', error);
        return null;
      }

      // Check if we have cached data
      if (!data.ai_insight_data || !data.ai_insight_updated_at) {
        console.log('📭 No cached AI insight found in user profile');
        return null;
      }

      // Check if the cached insight is from today
      const cachedDate = new Date(data.ai_insight_updated_at);
      const today = new Date();
      
      if (this.isSameDay(cachedDate, today)) {
        console.log('✅ Using cached AI insight from today - no API credits used!');
        return data.ai_insight_data as AISummaryResponse;
      } else {
        console.log('⏰ Cached AI insight is from a previous day, will generate new one');
        return null;
      }

    } catch (error) {
      console.error('❌ Error getting cached AI insight:', error);
      return null;
    }
  }

  /**
   * Save AI insight to user profile
   */
  async cacheInsight(userId: string, insight: AISummaryResponse): Promise<void> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      console.log('💾 Saving AI insight to user profile...');

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ai_insight_data: insight,
          ai_insight_updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      console.log('✅ AI insight saved to user profile successfully');

    } catch (error) {
      console.error('❌ Error caching AI insight:', error);
      // Don't throw error - caching failure shouldn't break the app
    }
  }

  /**
   * Clear cached insight (optional, for testing)
   */
  async clearCache(userId: string): Promise<void> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ai_insight_data: null,
          ai_insight_updated_at: null
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      console.log('🗑️ Cleared AI insight cache from user profile');

    } catch (error) {
      console.error('❌ Error clearing AI insight cache:', error);
    }
  }
}

const simpleAICache = new SimpleAICache();
export default simpleAICache;
