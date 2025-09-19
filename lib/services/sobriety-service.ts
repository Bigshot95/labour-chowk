import { supabase } from '../supabase'
import { analyzeSobrietyVideo, SobrietyAnalysis } from '../gemini'
import { Database } from '../database.types'

type SobrietyCheck = Database['public']['Tables']['sobriety_checks']['Row']
type SobrietyCheckInsert = Database['public']['Tables']['sobriety_checks']['Insert']

export async function performSobrietyCheck(
  jobAssignmentId: string,
  workerId: string,
  videoFile: File
): Promise<SobrietyCheck> {
  try {
    // Convert video to base64
    const videoBase64 = await fileToBase64(videoFile)
    
    // Upload video to Supabase Storage
    const fileName = `${jobAssignmentId}/${Date.now()}.mp4`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sobriety-videos')
      .upload(fileName, videoFile, {
        contentType: 'video/mp4'
      })

    if (uploadError) throw uploadError

    // Analyze video with Gemini AI
    const analysisResult = await analyzeSobrietyVideo(videoBase64)

    // Store results in database
    const sobrietyCheckData: SobrietyCheckInsert = {
      job_assignment_id: jobAssignmentId,
      worker_id: workerId,
      video_url: uploadData.path,
      gemini_analysis: analysisResult,
      status: analysisResult.sobriety_status.toLowerCase() as 'pass' | 'fail' | 'uncertain',
      confidence_score: analysisResult.confidence_score,
      detected_issues: analysisResult.detected_signs,
      manual_review_required: analysisResult.sobriety_status === 'UNCERTAIN'
    }

    const { data: sobrietyCheck, error: insertError } = await supabase
      .from('sobriety_checks')
      .insert([sobrietyCheckData])
      .select()
      .single()

    if (insertError) throw insertError

    // Update job assignment status based on result
    let jobStatus = 'sobriety_check_pending'
    if (analysisResult.sobriety_status === 'PASS') {
      jobStatus = 'work_approved'
    } else if (analysisResult.sobriety_status === 'FAIL') {
      jobStatus = 'sobriety_check_failed'
    }

    await supabase
      .from('job_assignments')
      .update({ 
        sobriety_check_status: analysisResult.sobriety_status.toLowerCase(),
        status: jobStatus
      })
      .eq('id', jobAssignmentId)

    // Update worker's sobriety check history
    await updateWorkerSobrietyHistory(workerId, analysisResult)

    return sobrietyCheck
  } catch (error) {
    console.error('Sobriety check error:', error)
    throw error
  }
}

async function updateWorkerSobrietyHistory(workerId: string, analysis: SobrietyAnalysis) {
  try {
    const { data: worker, error: fetchError } = await supabase
      .from('workers')
      .select('sobriety_check_history')
      .eq('id', workerId)
      .single()

    if (fetchError) throw fetchError

    const history = Array.isArray(worker.sobriety_check_history) 
      ? worker.sobriety_check_history 
      : []

    const newEntry = {
      timestamp: new Date().toISOString(),
      status: analysis.sobriety_status,
      confidence_score: analysis.confidence_score
    }

    // Keep only last 10 entries
    const updatedHistory = [...history, newEntry].slice(-10)

    await supabase
      .from('workers')
      .update({ 
        sobriety_check_history: updatedHistory,
        last_sobriety_check: new Date().toISOString()
      })
      .eq('id', workerId)

  } catch (error) {
    console.error('Update worker sobriety history error:', error)
    // Don't throw here as it's not critical for the main flow
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

export async function getSobrietyChecks(workerId: string) {
  try {
    const { data, error } = await supabase
      .from('sobriety_checks')
      .select(`
        *,
        job_assignments (
          *,
          service_requests (*)
        )
      `)
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get sobriety checks error:', error)
    throw error
  }
}

export async function requestManualReview(sobrietyCheckId: string, workerNotes?: string) {
  try {
    const { data, error } = await supabase
      .from('sobriety_checks')
      .update({ 
        manual_review_required: true,
        review_notes: workerNotes || 'Worker requested manual review'
      })
      .eq('id', sobrietyCheckId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Request manual review error:', error)
    throw error
  }
}