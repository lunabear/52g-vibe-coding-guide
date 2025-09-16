import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const user = (formData.get("user") as string | null) ?? "anonymous";
    const folder = (formData.get("folder") as string | null) ?? undefined;

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const bucket = "market-assets";
    const ext = (() => {
      const name = file.name || "";
      const dot = name.lastIndexOf(".");
      return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
    })();

    const typeFolder = folder
      ? folder
      : file.type.startsWith("image/")
        ? "images"
        : (ext === "yml" || ext === "yaml")
          ? "yaml"
          : "files";

    const timestamp = Date.now();
    const safeUser = user.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 36) || "anon";
    const originalName = file.name || "file";
    const dot = originalName.lastIndexOf(".");
    const base = dot > 0 ? originalName.slice(0, dot) : originalName;
    const safeBase = base
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_.]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    const safeName = `${safeBase || "file"}.${ext || "dat"}`;
    const path = `${typeFolder}/${safeUser}/${timestamp}-${safeName}`;

    const contentType = file.type || ((ext === "yml" || ext === "yaml") ? "text/yaml" : undefined);
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    const url = data.publicUrl;

    return NextResponse.json({ url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


