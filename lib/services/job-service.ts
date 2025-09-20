// Mock job service for development
export async function createServiceRequest(requestData: any) {
  console.log('Creating service request:', requestData)
  
  const mockRequest = {
    id: 'mock-request-' + Date.now(),
    ...requestData,
    status: 'open',
    created_at: new Date().toISOString()
  }
  
  return mockRequest
}

export async function getJobAssignments(userId: string, userType: 'buyer' | 'worker') {
  console.log('Getting job assignments for:', { userId, userType })
  
  // Mock job assignments
  return [
    {
      id: 'mock-assignment-1',
      status: 'assigned',
      sobriety_check_required: true,
      sobriety_check_status: 'pending',
      created_at: new Date().toISOString(),
      service_requests: {
        title: 'Plumbing Repair Work',
        description: 'Fix kitchen sink and bathroom faucet',
        budget_min: 500,
        budget_max: 1000,
        location: { address: 'Sector 15, Gurgaon' }
      }
    },
    {
      id: 'mock-assignment-2',
      status: 'completed',
      sobriety_check_required: false,
      sobriety_check_status: 'passed',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      service_requests: {
        title: 'Electrical Installation',
        description: 'Install new ceiling fan and lights',
        budget_min: 800,
        budget_max: 1500,
        location: { address: 'Koramangala, Bangalore' }
      }
    }
  ]
}

export async function updateJobAssignmentStatus(jobAssignmentId: string, status: string) {
  console.log('Updating job assignment status:', { jobAssignmentId, status })
  return { id: jobAssignmentId, status }
}