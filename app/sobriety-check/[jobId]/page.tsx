'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { SobrietyCheck } from '@/components/sobriety/SobrietyCheck'
import { getCurrentUser } from '@/lib/supabase-auth'
import { PageLoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function SobrietyCheckPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        // For development, use mock user
        setUser({
          id: 'mock-worker',
          user_type: 'worker',
          full_name: 'Mock Worker',
          phone_number: '+919876543210'
        })
        setIsLoading(false)
        return
      }

      if (currentUser.user_type !== 'worker') {
        setError('Only workers can perform sobriety checks')
        setIsLoading(false)
        return
      }

      setUser(currentUser)
    } catch (error) {
      console.error('Load user error:', error)
      // Use mock data for development
      setUser({
        id: 'mock-worker',
        user_type: 'worker',
        full_name: 'Mock Worker',
        phone_number: '+919876543210'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSobrietyComplete = (result: any) => {
    if (result.status === 'pass') {
      router.push('/dashboard?message=sobriety-passed')
    } else {
      router.push('/dashboard?message=sobriety-failed')
    }
  }

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sobriety Verification
          </h1>
          <p className="text-gray-600">
            Complete this safety check to start your work assignment
          </p>
        </div>

        <SobrietyCheck
          jobAssignmentId={jobId}
          workerId={user?.id}
          onComplete={handleSobrietyComplete}
        />
      </div>
    </div>
  )
}