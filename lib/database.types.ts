export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          user_type: 'buyer' | 'worker' | 'admin'
          full_name: string
          phone_number: string
          email: string | null
          profile_image_url: string | null
          location: Json | null
          verification_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_type: 'buyer' | 'worker' | 'admin'
          full_name: string
          phone_number: string
          email?: string | null
          profile_image_url?: string | null
          location?: Json | null
          verification_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_type?: 'buyer' | 'worker' | 'admin'
          full_name?: string
          phone_number?: string
          email?: string | null
          profile_image_url?: string | null
          location?: Json | null
          verification_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: string
          skills: string[]
          experience_years: number | null
          hourly_rate: number | null
          availability_status: string
          total_jobs_completed: number
          average_rating: number
          sobriety_check_history: Json[]
          last_sobriety_check: string | null
          government_id_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          skills: string[]
          experience_years?: number | null
          hourly_rate?: number | null
          availability_status?: string
          total_jobs_completed?: number
          average_rating?: number
          sobriety_check_history?: Json[]
          last_sobriety_check?: string | null
          government_id_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          skills?: string[]
          experience_years?: number | null
          hourly_rate?: number | null
          availability_status?: string
          total_jobs_completed?: number
          average_rating?: number
          sobriety_check_history?: Json[]
          last_sobriety_check?: string | null
          government_id_url?: string | null
          created_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          buyer_id: string
          title: string
          description: string | null
          category: string | null
          required_skills: string[]
          location: Json | null
          budget_min: number | null
          budget_max: number | null
          urgency_level: string
          estimated_duration: number | null
          preferred_worker_id: string | null
          auto_assign: boolean
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          title: string
          description?: string | null
          category?: string | null
          required_skills: string[]
          location?: Json | null
          budget_min?: number | null
          budget_max?: number | null
          urgency_level?: string
          estimated_duration?: number | null
          preferred_worker_id?: string | null
          auto_assign?: boolean
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          title?: string
          description?: string | null
          category?: string | null
          required_skills?: string[]
          location?: Json | null
          budget_min?: number | null
          budget_max?: number | null
          urgency_level?: string
          estimated_duration?: number | null
          preferred_worker_id?: string | null
          auto_assign?: boolean
          status?: string
          created_at?: string
        }
      }
      job_assignments: {
        Row: {
          id: string
          service_request_id: string
          worker_id: string
          assignment_type: 'manual' | 'auto'
          status: string
          sobriety_check_required: boolean
          sobriety_check_status: string
          work_started_at: string | null
          work_completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          service_request_id: string
          worker_id: string
          assignment_type: 'manual' | 'auto'
          status?: string
          sobriety_check_required?: boolean
          sobriety_check_status?: string
          work_started_at?: string | null
          work_completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          service_request_id?: string
          worker_id?: string
          assignment_type?: 'manual' | 'auto'
          status?: string
          sobriety_check_required?: boolean
          sobriety_check_status?: string
          work_started_at?: string | null
          work_completed_at?: string | null
          created_at?: string
        }
      }
      sobriety_checks: {
        Row: {
          id: string
          job_assignment_id: string
          worker_id: string
          video_url: string
          gemini_analysis: Json | null
          status: 'pass' | 'fail' | 'uncertain' | 'pending'
          confidence_score: number | null
          detected_issues: string[]
          manual_review_required: boolean
          reviewed_by: string | null
          review_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_assignment_id: string
          worker_id: string
          video_url: string
          gemini_analysis?: Json | null
          status?: 'pass' | 'fail' | 'uncertain' | 'pending'
          confidence_score?: number | null
          detected_issues?: string[]
          manual_review_required?: boolean
          reviewed_by?: string | null
          review_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_assignment_id?: string
          worker_id?: string
          video_url?: string
          gemini_analysis?: Json | null
          status?: 'pass' | 'fail' | 'uncertain' | 'pending'
          confidence_score?: number | null
          detected_issues?: string[]
          manual_review_required?: boolean
          reviewed_by?: string | null
          review_notes?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          job_assignment_id: string
          buyer_id: string
          worker_id: string
          amount: number
          platform_fee: number | null
          payment_method: string | null
          status: string
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_assignment_id: string
          buyer_id: string
          worker_id: string
          amount: number
          platform_fee?: number | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_assignment_id?: string
          buyer_id?: string
          worker_id?: string
          amount?: number
          platform_fee?: number | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}