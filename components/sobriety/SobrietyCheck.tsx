'use client'

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { performSobrietyCheck } from '@/lib/services/sobriety-service'
import { Camera, CheckCircle, XCircle, AlertTriangle, RotateCcw } from 'lucide-react'

interface SobrietyCheckProps {
  jobAssignmentId: string
  workerId: string
  onComplete: (result: any) => void
}

export function SobrietyCheck({ jobAssignmentId, workerId, onComplete }: SobrietyCheckProps) {
  const webcamRef = useRef<Webcam>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [step, setStep] = useState<'instructions' | 'recording' | 'analysis' | 'result'>('instructions')
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleDataAvailable = useCallback(
    ({ data }: { data: Blob }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data))
      }
    },
    [setRecordedChunks]
  )

  const handleStartRecording = useCallback(() => {
    if (webcamRef.current && webcamRef.current.stream) {
      setRecordedChunks([])
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm'
      })
      mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable)
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setStep('recording')

      // Auto-stop after 15 seconds
      setTimeout(() => {
        handleStopRecording()
      }, 15000)
    }
  }, [webcamRef, setIsRecording, mediaRecorderRef, handleDataAvailable])

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setStep('analysis')
    }
  }, [mediaRecorderRef, setIsRecording])

  const handleAnalyzeVideo = useCallback(async () => {
    if (recordedChunks.length === 0) return

    setIsAnalyzing(true)
    
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      const videoFile = new File([blob], 'sobriety-check.webm', { type: 'video/webm' })

      const analysisResult = await performSobrietyCheck(jobAssignmentId, workerId, videoFile)
      
      setResult(analysisResult)
      setStep('result')
      
      toast({
        title: 'Analysis Complete',
        description: `Sobriety check ${analysisResult.status}`,
        variant: analysisResult.status === 'pass' ? 'default' : 'destructive'
      })

      onComplete(analysisResult)
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [recordedChunks, jobAssignmentId, workerId, onComplete, toast])

  const handleRetry = () => {
    setRecordedChunks([])
    setResult(null)
    setStep('instructions')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'fail':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'uncertain':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />
      default:
        return <Camera className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'fail':
        return 'bg-red-100 text-red-800'
      case 'uncertain':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (step === 'result' && result) {
    const analysis = result.gemini_analysis
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(result.status)}
            Sobriety Check Result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(result.status)}>
              {result.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-600">
              Confidence: {Math.round((result.confidence_score || 0) * 100)}%
            </span>
          </div>

          {analysis && (
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Recommendation:</h4>
                <p className="text-sm">{analysis.safety_recommendation?.replace(/_/g, ' ')}</p>
              </div>

              {analysis.additional_notes && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Notes:</h4>
                  <p className="text-sm">{analysis.additional_notes}</p>
                </div>
              )}

              {analysis.detected_signs && analysis.detected_signs.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Detected Signs:</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.detected_signs.map((sign: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sign.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.status !== 'pass' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {result.status === 'fail' 
                  ? 'You cannot start work at this time. Please try again when you are in better condition.'
                  : 'Your check requires manual review. Please wait for admin approval or try again.'
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {result.status !== 'pass' && (
              <Button onClick={handleRetry} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {result.status === 'pass' && (
              <Button className="bg-green-600 hover:bg-green-700">
                Start Work
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sobriety Verification</CardTitle>
        <CardDescription>
          Complete this safety check before starting work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'instructions' && (
          <div className="space-y-4">
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                This is a safety measure to ensure you're in good condition to work. 
                The 15-second video will be analyzed by AI and deleted after 30 days.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Instructions:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Look directly at the camera</li>
                <li>• Keep your face well-lit and visible</li>
                <li>• Stay still during recording</li>
                <li>• The recording will last 15 seconds</li>
              </ul>
            </div>

            <Button onClick={() => setStep('recording')} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          </div>
        )}

        {(step === 'recording' || step === 'analysis') && (
          <div className="space-y-4">
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                width={400}
                height={300}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
              />
              
              {isRecording && (
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                  REC
                </div>
              )}
            </div>

            {step === 'recording' && !isRecording && (
              <Button onClick={handleStartRecording} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            )}

            {step === 'analysis' && (
              <div className="text-center space-y-4">
                {isAnalyzing ? (
                  <div>
                    <LoadingSpinner size="lg" className="mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Analyzing video...</p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyzeVideo} className="w-full">
                    Analyze Recording
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}