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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      accessories: {
        Row: {
          created_at: string
          id: string
          name: string
          quantity: number
          sale_price: number | null
          sku: string | null
          store_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          quantity?: number
          sale_price?: number | null
          sku?: string | null
          store_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          quantity?: number
          sale_price?: number | null
          sku?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accessories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      accessory_costs: {
        Row: {
          accessory_id: string
          store_id: string
          unit_cost: number
        }
        Insert: {
          accessory_id: string
          store_id: string
          unit_cost?: number
        }
        Update: {
          accessory_id?: string
          store_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "accessory_costs_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: true
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accessory_costs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          store_id: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          store_id?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          origin: string | null
          store_id: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          origin?: string | null
          store_id: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          origin?: string | null
          store_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      device_costs: {
        Row: {
          device_id: string
          freight_cost: number
          other_costs: number
          purchase_cost: number
          store_id: string
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          device_id: string
          freight_cost?: number
          other_costs?: number
          purchase_cost?: number
          store_id: string
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          device_id?: string
          freight_cost?: number
          other_costs?: number
          purchase_cost?: number
          store_id?: string
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_costs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: true
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_costs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      device_imeis: {
        Row: {
          device_id: string
          imei: string
          store_id: string
        }
        Insert: {
          device_id: string
          imei: string
          store_id: string
        }
        Update: {
          device_id?: string
          imei?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_imeis_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_imeis_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      device_movements: {
        Row: {
          created_at: string
          created_by: string | null
          device_id: string
          from_status: Database["public"]["Enums"]["device_status"] | null
          id: string
          note: string | null
          store_id: string
          to_status: Database["public"]["Enums"]["device_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_id: string
          from_status?: Database["public"]["Enums"]["device_status"] | null
          id?: string
          note?: string | null
          store_id: string
          to_status: Database["public"]["Enums"]["device_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_id?: string
          from_status?: Database["public"]["Enums"]["device_status"] | null
          id?: string
          note?: string | null
          store_id?: string
          to_status?: Database["public"]["Enums"]["device_status"]
        }
        Relationships: [
          {
            foreignKeyName: "device_movements_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_movements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      device_photos: {
        Row: {
          created_at: string
          device_id: string
          id: string
          path: string
          position: number
          store_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          path: string
          position?: number
          store_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          path?: string
          position?: number
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_photos_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_photos_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          acquired_at: string | null
          battery_health: number | null
          brand: string
          category: string
          color: string | null
          condition: Database["public"]["Enums"]["device_condition"]
          conservation: string | null
          created_at: string
          created_by: string | null
          defects: string | null
          id: string
          imei1: string | null
          imei2: string | null
          internal_code: string | null
          location: string | null
          min_price: number | null
          model: string
          notes: string | null
          origin_name: string | null
          replaced_parts: string | null
          sale_price: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["device_status"]
          storage: string | null
          store_id: string
          test_checklist: Json
          updated_at: string
        }
        Insert: {
          acquired_at?: string | null
          battery_health?: number | null
          brand?: string
          category?: string
          color?: string | null
          condition?: Database["public"]["Enums"]["device_condition"]
          conservation?: string | null
          created_at?: string
          created_by?: string | null
          defects?: string | null
          id?: string
          imei1?: string | null
          imei2?: string | null
          internal_code?: string | null
          location?: string | null
          min_price?: number | null
          model: string
          notes?: string | null
          origin_name?: string | null
          replaced_parts?: string | null
          sale_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["device_status"]
          storage?: string | null
          store_id: string
          test_checklist?: Json
          updated_at?: string
        }
        Update: {
          acquired_at?: string | null
          battery_health?: number | null
          brand?: string
          category?: string
          color?: string | null
          condition?: Database["public"]["Enums"]["device_condition"]
          conservation?: string | null
          created_at?: string
          created_by?: string | null
          defects?: string | null
          id?: string
          imei1?: string | null
          imei2?: string | null
          internal_code?: string | null
          location?: string | null
          min_price?: number | null
          model?: string
          notes?: string | null
          origin_name?: string | null
          replaced_parts?: string | null
          sale_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["device_status"]
          storage?: string | null
          store_id?: string
          test_checklist?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      highlights: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          position: number
          sponsored: boolean
          title: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          position?: number
          sponsored?: boolean
          title: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          position?: number
          sponsored?: boolean
          title?: string
        }
        Relationships: []
      }
      product_grants: {
        Row: {
          created_at: string
          email: string
          granted_by: string | null
          id: string
          note: string | null
          product: string
        }
        Insert: {
          created_at?: string
          email: string
          granted_by?: string | null
          id?: string
          note?: string | null
          product?: string
        }
        Update: {
          created_at?: string
          email?: string
          granted_by?: string | null
          id?: string
          note?: string | null
          product?: string
        }
        Relationships: []
      }
      sale_events: {
        Row: {
          actor: string | null
          created_at: string
          detail: Json
          event: string
          id: string
          sale_id: string
          store_id: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          detail?: Json
          event: string
          id?: string
          sale_id: string
          store_id: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          detail?: Json
          event?: string
          id?: string
          sale_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_events_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_events_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          device_id: string
          id: string
          price: number
          sale_id: string
          store_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          price: number
          sale_id: string
          store_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          price?: number
          sale_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_payments: {
        Row: {
          amount: number
          created_at: string
          fee: number
          id: string
          installments: number | null
          method: Database["public"]["Enums"]["payment_method"]
          sale_id: string
          store_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          fee?: number
          id?: string
          installments?: number | null
          method: Database["public"]["Enums"]["payment_method"]
          sale_id: string
          store_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          fee?: number
          id?: string
          installments?: number | null
          method?: Database["public"]["Enums"]["payment_method"]
          sale_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_trade_ins: {
        Row: {
          agreed_value: number
          created_at: string
          device_id: string
          id: string
          sale_id: string
          store_id: string
        }
        Insert: {
          agreed_value: number
          created_at?: string
          device_id: string
          id?: string
          sale_id: string
          store_id: string
        }
        Update: {
          agreed_value?: number
          created_at?: string
          device_id?: string
          id?: string
          sale_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_trade_ins_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_trade_ins_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_trade_ins_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount_received: number
          balance: number
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_id: string | null
          client_token: string | null
          created_at: string
          created_by: string | null
          discount: number
          id: string
          items_total: number
          notes: string | null
          receipt_number: number | null
          receipt_snapshot: Json | null
          seller_id: string | null
          status: Database["public"]["Enums"]["sale_status"]
          store_id: string
          total: number
          trade_in_value: number
        }
        Insert: {
          amount_received?: number
          balance?: number
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string | null
          client_token?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          id?: string
          items_total: number
          notes?: string | null
          receipt_number?: number | null
          receipt_snapshot?: Json | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          store_id: string
          total: number
          trade_in_value?: number
        }
        Update: {
          amount_received?: number
          balance?: number
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string | null
          client_token?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          id?: string
          items_total?: number
          notes?: string | null
          receipt_number?: number | null
          receipt_snapshot?: Json | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          store_id?: string
          total?: number
          trade_in_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_invites: {
        Row: {
          accepted_at: string | null
          can_approve_evaluations: boolean
          can_cancel_sales: boolean
          can_give_discounts: boolean
          can_manage_inventory: boolean
          can_manage_team: boolean
          can_register_sales: boolean
          can_view_costs: boolean
          can_view_finance: boolean
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["store_role"]
          store_id: string
        }
        Insert: {
          accepted_at?: string | null
          can_approve_evaluations?: boolean
          can_cancel_sales?: boolean
          can_give_discounts?: boolean
          can_manage_inventory?: boolean
          can_manage_team?: boolean
          can_register_sales?: boolean
          can_view_costs?: boolean
          can_view_finance?: boolean
          created_at?: string
          email: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["store_role"]
          store_id: string
        }
        Update: {
          accepted_at?: string | null
          can_approve_evaluations?: boolean
          can_cancel_sales?: boolean
          can_give_discounts?: boolean
          can_manage_inventory?: boolean
          can_manage_team?: boolean
          can_register_sales?: boolean
          can_view_costs?: boolean
          can_view_finance?: boolean
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["store_role"]
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_invites_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_members: {
        Row: {
          can_approve_evaluations: boolean
          can_cancel_sales: boolean
          can_give_discounts: boolean
          can_manage_inventory: boolean
          can_manage_team: boolean
          can_register_sales: boolean
          can_view_costs: boolean
          can_view_finance: boolean
          created_at: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["store_role"]
          store_id: string
          user_id: string
        }
        Insert: {
          can_approve_evaluations?: boolean
          can_cancel_sales?: boolean
          can_give_discounts?: boolean
          can_manage_inventory?: boolean
          can_manage_team?: boolean
          can_register_sales?: boolean
          can_view_costs?: boolean
          can_view_finance?: boolean
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["store_role"]
          store_id: string
          user_id: string
        }
        Update: {
          can_approve_evaluations?: boolean
          can_cancel_sales?: boolean
          can_give_discounts?: boolean
          can_manage_inventory?: boolean
          can_manage_team?: boolean
          can_register_sales?: boolean
          can_view_costs?: boolean
          can_view_finance?: boolean
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["store_role"]
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_members_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_subscriptions: {
        Row: {
          plan: string
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          plan?: string
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          plan?: string
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          created_at: string
          created_by: string
          document: string | null
          email: string | null
          id: string
          legal_name: string | null
          logo_path: string | null
          name: string
          phone: string | null
          receipt_seq: number
          updated_at: string
          warranty_text: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by: string
          document?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_path?: string | null
          name: string
          phone?: string | null
          receipt_seq?: number
          updated_at?: string
          warranty_text?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string
          document?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_path?: string | null
          name?: string
          phone?: string | null
          receipt_seq?: number
          updated_at?: string
          warranty_text?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      accept_my_invites: { Args: never; Returns: number }
      cancel_sale: {
        Args: { _reason: string; _sale_id: string }
        Returns: undefined
      }
      complete_sale: {
        Args: {
          _client_id: string
          _client_token: string
          _discount: number
          _items: Json
          _notes: string
          _payments: Json
          _store_id: string
          _trade_in: Json
        }
        Returns: string
      }
      create_store: { Args: { _name: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_store_permission: {
        Args: { _perm: string; _store_id: string }
        Returns: boolean
      }
      is_store_member: { Args: { _store_id: string }; Returns: boolean }
      is_store_owner: { Args: { _store_id: string }; Returns: boolean }
      safe_uuid: { Args: { _t: string }; Returns: string }
    }
    Enums: {
      app_role: "admin"
      device_condition: "novo" | "seminovo"
      device_status:
        | "em_transito"
        | "em_conferencia"
        | "disponivel"
        | "reservado"
        | "em_assistencia"
        | "vendido"
        | "devolvido_fornecedor"
        | "devolvido_cliente"
      payment_method:
        | "pix"
        | "dinheiro"
        | "cartao_credito"
        | "cartao_debito"
        | "crediario"
        | "outro"
      sale_status: "concluida" | "cancelada"
      store_role: "owner" | "manager" | "seller"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      device_condition: ["novo", "seminovo"],
      device_status: [
        "em_transito",
        "em_conferencia",
        "disponivel",
        "reservado",
        "em_assistencia",
        "vendido",
        "devolvido_fornecedor",
        "devolvido_cliente",
      ],
      payment_method: [
        "pix",
        "dinheiro",
        "cartao_credito",
        "cartao_debito",
        "crediario",
        "outro",
      ],
      sale_status: ["concluida", "cancelada"],
      store_role: ["owner", "manager", "seller"],
    },
  },
} as const
