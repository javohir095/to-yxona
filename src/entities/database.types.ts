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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          created_by: string | null
          customer_name: string
          customer_phone: string
          end_time: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          guest_count: number
          hall_id: string
          id: string
          menu_package_id: string | null
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_name: string
          customer_phone: string
          end_time?: string | null
          event_date: string
          event_type?: Database["public"]["Enums"]["event_type"]
          guest_count: number
          hall_id: string
          id?: string
          menu_package_id?: string | null
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_name?: string
          customer_phone?: string
          end_time?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          guest_count?: number
          hall_id?: string
          id?: string
          menu_package_id?: string | null
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_menu_package_id_fkey"
            columns: ["menu_package_id"]
            isOneToOne: false
            referencedRelation: "menu_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      halls: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          venue_id: string
        }
        Insert: {
          capacity: number
          created_at?: string
          id?: string
          name: string
          venue_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "halls_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          id: string
          ingredient_name: string
          quantity_in_stock: number
          unit: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          id?: string
          ingredient_name: string
          quantity_in_stock?: number
          unit?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          id?: string
          ingredient_name?: string
          quantity_in_stock?: number
          unit?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_name: string
          menu_item_id: string
          quantity_per_serving: number
          unit: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_name: string
          menu_item_id: string
          quantity_per_serving: number
          unit?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_name?: string
          menu_item_id?: string
          quantity_per_serving?: number
          unit?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          created_at: string
          id: string
          name: string
          package_id: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          package_id: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          package_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "menu_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price_per_guest: number
          venue_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_per_guest: number
          venue_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_per_guest?: number
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_packages_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          created_by: string | null
          id: string
          paid_at: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          venue_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          paid_at?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          venue_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          paid_at?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_payment_summary"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      requisition_items: {
        Row: {
          id: string
          ingredient_name: string
          quantity: number
          requisition_id: string
          unit: string
          venue_id: string
        }
        Insert: {
          id?: string
          ingredient_name: string
          quantity: number
          requisition_id: string
          unit?: string
          venue_id: string
        }
        Update: {
          id?: string
          ingredient_name?: string
          quantity?: number
          requisition_id?: string
          unit?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requisition_items_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "requisitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisition_items_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      requisitions: {
        Row: {
          booking_id: string | null
          created_by: string | null
          generated_at: string
          id: string
          period_end: string | null
          period_start: string | null
          type: Database["public"]["Enums"]["requisition_type"]
          venue_id: string
        }
        Insert: {
          booking_id?: string | null
          created_by?: string | null
          generated_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          type?: Database["public"]["Enums"]["requisition_type"]
          venue_id: string
        }
        Update: {
          booking_id?: string | null
          created_by?: string | null
          generated_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          type?: Database["public"]["Enums"]["requisition_type"]
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requisitions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_payment_summary"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "requisitions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      booking_payment_summary: {
        Row: {
          booking_id: string | null
          paid_total: number | null
          remaining_amount: number | null
          total_amount: number | null
          venue_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_aggregate_requisition: {
        Args: { p_end: string; p_start: string; p_venue_id: string }
        Returns: {
          ingredient_name: string
          quantity: number
          unit: string
        }[]
      }
      calculate_booking_requisition: {
        Args: { p_booking_id: string }
        Returns: {
          ingredient_name: string
          quantity: number
          unit: string
        }[]
      }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      current_venue_id: { Args: never; Returns: string }
      get_dashboard_summary: {
        Args: { p_end: string; p_start: string; p_venue_id: string }
        Returns: {
          booked_days: number
          revenue: number
          total_debt: number
          total_guests: number
        }[]
      }
      get_debtors: {
        Args: {
          p_end?: string
          p_hall_id?: string
          p_search?: string
          p_start?: string
          p_venue_id: string
        }
        Returns: {
          booking_id: string
          customer_name: string
          customer_phone: string
          event_date: string
          hall_id: string
          hall_name: string
          paid_total: number
          remaining_amount: number
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
        }[]
      }
      get_event_type_breakdown: {
        Args: { p_end: string; p_start: string; p_venue_id: string }
        Returns: {
          bookings_count: number
          event_type: Database["public"]["Enums"]["event_type"]
          revenue: number
        }[]
      }
      get_hall_revenue: {
        Args: { p_end: string; p_start: string; p_venue_id: string }
        Returns: {
          bookings_count: number
          hall_id: string
          hall_name: string
          revenue: number
        }[]
      }
      get_report_summary: {
        Args: { p_end: string; p_start: string; p_venue_id: string }
        Returns: {
          avg_ticket: number
          occupied_days: number
          total_bookings: number
          total_hall_days: number
          total_revenue: number
        }[]
      }
      get_hall_occupancy: {
        Args: { p_end: string; p_start: string; p_venue_id: string }
        Returns: {
          booked_days: number
          hall_id: string
          hall_name: string
          total_days: number
        }[]
      }
      get_monthly_revenue: {
        Args: { p_months?: number; p_venue_id: string }
        Returns: {
          month_start: string
          revenue: number
        }[]
      }
      is_manager_or_owner: { Args: never; Returns: boolean }
    }
    Enums: {
      booking_status:
        | "booked"
        | "deposit_paid"
        | "fully_paid"
        | "completed"
        | "cancelled"
      event_type:
        | "wedding"
        | "circumcision"
        | "celebration"
        | "corporate"
        | "other"
      payment_type: "cash" | "card" | "transfer"
      requisition_type: "per_event" | "weekly_aggregate"
      user_role: "owner" | "manager" | "kitchen_staff" | "superadmin"
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
      booking_status: [
        "booked",
        "deposit_paid",
        "fully_paid",
        "completed",
        "cancelled",
      ],
      event_type: [
        "wedding",
        "circumcision",
        "celebration",
        "corporate",
        "other",
      ],
      payment_type: ["cash", "card", "transfer"],
      requisition_type: ["per_event", "weekly_aggregate"],
      user_role: ["owner", "manager", "kitchen_staff", "superadmin"],
    },
  },
} as const
