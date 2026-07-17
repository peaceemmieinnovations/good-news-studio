export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_downloads: {
        Row: {
          app_id: string
          created_at: string
          id: string
          version: string | null
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          version?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_downloads_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      app_versions: {
        Row: {
          apk_size_bytes: number | null
          apk_url: string
          app_id: string
          created_at: string
          id: string
          release_notes: string | null
          version: string
        }
        Insert: {
          apk_size_bytes?: number | null
          apk_url: string
          app_id: string
          created_at?: string
          id?: string
          release_notes?: string | null
          version: string
        }
        Update: {
          apk_size_bytes?: number | null
          apk_url?: string
          app_id?: string
          created_at?: string
          id?: string
          release_notes?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_versions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      apps: {
        Row: {
          apk_size_bytes: number | null
          apk_url: string | null
          banner_url: string | null
          created_at: string
          description: string | null
          download_count: number
          features: string[]
          id: string
          is_visible: boolean
          logo_url: string | null
          name: string
          play_store_url: string | null
          release_notes: string | null
          released_at: string | null
          requirements: string | null
          screenshots: string[]
          slug: string
          tagline: string | null
          version: string | null
          website_url: string | null
        }
        Insert: {
          apk_size_bytes?: number | null
          apk_url?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          features?: string[]
          id?: string
          is_visible?: boolean
          logo_url?: string | null
          name: string
          play_store_url?: string | null
          release_notes?: string | null
          released_at?: string | null
          requirements?: string | null
          screenshots?: string[]
          slug: string
          tagline?: string | null
          version?: string | null
          website_url?: string | null
        }
        Update: {
          apk_size_bytes?: number | null
          apk_url?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          features?: string[]
          id?: string
          is_visible?: boolean
          logo_url?: string | null
          name?: string
          play_store_url?: string | null
          release_notes?: string | null
          released_at?: string | null
          requirements?: string | null
          screenshots?: string[]
          slug?: string
          tagline?: string | null
          version?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          read_minutes: number | null
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          read_minutes?: number | null
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          read_minutes?: number | null
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number | null
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number | null
          title?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          address: string | null
          bio: string | null
          cover_url: string | null
          cv_url: string | null
          email: string | null
          happy_clients: number | null
          id: string
          mission: string | null
          name: string
          phone: string | null
          photo_url: string | null
          projects_completed: number | null
          social: Json
          tagline: string | null
          title: string | null
          updated_at: string
          vision: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          cover_url?: string | null
          cv_url?: string | null
          email?: string | null
          happy_clients?: number | null
          id?: string
          mission?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          projects_completed?: number | null
          social?: Json
          tagline?: string | null
          title?: string | null
          updated_at?: string
          vision?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          cover_url?: string | null
          cv_url?: string | null
          email?: string | null
          happy_clients?: number | null
          id?: string
          mission?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          projects_completed?: number | null
          social?: Json
          tagline?: string | null
          title?: string | null
          updated_at?: string
          vision?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          client: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          images: string[]
          is_featured: boolean
          is_visible: boolean
          live_url: string | null
          long_description: string | null
          slug: string
          sort_order: number | null
          status: string | null
          technologies: string[]
          title: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          client?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          images?: string[]
          is_featured?: boolean
          is_visible?: boolean
          live_url?: string | null
          long_description?: string | null
          slug: string
          sort_order?: number | null
          status?: string | null
          technologies?: string[]
          title: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          client?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          images?: string[]
          is_featured?: boolean
          is_visible?: boolean
          live_url?: string | null
          long_description?: string | null
          slug?: string
          sort_order?: number | null
          status?: string | null
          technologies?: string[]
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          icon: string | null
          id: string
          is_visible: boolean
          price: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          price?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          price?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          id: string
          name: string
          percentage: number
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
          percentage?: number
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
          percentage?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          id: string
          is_approved: boolean
          message: string
          name: string
          photo_url: string | null
          rating: number | null
          role: string | null
          sort_order: number | null
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          message: string
          name: string
          photo_url?: string | null
          rating?: number | null
          role?: string | null
          sort_order?: number | null
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          message?: string
          name?: string
          photo_url?: string | null
          rating?: number | null
          role?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
