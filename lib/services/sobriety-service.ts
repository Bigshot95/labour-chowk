import { analyzeSobrietyVideo } from '../gemini'

export async function performSobrietyCheck(
  jobAssignmentId: string,
  workerId: string,
  videoFile: File
) {
  try {
    console.log('Performing sobriety check:', { jobAssignmentId, workerId })
    
    // Convert video to base64 for analysis
    const videoBase64 = await fileToBase64(videoFile)
    
    // Analyze with Gemini AI (mock for now)
    const analysisResult = await analyzeSobrietyVideo(videoBase64)
    
    // Mock sobriety check result
    const sobrietyCheck = {
      id: 'mock-check-' + Date.now(),
      job_assignment_id: jobAssignmentId,
      worker_id: workerId,
      video_url: 'mock-video-url',
      gemini_analysis: analysisResult,
      status: analysisResult.sobriety_status.toLowerCase(),
      confidence_score: analysisResult.confidence_score,
      detected_issues: analysisResult.detected_signs,
      manual_review_required: analysisResult.sobriety_status === 'UNCERTAIN',
      created_at: new Date().toISOString()
    }
    
    console.log('Sobriety check result:', sobrietyCheck)
    return sobrietyCheck
  } catch (error) {
    console.error('Sobriety check error:', error)
    throw error
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

export async function getSobrietyChecks(workerId: string) {
  console.log('Getting sobriety checks for worker:', workerId)
  return []
}