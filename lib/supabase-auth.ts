// Mock authentication service for development
export interface AuthUser {
  id: string
  user_type: 'buyer' | 'worker' | 'admin'
  full_name: string
  phone_number: string
  email?: string
  verification_status: string
}

export async function signUpWithPhone(phoneNumber: string, password: string, userData: any) {
  console.log('Mock signup:', { phoneNumber, userData })
  
  // Mock successful signup
  const mockUser: AuthUser = {
    id: 'mock-user-' + Date.now(),
    user_type: userData.user_type,
    full_name: userData.full_name,
    phone_number: phoneNumber,
    email: userData.email,
    verification_status: 'pending'
  }
  
  return {
    user: mockUser,
    session: { access_token: 'mock-token' }
  }
}

export async function signInWithPhone(phoneNumber: string, password: string) {
  console.log('Mock signin:', { phoneNumber })
  
  // Mock successful signin
  const mockUser: AuthUser = {
    id: 'mock-user-signin',
    user_type: 'buyer',
    full_name: 'Test User',
    phone_number: phoneNumber,
    verification_status: 'verified'
  }
  
  return {
    user: mockUser,
    session: { access_token: 'mock-token' }
  }
}

export async function signOut() {
  console.log('Mock signout')
  return Promise.resolve()
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  // Mock current user for development
  return {
    id: 'mock-current-user',
    user_type: 'buyer',
    full_name: 'Current User',
    phone_number: '+919876543210',
    verification_status: 'verified'
  }
}

export async function verifyPhoneOTP(phone: string, token: string) {
  console.log('Mock OTP verification:', { phone, token })
  return Promise.resolve({ user: { phone } })
}