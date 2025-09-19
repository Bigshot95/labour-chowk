'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { signUpWithPhone, signInWithPhone, verifyPhoneOTP } from '@/lib/supabase-auth'
import { useAuthStore } from '@/lib/store'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export function SupabaseAuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { setUser } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: 'buyer' as 'buyer' | 'worker',
    email: '',
    otp: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const phoneNumber = formData.phone.startsWith('+91') 
        ? formData.phone 
        : `+91${formData.phone}`

      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }

        const userData = {
          full_name: formData.fullName,
          user_type: formData.userType,
          phone_number: phoneNumber,
          email: formData.email || null,
          verification_status: 'pending'
        }

        const result = await signUpWithPhone(phoneNumber, formData.password, userData)
        
        toast({
          title: 'Registration Successful',
          description: 'Please verify your phone number with the OTP sent to you.',
        })
        
        setStep('otp')
      } else {
        const result = await signInWithPhone(phoneNumber, formData.password)
        
        setUser({
          id: result.user.id,
          name: result.user.full_name,
          phone: result.user.phone_number,
          role: result.user.user_type.toUpperCase() as 'CUSTOMER' | 'WORKER' | 'ADMIN',
          isVerified: result.user.verification_status === 'verified',
          address: '',
          pincode: '',
          language: 'en'
        })

        toast({
          title: 'Sign In Successful',
          description: 'Welcome back to Labour Chowk!',
        })

        router.push('/dashboard')
      }
    } catch (error: any) {
      toast({
        title: mode === 'signup' ? 'Registration Failed' : 'Sign In Failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const phoneNumber = formData.phone.startsWith('+91') 
        ? formData.phone 
        : `+91${formData.phone}`

      await verifyPhoneOTP(phoneNumber, formData.otp)

      toast({
        title: 'Phone Verified',
        description: 'Your account has been verified successfully!',
      })

      // Sign in after verification
      const result = await signInWithPhone(phoneNumber, formData.password)
      
      setUser({
        id: result.user.id,
        name: result.user.full_name,
        phone: result.user.phone_number,
        role: result.user.user_type.toUpperCase() as 'CUSTOMER' | 'WORKER' | 'ADMIN',
        isVerified: true,
        address: '',
        pincode: '',
        language: 'en'
      })

      if (result.user.user_type === 'worker' && !result.user.workers) {
        router.push('/profile/worker-setup')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify Phone Number</CardTitle>
          <CardDescription>
            Enter the OTP sent to {formData.phone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOTPVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                required
                value={formData.otp}
                onChange={(e) => handleInputChange('otp', e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isLoading || formData.otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </CardTitle>
        <CardDescription>
          {mode === 'signup' 
            ? 'Join Labour Chowk today' 
            : 'Welcome back to Labour Chowk'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-3">
                <Label>I want to:</Label>
                <RadioGroup
                  value={formData.userType}
                  onValueChange={(value) => handleInputChange('userType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer">Hire workers for my tasks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="worker" id="worker" />
                    <Label htmlFor="worker">Work and earn money</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="9876543210"
                className="rounded-l-none"
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                minLength={6}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              mode === 'signup' ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}