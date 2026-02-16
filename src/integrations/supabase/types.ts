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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      balances: {
        Row: {
          amount: number
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      card_balances: {
        Row: {
          amount: number
          card_id: string
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          card_id: string
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_balances_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_transactions: {
        Row: {
          amount: number
          card_id: string
          created_at: string
          currency: string
          id: string
          merchant_category: string | null
          merchant_name: string
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id: string
          created_at?: string
          currency?: string
          id?: string
          merchant_category?: string | null
          merchant_name: string
          status?: string
          transaction_type?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string
          created_at?: string
          currency?: string
          id?: string
          merchant_category?: string | null
          merchant_name?: string
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_cards: {
        Row: {
          card_holder_name: string
          card_number: string
          card_type: string | null
          created_at: string
          expiry_month: string
          expiry_year: string
          id: string
          is_primary: boolean | null
          last_four: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_holder_name: string
          card_number: string
          card_type?: string | null
          created_at?: string
          expiry_month: string
          expiry_year: string
          id?: string
          is_primary?: boolean | null
          last_four: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_holder_name?: string
          card_number?: string
          card_type?: string | null
          created_at?: string
          expiry_month?: string
          expiry_year?: string
          id?: string
          is_primary?: boolean | null
          last_four?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      physical_card_requests: {
        Row: {
          address_line1: string
          address_line2: string | null
          card_id: string
          city: string
          country: string
          created_at: string
          delivered_at: string | null
          full_name: string
          id: string
          postal_code: string
          requested_at: string
          shipped_at: string | null
          state: string
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          card_id: string
          city: string
          country?: string
          created_at?: string
          delivered_at?: string | null
          full_name: string
          id?: string
          postal_code: string
          requested_at?: string
          shipped_at?: string | null
          state: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          card_id?: string
          city?: string
          country?: string
          created_at?: string
          delivered_at?: string | null
          full_name?: string
          id?: string
          postal_code?: string
          requested_at?: string
          shipped_at?: string | null
          state?: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "physical_card_requests_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_suspended: boolean | null
          is_transfer_restricted: boolean | null
          phone_number: string | null
          preferred_currency: string
          suspension_reason: string | null
          transfer_pin: string | null
          transfer_restriction_message: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_suspended?: boolean | null
          is_transfer_restricted?: boolean | null
          phone_number?: string | null
          preferred_currency?: string
          suspension_reason?: string | null
          transfer_pin?: string | null
          transfer_restriction_message?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_suspended?: boolean | null
          is_transfer_restricted?: boolean | null
          phone_number?: string | null
          preferred_currency?: string
          suspension_reason?: string | null
          transfer_pin?: string | null
          transfer_restriction_message?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_beneficiaries: {
        Row: {
          beneficiary_user_id: string
          created_at: string
          id: string
          nickname: string | null
          user_id: string
        }
        Insert: {
          beneficiary_user_id: string
          created_at?: string
          id?: string
          nickname?: string | null
          user_id: string
        }
        Update: {
          beneficiary_user_id?: string
          created_at?: string
          id?: string
          nickname?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_contacts: {
        Row: {
          contact_type: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          contact_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
          value: string
        }
        Update: {
          contact_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          recipient_id: string | null
          sender_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          recipient_id?: string | null
          sender_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          recipient_id?: string | null
          sender_id?: string | null
          status?: string
        }
        Relationships: []
      }
      user_cards: {
        Row: {
          card_holder_name: string
          card_number: string
          created_at: string
          cvv: string
          expiry_month: string
          expiry_year: string
          id: string
          is_frozen: boolean
          is_locked: boolean
          last_four: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_holder_name: string
          card_number?: string
          created_at?: string
          cvv?: string
          expiry_month?: string
          expiry_year?: string
          id?: string
          is_frozen?: boolean
          is_locked?: boolean
          last_four?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_holder_name?: string
          card_number?: string
          created_at?: string
          cvv?: string
          expiry_month?: string
          expiry_year?: string
          id?: string
          is_frozen?: boolean
          is_locked?: boolean
          last_four?: string
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      withdrawal_requests: {
        Row: {
          account_holder_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string
          id: string
          linked_card_id: string | null
          processed_at: string | null
          routing_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          admin_notes?: string | null
          amount: number
          bank_name: string
          created_at?: string
          id?: string
          linked_card_id?: string | null
          processed_at?: string | null
          routing_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          admin_notes?: string | null
          amount?: number
          bank_name?: string
          created_at?: string
          id?: string
          linked_card_id?: string | null
          processed_at?: string | null
          routing_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_linked_card_id_fkey"
            columns: ["linked_card_id"]
            isOneToOne: false
            referencedRelation: "linked_cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      card_add_cash: {
        Args: { _amount: number; _card_id: string }
        Returns: {
          card_balance: number
          main_balance: number
        }[]
      }
      card_cash_out: {
        Args: { _amount: number; _card_id: string }
        Returns: {
          card_balance: number
          main_balance: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_withdrawal: {
        Args: { _amount: number; _user_id: string; _withdrawal_id: string }
        Returns: undefined
      }
      refund_withdrawal: {
        Args: { _withdrawal_id: string }
        Returns: undefined
      }
      transfer_funds:
        | {
            Args: {
              _amount: number
              _description?: string
              _recipient_id: string
              _sender_id: string
            }
            Returns: string
          }
        | {
            Args: {
              _amount: number
              _converted_amount?: number
              _description?: string
              _recipient_id: string
              _sender_id: string
            }
            Returns: string
          }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
