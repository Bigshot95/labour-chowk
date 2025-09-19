import { supabase } from './supabase'
import { Database } from './database.types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

export interface AuthUser extends User {
  worker_profile?: Database['public']['Tables']['workers']['Row']
}

export async function signUpWithPhone(phoneNumber: string, password: string, userData: Omit<UserInsert, 'id'>) {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone: phoneNumber,
      password: password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          phone_number: phoneNumber,
          ...userData
        }])
        .select()
        .single()

      if (profileError) throw profileError

      return { user: userProfile, session: authData.session }
    }

    throw new Error('User creation failed')
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export async function signInWithPhone(phoneNumber: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: phoneNumber,
      password: password,
    })

    if (error) throw error

    if (data.user) {
      // Fetch user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          workers (*)
        `)
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      return { user: userProfile, session: data.session }
    }

    throw new Error('Sign in failed')
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: userProfile, error } = await supabase
      .from('users')
      .select(`
        *,
        workers (*)
      `)
      .eq('id', user.id)
      .single()

    if (error) throw error

    return userProfile as AuthUser
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export async function verifyPhoneOTP(phone: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('OTP verification error:', error)
    throw error
  }
}