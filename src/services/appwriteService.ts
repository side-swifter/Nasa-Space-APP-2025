import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  $id: string;
  name: string;
  email: string;
  emailVerification?: boolean;
  prefs?: Record<string, any>;
}

class SupabaseAuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting current session:', error)
        return null
      }

      if (!session?.user) {
        console.log('No active session found')
        return null
      }

      return this.transformSupabaseUser(session.user)
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      return null
    }
  }

  async login(email: string, password: string): Promise<void> {
    console.log('🔐 Attempting login for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('🔐 Login response:', { data, error })

    if (error) {
      console.error('❌ Login error:', error)
      throw new Error(error.message)
    }

    if (!data.user) {
      console.error('❌ No user returned from login')
      throw new Error('Login failed - no user returned')
    }

    console.log('✅ Login successful:', data.user.email)
  }

  async createAccount(email: string, password: string, name: string, onboardingData?: Record<string, any>): Promise<void> {
    console.log('📝 Attempting signup for:', email, 'with name:', name)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          onboarding_data: onboardingData || {},
        }
      }
    })

    console.log('📝 Signup response:', { data, error })

    if (error) {
      console.error('❌ Signup error:', error)
      throw new Error(error.message)
    }

    if (!data.user) {
      console.error('❌ No user returned from signup')
      throw new Error('Account creation failed - no user returned')
    }

    // If we have onboarding data, also store it in a separate table for easier querying
    if (onboardingData && data.user) {
      try {
        console.log('💾 Attempting to save user profile with data:', onboardingData)
        
        const profileData = {
          user_id: data.user.id,
          email: email,
          full_name: name,
          onboarding_completed: true,
          age_group: onboardingData.age_group || null,
          health_conditions: onboardingData.health_conditions || [],
          air_sensitivity: onboardingData.air_sensitivity || null,
          activity_level: onboardingData.activity_level || null,
          outdoor_activities: onboardingData.outdoor_activities || [],
          primary_location: onboardingData.primary_location || null,
          notification_preferences: onboardingData.notification_preferences || [],
          concerns: onboardingData.concerns || [],
          created_at: new Date().toISOString(),
        }

        console.log('💾 Profile data to insert:', profileData)

        const { data: insertData, error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select()

        if (profileError) {
          console.error('❌ Failed to save user profile:', profileError)
          console.error('❌ Profile error details:', profileError.message, profileError.details)
          // Don't throw here - account creation was successful
        } else {
          console.log('✅ User profile saved successfully:', insertData)
        }
      } catch (profileError) {
        console.error('❌ Exception saving user profile:', profileError)
        // Don't throw here - account creation was successful
      }
    } else {
      console.log('⚠️ No onboarding data or user to save:', { onboardingData, user: data.user })
    }

    console.log('✅ Signup successful:', data.user.email)
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: userData.name,
        ...userData.prefs
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('User update failed')
    }

    return this.transformSupabaseUser(data.user)
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  private transformSupabaseUser(user: SupabaseUser): User {
    return {
      $id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      emailVerification: user.email_confirmed_at !== null,
      prefs: user.user_metadata || {},
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = this.transformSupabaseUser(session.user)
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

const authService = new SupabaseAuthService();
export default authService;
