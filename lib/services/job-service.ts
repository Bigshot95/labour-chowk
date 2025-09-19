import { supabase } from '../supabase'
import { Database } from '../database.types'

type ServiceRequest = Database['public']['Tables']['service_requests']['Row']
type ServiceRequestInsert = Database['public']['Tables']['service_requests']['Insert']
type JobAssignment = Database['public']['Tables']['job_assignments']['Row']
type Worker = Database['public']['Tables']['workers']['Row']

export async function createServiceRequest(requestData: ServiceRequestInsert) {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .insert([requestData])
      .select()
      .single()

    if (error) throw error

    // If auto-assign is enabled, trigger worker assignment
    if (requestData.auto_assign) {
      await autoAssignWorker(data.id)
    }

    return data
  } catch (error) {
    console.error('Create service request error:', error)
    throw error
  }
}

export async function autoAssignWorker(serviceRequestId: string) {
  try {
    // Fetch service request details
    const { data: serviceRequest, error: requestError } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', serviceRequestId)
      .single()

    if (requestError) throw requestError

    // Find matching available workers
    const { data: availableWorkers, error: workersError } = await supabase
      .from('workers')
      .select(`
        *,
        users (*)
      `)
      .eq('availability_status', 'available')
      .overlaps('skills', serviceRequest.required_skills)

    if (workersError) throw workersError

    if (availableWorkers.length === 0) {
      throw new Error('No available workers found for this job')
    }

    // Rank workers based on multiple criteria
    const rankedWorkers = availableWorkers
      .map(worker => ({
        ...worker,
        score: calculateWorkerScore(worker, serviceRequest)
      }))
      .sort((a, b) => b.score - a.score)

    // Assign to top-ranked worker
    const topWorker = rankedWorkers[0]
    await createJobAssignment(serviceRequestId, topWorker.id, 'auto')

    return topWorker
  } catch (error) {
    console.error('Auto assign worker error:', error)
    throw error
  }
}

function calculateWorkerScore(worker: Worker, serviceRequest: ServiceRequest): number {
  let score = 0

  // Rating weight (40%)
  score += worker.average_rating * 0.4

  // Experience weight (30%)
  const experienceScore = worker.experience_years ? Math.min(worker.experience_years / 10, 1) : 0
  score += experienceScore * 0.3

  // Job completion rate weight (20%)
  score += Math.min(worker.total_jobs_completed / 100, 1) * 0.2

  // Recent sobriety checks (10%)
  if (worker.last_sobriety_check && isWithinLast30Days(worker.last_sobriety_check)) {
    score += 0.1
  }

  return score
}

function isWithinLast30Days(dateString: string): boolean {
  const date = new Date(dateString)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return date > thirtyDaysAgo
}

export async function createJobAssignment(
  serviceRequestId: string, 
  workerId: string, 
  assignmentType: 'manual' | 'auto'
) {
  try {
    const { data, error } = await supabase
      .from('job_assignments')
      .insert([{
        service_request_id: serviceRequestId,
        worker_id: workerId,
        assignment_type: assignmentType,
        status: 'assigned',
        sobriety_check_required: true,
        sobriety_check_status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    // Update worker availability
    await supabase
      .from('workers')
      .update({ availability_status: 'assigned' })
      .eq('id', workerId)

    return data
  } catch (error) {
    console.error('Create job assignment error:', error)
    throw error
  }
}

export async function getJobAssignments(userId: string, userType: 'buyer' | 'worker') {
  try {
    let query = supabase
      .from('job_assignments')
      .select(`
        *,
        service_requests (*),
        workers (
          *,
          users (*)
        )
      `)

    if (userType === 'buyer') {
      query = query.eq('service_requests.buyer_id', userId)
    } else {
      query = query.eq('worker_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get job assignments error:', error)
    throw error
  }
}

export async function updateJobAssignmentStatus(jobAssignmentId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('job_assignments')
      .update({ status })
      .eq('id', jobAssignmentId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Update job assignment status error:', error)
    throw error
  }
}