import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail fast in client for easier debugging; keep console warn to avoid SSR crash
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn("Supabase 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
}

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "");

export type MarketCategory = {
  id: string;
  name: string;
  created_at: string;
};

export type MarketTemplate = {
  id: string;
  title: string;
  author: string;
  organization: string | null;
  description: string | null;
  long_description: string | null;
  thumbnail_url: string;
  v0_project_url: string | null;
  miso_yaml_url: string | null;
  downloads: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category?: MarketCategory | null;
};

export type MisoAssetKind = "agent" | "workflow" | "chatflow";

export type MarketTemplateAsset = {
  id: string;
  template_id: string;
  url: string;
  kind: MisoAssetKind;
  created_at: string;
};

export async function fetchCategories(): Promise<MarketCategory[]> {
  const { data, error } = await supabase
    .from("miso_categories")
    .select("id,name,created_at")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTemplates(params: { categoryId?: string; keyword?: string }) {
  const { categoryId, keyword } = params;
  let query = supabase
    .from("miso_templates")
    .select("id,title,author,organization,description,long_description,thumbnail_url,v0_project_url,miso_yaml_url,downloads,category_id,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (categoryId) query = query.eq("category_id", categoryId);
  if (keyword && keyword.trim().length > 0) {
    const q = keyword.trim();
    query = query.or(
      [
        `title.ilike.%${q}%`,
        `description.ilike.%${q}%`,
        `author.ilike.%${q}%`,
        `organization.ilike.%${q}%`,
      ].join(",")
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as MarketTemplate[]) ?? [];
}

export async function upsertTemplateRPC(input: {
  id?: string | null;
  title: string;
  author: string;
  organization?: string | null;
  description?: string | null;
  long_description?: string | null;
  thumbnail_url: string;
  v0_project_url?: string | null;
  miso_yaml_url?: string | null;
  category_name: string;
  pin: string;
  yaml_assets?: { url: string; kind: MisoAssetKind }[];
}) {
  const resp = await fetch("/api/miso/market/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!resp.ok) {
    const j = await resp.json().catch(() => ({}));
    throw new Error(j?.error ?? `Request failed: ${resp.status}`);
  }
  return (await resp.json()) as MarketTemplate;
}

export async function deleteTemplateRPC(params: { id: string; pin: string }) {
  const u = new URL(location.origin + "/api/miso/market/templates");
  u.searchParams.set("id", params.id);
  u.searchParams.set("pin", params.pin);
  const resp = await fetch(u.toString(), { method: "DELETE" });
  if (!resp.ok) {
    const j = await resp.json().catch(() => ({}));
    throw new Error(j?.error ?? `Request failed: ${resp.status}`);
  }
}

export async function fetchTemplateAssets(templateId: string): Promise<MarketTemplateAsset[]> {
  const { data, error } = await supabase
    .from("miso_template_assets")
    .select("id,template_id,url,kind,created_at")
    .eq("template_id", templateId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as unknown as MarketTemplateAsset[]) ?? [];
}


