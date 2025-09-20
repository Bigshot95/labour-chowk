// Mock Gemini AI service for development
export interface SobrietyAnalysis {
  sobriety_status: 'PASS' | 'FAIL' | 'UNCERTAIN'
  confidence_score: number
  detected_signs: string[]
  safety_recommendation: 'APPROVE_FOR_WORK' | 'REQUIRE_RETEST' | 'DENY_ASSIGNMENT'
  additional_notes: string
}

export async function analyzeSobrietyVideo(videoBase64: string): Promise<SobrietyAnalysis> {
  // Mock implementation for development
  // In production, this would call the actual Gemini AI API
  
  console.log('Analyzing video with mock Gemini AI...')
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock analysis result (randomly pass/fail for demo)
  const mockResults: SobrietyAnalysis[] = [
    {
      sobriety_status: 'PASS',
      confidence_score: 0.92,
      detected_signs: [],
      safety_recommendation: 'APPROVE_FOR_WORK',
      additional_notes: 'Worker appears alert and stable. No signs of impairment detected.'
    },
    {
      sobriety_status: 'FAIL',
      confidence_score: 0.85,
      detected_signs: ['bloodshot_eyes', 'unsteady_posture'],
      safety_recommendation: 'DENY_ASSIGNMENT',
      additional_notes: 'Signs of potential impairment detected. Worker should not start work at this time.'
    },
    {
      sobriety_status: 'UNCERTAIN',
      confidence_score: 0.65,
      detected_signs: ['unclear_visibility'],
      safety_recommendation: 'REQUIRE_RETEST',
      additional_notes: 'Video quality insufficient for reliable analysis. Please retake the test.'
    }
  ]
  
  // Return random result for demo
  return mockResults[Math.floor(Math.random() * mockResults.length)]
}