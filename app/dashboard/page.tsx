'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store'
import { getCurrentUser } from '@/lib/supabase-auth'
import { getJobAssignments } from '@/lib/services/job-service'
import { LoadingSpinner, PageLoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [jobAssignments, setJobAssignments] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        // For development, use mock data
        console.log('Using mock user data')
      }

      const userType = currentUser?.user_type === 'buyer' ? 'buyer' : 'worker'
      const assignments = await getJobAssignments(currentUser?.id || 'mock-user', userType)
      
      setJobAssignments(assignments)
      
      // Calculate stats
      const stats = {
        total: assignments.length,
        pending: assignments.filter(a => a.status === 'assigned' || a.status === 'pending').length,
        active: assignments.filter(a => a.status === 'work_approved' || a.status === 'in_progress').length,
        completed: assignments.filter(a => a.status === 'completed').length
      }
      setStats(stats)
    } catch (error) {
      console.error('Dashboard load error:', error)
      // Use mock data for development
      const mockAssignments = await getJobAssignments('mock-user', 'buyer')
      setJobAssignments(mockAssignments)
      setStats({
        total: mockAssignments.length,
        pending: 1,
        active: 0,
        completed: 1
      })
    } finally {
      setIsLoading(false)
    }
  }
        return
      }

      const userType = currentUser.user_type === 'buyer' ? 'buyer' : 'worker'
      const assignments = await getJobAssignments(currentUser.id, userType)
      
      setJobAssignments(assignments)
      
      // Calculate stats
      const stats = {
        total: assignments.length,
        pending: assignments.filter(a => a.status === 'assigned' || a.status === 'pending').length,
        active: assignments.filter(a => a.status === 'work_approved' || a.status === 'in_progress').length,
        completed: assignments.filter(a => a.status === 'completed').length
      }
      setStats(stats)
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'work_approved':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'sobriety_check_failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  const isBuyer = user?.role === 'CUSTOMER'
  const isWorker = user?.role === 'WORKER'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isBuyer 
              ? 'Manage your service requests and track worker progress'
              : 'View your job assignments and complete sobriety checks'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="flex gap-4">
            {isBuyer && (
              <Link href="/jobs/create">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
            )}
            
            {isWorker && (
              <Link href="/jobs/available">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            )}
            
            <Link href="/profile">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent {isBuyer ? 'Service Requests' : 'Job Assignments'}
            </h2>
            <Link href="/jobs">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid gap-4">
            {jobAssignments.slice(0, 5).map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {assignment.service_requests?.title || 'Job Assignment'}
                        </h3>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">
                        {assignment.service_requests?.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(assignment.created_at).toLocaleDateString()}
                        </div>
                        
                        {assignment.service_requests?.budget_max && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ₹{assignment.service_requests.budget_min} - ₹{assignment.service_requests.budget_max}
                          </div>
                        )}
                        
                        {assignment.service_requests?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Location specified
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isWorker && assignment.status === 'assigned' && assignment.sobriety_check_required && (
                        <Link href={`/sobriety-check/${assignment.id}`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Start Check
                          </Button>
                        </Link>
                      )}
                      
                      {assignment.status === 'work_approved' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Start Work
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {jobAssignments.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No jobs yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isBuyer 
                      ? 'Post your first service request to get started'
                      : 'Browse available jobs to start earning'
                    }
                  </p>
                  {isBuyer ? (
                    <Link href="/jobs/create">
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        Post Your First Job
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/jobs/available">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Browse Available Jobs
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}