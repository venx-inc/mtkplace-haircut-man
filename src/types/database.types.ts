// Tipos escritos à mão, espelhando supabase/migrations/0001_init.sql.
// Quando o projeto Supabase estiver criado, troque isso pelo gerado via:
//   npm run db:types
// (precisa da Supabase CLI e do SUPABASE_PROJECT_ID no ambiente)
//
// Duas armadilhas de tipos aqui que custam caro em silêncio:
// 1. Todo tipo de linha usa `type`, nunca `interface` — o supabase-js resolve
//    `interface` de forma diferente dentro de generics profundos e cada
//    `.from(tabela)` acaba virando `never` sem erro nenhum na definição.
// 2. `Database` não referencia a si mesmo (nada de `Database["public"]["Tables"][...]`
//    dentro da própria definição) — isso também quebra a inferência em cadeia.

export type UserRole = "cliente" | "profissional" | "admin";
export type VerificationStatus = "pendente" | "verificado" | "rejeitado";
export type ContactStatus = "novo" | "respondido" | "concluido";

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ProfessionalRow = {
  id: string;
  profile_id: string;
  business_name: string;
  slug: string;
  bio: string | null;
  city: string;
  state: string;
  cover_image_url: string | null;
  verification_status: VerificationStatus;
  verification_doc_url: string | null;
  avg_rating: number;
  review_count: number;
  created_at: string;
};

export type ServiceRow = {
  id: string;
  professional_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_from: number | null;
  duration_minutes: number | null;
  created_at: string;
};

export type PortfolioCaseRow = {
  id: string;
  professional_id: string;
  title: string;
  before_image_url: string;
  after_image_url: string;
  description: string | null;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  professional_id: string;
  client_profile_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type ContactRequestRow = {
  id: string;
  professional_id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  message: string | null;
  status: ContactStatus;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id" | "full_name">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: Partial<CategoryRow>;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      professionals: {
        Row: ProfessionalRow;
        Insert: Partial<ProfessionalRow> &
          Pick<ProfessionalRow, "profile_id" | "business_name" | "slug" | "city" | "state">;
        Update: Partial<ProfessionalRow>;
        Relationships: [
          {
            foreignKeyName: "professionals_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      services: {
        Row: ServiceRow;
        Insert: Partial<ServiceRow> & Pick<ServiceRow, "professional_id" | "category_id" | "name">;
        Update: Partial<ServiceRow>;
        Relationships: [
          {
            foreignKeyName: "services_professional_id_fkey";
            columns: ["professional_id"];
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      portfolio_cases: {
        Row: PortfolioCaseRow;
        Insert: Partial<PortfolioCaseRow> &
          Pick<PortfolioCaseRow, "professional_id" | "title" | "before_image_url" | "after_image_url">;
        Update: Partial<PortfolioCaseRow>;
        Relationships: [
          {
            foreignKeyName: "portfolio_cases_professional_id_fkey";
            columns: ["professional_id"];
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: ReviewRow;
        Insert: Partial<ReviewRow> & Pick<ReviewRow, "professional_id" | "client_profile_id" | "rating">;
        Update: Partial<ReviewRow>;
        Relationships: [
          {
            foreignKeyName: "reviews_professional_id_fkey";
            columns: ["professional_id"];
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_client_profile_id_fkey";
            columns: ["client_profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      contact_requests: {
        Row: ContactRequestRow;
        Insert: Partial<ContactRequestRow> &
          Pick<ContactRequestRow, "professional_id" | "client_name" | "client_phone">;
        Update: Partial<ContactRequestRow>;
        Relationships: [
          {
            foreignKeyName: "contact_requests_professional_id_fkey";
            columns: ["professional_id"];
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      verification_status: VerificationStatus;
      contact_status: ContactStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Professional = ProfessionalRow;
export type Service = ServiceRow;
export type Category = CategoryRow;
export type PortfolioCase = PortfolioCaseRow;
export type Review = ReviewRow;
