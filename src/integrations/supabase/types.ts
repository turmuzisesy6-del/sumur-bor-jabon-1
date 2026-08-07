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
      kas: {
        Row: {
          created_at: string
          id: string
          keluar: number
          masuk: number
          nama_barang: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          id?: string
          keluar?: number
          masuk?: number
          nama_barang: string
          tanggal?: string
        }
        Update: {
          created_at?: string
          id?: string
          keluar?: number
          masuk?: number
          nama_barang?: string
          tanggal?: string
        }
        Relationships: []
      }
      pelanggan: {
        Row: {
          akses_token: string
          alamat: string | null
          created_at: string
          foto_url: string | null
          id: string
          nama: string
          no_hp: string | null
          nomor_pelanggan: string | null
          status_aktif: boolean
        }
        Insert: {
          akses_token?: string
          alamat?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nama: string
          no_hp?: string | null
          nomor_pelanggan?: string | null
          status_aktif?: boolean
        }
        Update: {
          akses_token?: string
          alamat?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nama?: string
          no_hp?: string | null
          nomor_pelanggan?: string | null
          status_aktif?: boolean
        }
        Relationships: []
      }
      pengajuan_perubahan: {
        Row: {
          alasan_penolakan: string | null
          created_at: string
          id: string
          nama_baru: string | null
          nama_lama: string | null
          no_hp_baru: string | null
          no_hp_lama: string | null
          pelanggan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          alasan_penolakan?: string | null
          created_at?: string
          id?: string
          nama_baru?: string | null
          nama_lama?: string | null
          no_hp_baru?: string | null
          no_hp_lama?: string | null
          pelanggan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          alasan_penolakan?: string | null
          created_at?: string
          id?: string
          nama_baru?: string | null
          nama_lama?: string | null
          no_hp_baru?: string | null
          no_hp_lama?: string | null
          pelanggan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pengajuan_perubahan_pelanggan_id_fkey"
            columns: ["pelanggan_id"]
            isOneToOne: false
            referencedRelation: "pelanggan"
            referencedColumns: ["id"]
          },
        ]
      }
      pengaturan: {
        Row: {
          beban: number | null
          email: string | null
          id: number
          nama_petugas: string | null
          nama_sumur: string | null
          no_hp_petugas: string | null
          tarif: number | null
          website: string | null
        }
        Insert: {
          beban?: number | null
          email?: string | null
          id?: number
          nama_petugas?: string | null
          nama_sumur?: string | null
          no_hp_petugas?: string | null
          tarif?: number | null
          website?: string | null
        }
        Update: {
          beban?: number | null
          email?: string | null
          id?: number
          nama_petugas?: string | null
          nama_sumur?: string | null
          no_hp_petugas?: string | null
          tarif?: number | null
          website?: string | null
        }
        Relationships: []
      }
      tagihan: {
        Row: {
          beban: number
          created_at: string
          foto_meter_url: string | null
          id: string
          meter_baru: number
          meter_lama: number
          nama_pelanggan: string | null
          no_hp: string | null
          pelanggan_id: string | null
          pemakaian: number
          status: string
          tanggal: string
          tarif: number
          total: number
        }
        Insert: {
          beban?: number
          created_at?: string
          foto_meter_url?: string | null
          id?: string
          meter_baru?: number
          meter_lama?: number
          nama_pelanggan?: string | null
          no_hp?: string | null
          pelanggan_id?: string | null
          pemakaian?: number
          status?: string
          tanggal?: string
          tarif?: number
          total?: number
        }
        Update: {
          beban?: number
          created_at?: string
          foto_meter_url?: string | null
          id?: string
          meter_baru?: number
          meter_lama?: number
          nama_pelanggan?: string | null
          no_hp?: string | null
          pelanggan_id?: string | null
          pemakaian?: number
          status?: string
          tanggal?: string
          tarif?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "tagihan_pelanggan_id_fkey"
            columns: ["pelanggan_id"]
            isOneToOne: false
            referencedRelation: "pelanggan"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
