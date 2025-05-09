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
      categoria_trasacoes: {
        Row: {
          created_at: string
          descricao: string
          id: number
          usuario_id: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: number
          usuario_id: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: number
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "categoria_trasacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      consentimentos_usuarios: {
        Row: {
          created_at: string
          id: number
          tipo_consentimento: string
          usuario_id: number
          valor: boolean
        }
        Insert: {
          created_at?: string
          id?: number
          tipo_consentimento: string
          usuario_id: number
          valor: boolean
        }
        Update: {
          created_at?: string
          id?: number
          tipo_consentimento?: string
          usuario_id?: number
          valor?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "consentimentos_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      lancamentos_futuros: {
        Row: {
          id: number
          usuario_id: number
          tipo: string
          valor: number
          descricao: string
          categoria_id: number | null
          data_prevista: string
          recorrente: boolean
          periodicidade: string | null
          status: string
          pagador_recebedor: string | null
          mes_previsto: string | null
          parcelamento: boolean
          numero_parcelas: number | null
          parcela_atual: number | null
          transacao_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          usuario_id: number
          tipo: string
          valor: number
          descricao: string
          categoria_id?: number | null
          data_prevista: string
          recorrente?: boolean
          periodicidade?: string | null
          status?: string
          pagador_recebedor?: string | null
          mes_previsto?: string | null
          parcelamento?: boolean
          numero_parcelas?: number | null
          parcela_atual?: number | null
          transacao_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          usuario_id?: number
          tipo?: string
          valor?: number
          descricao?: string
          categoria_id?: number | null
          data_prevista?: string
          recorrente?: boolean
          periodicidade?: string | null
          status?: string
          pagador_recebedor?: string | null
          mes_previsto?: string | null
          parcelamento?: boolean
          numero_parcelas?: number | null
          parcela_atual?: number | null
          transacao_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_futuros_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_futuros_categoria_id_fkey"
            columns: ["categoria_id"]
            referencedRelation: "categoria_trasacoes"
            referencedColumns: ["id"]
          }
        ]
      }
      logs_acesso: {
        Row: {
          created_at: string
          detalhes: Json | null
          id: number
          tipo_evento: string
          usuario_id: number
        }
        Insert: {
          created_at?: string
          detalhes?: Json | null
          id?: number
          tipo_evento: string
          usuario_id: number
        }
        Update: {
          created_at?: string
          detalhes?: Json | null
          id?: number
          tipo_evento?: string
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "logs_acesso_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      metas: {
        Row: {
          created_at: string
          descricao: string
          id: number
          valor_atual: number
          valor_meta: number
          usuario_id: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: number
          valor_atual: number
          valor_meta: number
          usuario_id: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: number
          valor_atual?: number
          valor_meta?: number
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      solicitacoes_lgpd: {
        Row: {
          created_at: string
          id: number
          status: string
          tipo_solicitacao: string
          usuario_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          status: string
          tipo_solicitacao: string
          usuario_id: number
        }
        Update: {
          created_at?: string
          id?: number
          status?: string
          tipo_solicitacao?: string
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_lgpd_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      transacoes: {
        Row: {
          created_at: string
          data: string
          descricao: string
          id: number
          tipo: string
          valor: number
          categoria_id: number | null
          usuario_id: number
        }
        Insert: {
          created_at?: string
          data: string
          descricao: string
          id?: number
          tipo: string
          valor: number
          categoria_id?: number | null
          usuario_id: number
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          id?: number
          tipo?: string
          valor?: number
          categoria_id?: number | null
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            referencedRelation: "categoria_trasacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      usuarios: {
        Row: {
          created_at: string
          email: string
          id: number
          nome: string
          telefone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          nome: string
          telefone?: string | null
          status: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          nome?: string
          telefone?: string | null
          status?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
