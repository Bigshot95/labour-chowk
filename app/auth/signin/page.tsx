'use client'

import Link from 'next/link'
import { SupabaseAuthForm } from '@/components/auth/SupabaseAuthForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back to Digital Labour Chowk
          </p>
        </div>

        <SupabaseAuthForm mode="signin" />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}