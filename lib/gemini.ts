import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface SobrietyAnalysis {
  sobriety_status: 'PASS' | 'FAIL' | 'UNCERTAIN'
  confidence_score: number
  detected_signs: string[]
  safety_recommendation: 'APPROVE_FOR_WORK' | 'REQUIRE_RETEST' | 'DENY_ASSIGNMENT'
  additional_notes: string
}

export async function analyzeSobrietyVideo(videoBase64: string): Promise<SobrietyAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

  const prompt = `
Analyze this video frame of a worker for signs of intoxication or impairment.

ASSESSMENT CRITERIA:
- Eye condition: Check for bloodshot, glazed, or unfocused eyes
- Facial expressions: Look for drowsiness, confusion, or lack of alertness  
- Body posture: Assess stability, swaying, or unsteady stance
- Overall alertness: Evaluate responsiveness and cognitive awareness
- Hand steadiness: Check for tremors or uncontrolled movements

RESPONSE FORMAT (JSON only):
{
  "sobriety_status": "PASS/FAIL/UNCERTAIN",
  "confidence_score": 0.95,
  "detected_signs": ["bloodshot_eyes", "unsteady_posture"],
  "safety_recommendation": "APPROVE_FOR_WORK/REQUIRE_RETEST/DENY_ASSIGNMENT",
  "additional_notes": "Worker appears alert and stable"
}

IMPORTANT: This is for worker safety and job site security. Be thorough but fair in assessment.
`

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'video/mp4',
          data: videoBase64
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Gemini analysis error:', error)
    throw new Error('Failed to analyze sobriety video')
  }
}