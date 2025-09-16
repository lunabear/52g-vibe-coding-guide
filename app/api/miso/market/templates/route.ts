import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, author, organization, description, long_description, thumbnail_url, v0_project_url, miso_yaml_url, category_name, pin, yaml_assets } = body ?? {};

    const { data, error } = await supabaseAdmin.rpc("miso_upsert_template", {
      p_id: id ?? null,
      p_title: title,
      p_author: author,
      p_organization: organization ?? null,
      p_description: description ?? null,
      p_long_description: long_description ?? null,
      p_thumbnail_url: thumbnail_url,
      p_v0_project_url: v0_project_url ?? null,
      p_miso_yaml_url: miso_yaml_url ?? null,
      p_category_name: category_name,
      p_pin: pin,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Sync YAML assets if provided
    try {
      if (data?.id && Array.isArray(yaml_assets)) {
        // Clear existing
        const del = await supabaseAdmin
          .from("miso_template_assets")
          .delete()
          .eq("template_id", data.id);
        if (del.error) throw del.error;

        if (yaml_assets.length > 0) {
          const ins = await supabaseAdmin
            .from("miso_template_assets")
            .insert(
              yaml_assets.map((a: any) => ({
                template_id: data.id,
                url: a.url,
                kind: a.kind,
              }))
            );
          if (ins.error) throw ins.error;
        }
      }
    } catch (syncErr: any) {
      return NextResponse.json({ error: syncErr?.message ?? "Failed to sync YAML assets" }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pin = searchParams.get("pin");
    if (!id || !pin) return NextResponse.json({ error: "id and pin required" }, { status: 400 });

    const { error } = await supabaseAdmin.rpc("miso_delete_template", { p_id: id, p_pin: pin });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


