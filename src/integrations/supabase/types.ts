export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Enums: {
      job_status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
    }
    Tables: {
      customer_requests: {
        Row: {
          additional_details: string | null
          created_at: string
          customer_id: string | null
          event_date: string
          event_type: string
          id: string
          location: string
          photographer_id: string
          status: Database["public"]["Enums"]["job_status"]
        }
        Insert: {
          additional_details?: string | null
          created_at?: string
          customer_id?: string | null
          event_date: string
          event_type: string
          id?: string
          location: string
          photographer_id: string
          status?: Database["public"]["Enums"]["job_status"]
        }
        Update: {
          additional_details?: string | null
          created_at?: string
          customer_id?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location?: string
          photographer_id?: string
          status?: Database["public"]["Enums"]["job_status"]
        }
        Relationships: [
          {
            foreignKeyName: "customer_requests_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_requests_photographer_id_fkey"
            columns: ["photographer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      job_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          message_text: string | null
          request_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          message_text?: string | null
          request_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          message_text?: string | null
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_messages_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "customer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
