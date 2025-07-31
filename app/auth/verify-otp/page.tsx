'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/store'

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { setUser } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    const phoneParam = searchParams.get('phone')
    if (phoneParam) {
      setPhone(phoneParam)
    } else {
      router.push('/auth/login')
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      // Store user data
      setUser(data.user)

      toast({
        title: 'Login Successful',
        description: 'Welcome to Labour Chowk!',
      })

      // Redirect based on user role
      if (data.user.role === 'WORKER' && !data.user.workerProfile) {
        router.push('/profile/worker-setup')
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
        router.push(callbackUrl)
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

  const handleResendOTP = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      toast({
        title: 'OTP Resent',
        description: `New OTP sent to ${phone}. Use OTP: ${data.otp}`,
      })
    } catch (error) {
      toast({
        title: 'Failed to resend OTP',
        description: 'Please try again',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Phone
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit OTP sent to {phone}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter OTP</CardTitle>
            <CardDescription>
              We've sent a verification code to your phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-gray-500">
                  For demo: Use OTP <strong>123456</strong>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isLoading || otp.length !== 6}
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

            <div className="mt-6 text-center space-y-2">
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                className="text-orange-600 hover:text-orange-700"
              >
                Resend OTP
              </Button>
              <div>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/auth/login')}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Change Phone Number
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}