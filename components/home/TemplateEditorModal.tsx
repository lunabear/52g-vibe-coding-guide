"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { MarketTemplate, MarketCategory, MisoAssetKind } from "@/lib/miso-supabase";
import { upsertTemplateRPC, fetchCategories, fetchTemplateAssets, deleteTemplateRPC } from "@/lib/miso-supabase";

type TemplateEditorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: MarketTemplate | null;
  onSaved?: () => void | Promise<void>;
};

export function TemplateEditorModal({ open, onOpenChange, initialTemplate, onSaved }: TemplateEditorModalProps) {
  const [form, setForm] = useState({
    id: null as string | null,
    title: "",
    author: "",
    organization: "",
    description: "",
    long_description: "",
    thumbnail_url: "",
    v0_project_url: "",
    miso_yaml_url: "",
    category_name: "",
    pin: "",
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [yamlDragOver, setYamlDragOver] = useState<boolean>(false);
  const [thumbDragOver, setThumbDragOver] = useState<boolean>(false);
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [yamlAssets, setYamlAssets] = useState<{ url: string; kind: MisoAssetKind }[]>([]);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleThumbnailPaste = async (
    e: React.ClipboardEvent<HTMLDivElement | HTMLInputElement>
  ) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file && file.type.startsWith("image/")) {
          e.preventDefault();
          const url = await uploadToStorage(file, "images");
          if (url) setForm(prev => ({ ...prev, thumbnail_url: url }));
        }
      }
    }
  };

  const counts = useMemo(() => {
    return {
      title: form.title.length,
      description: form.description.length,
    };
  }, [form.title, form.description]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const yamlInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = initialTemplate;
    if (!t) {
      setForm({
        id: null,
        title: "",
        author: "",
        organization: "",
        description: "",
        long_description: "",
        thumbnail_url: "",
        v0_project_url: "",
        miso_yaml_url: "",
        category_name: "",
        pin: "",
      });
      setYamlAssets([]);
      return;
    }
    setForm({
      id: t.id,
      title: t.title,
      author: t.author,
      organization: t.organization ?? "",
      description: t.description ?? "",
      long_description: t.long_description ?? "",
      thumbnail_url: t.thumbnail_url,
      v0_project_url: t.v0_project_url ?? "",
      miso_yaml_url: t.miso_yaml_url ?? "",
      category_name: t.category?.name ?? "",
      pin: (t as any).pin ?? "",
    });
    (async () => {
      try {
        if (t.id) {
          const assets = await fetchTemplateAssets(t.id);
          setYamlAssets(assets.map(a => ({ url: a.url, kind: a.kind })));
        } else {
          setYamlAssets([]);
        }
      } catch {
        setYamlAssets([]);
      }
    })();
  }, [open, initialTemplate]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (!cancelled) setCategories(cats);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true };
  }, [open]);

  const uploadToStorage = useCallback(async (file: File, folder?: string): Promise<string | null> => {
    const body = new FormData();
    body.append("file", file);
    if (folder) body.append("folder", folder);
    try {
      setIsUploading(true);
      const resp = await fetch("/api/miso/market/assets", { method: "POST", body });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error ?? `업로드 실패 (${resp.status})`);
      }
      const { url } = await resp.json();
      return url as string;
    } catch (e: any) {
      toast.error(e?.message ?? "업로드 중 오류가 발생했습니다.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleEditorDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!e.dataTransfer || !e.dataTransfer.files?.length) return;
    const files = Array.from(e.dataTransfer.files);
    for (const f of files) {
      if (f.type.startsWith("image/")) {
        const url = await uploadToStorage(f, "images");
        if (url) setForm(prev => ({ ...prev, long_description: `${prev.long_description}\n\n![](${url})` }));
      } else if (/(yml|yaml)$/.test(f.name)) {
        const url = await uploadToStorage(f, "yaml");
        if (url) setForm(prev => ({ ...prev, miso_yaml_url: url }));
      }
    }
  };

  const handleEditorDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleEditorDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file && file.type.startsWith("image/")) {
          e.preventDefault();
          const url = await uploadToStorage(file, "images");
          if (url) setForm(prev => ({ ...prev, long_description: `${prev.long_description}\n\n![](${url})` }));
        }
      }
    }
  };

  const triggerFileSelect = (accept: string, ref: { current: HTMLInputElement | null }, options?: { multiple?: boolean }) => {
    if (!ref.current) return;
    ref.current.accept = accept;
    if (typeof options?.multiple === "boolean") {
      ref.current.multiple = options.multiple;
    } else {
      ref.current.multiple = accept.startsWith("image/");
    }
    ref.current.click();
  };

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "yaml" | "thumbnail") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (type === "thumbnail") {
      const url = await uploadToStorage(files[0], "images");
      if (url) setForm(prev => ({ ...prev, thumbnail_url: url }));
    } else if (type === "yaml") {
      for (const f of Array.from(files)) {
        const url = await uploadToStorage(f, "yaml");
        if (url) setYamlAssets(prev => ([...prev, { url, kind: "workflow" }]));
      }
    } else if (type === "image") {
      for (const f of Array.from(files)) {
        const url = await uploadToStorage(f, "images");
        if (url) setForm(prev => ({ ...prev, long_description: `${prev.long_description}\n\n![](${url})` }));
      }
    }
    e.currentTarget.value = "";
  };

  const submitUpsert = async () => {
    if (!form.title || !form.author || !form.thumbnail_url || !form.category_name || !form.pin) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const mainYamlUrl = form.miso_yaml_url || (yamlAssets[0]?.url ?? null);
      await upsertTemplateRPC({
        id: form.id,
        title: form.title,
        author: form.author,
        organization: form.organization || null,
        description: form.description || null,
        long_description: form.long_description || null,
        thumbnail_url: form.thumbnail_url,
        v0_project_url: form.v0_project_url || null,
        miso_yaml_url: mainYamlUrl || null,
        category_name: form.category_name,
        pin: form.pin,
        yaml_assets: yamlAssets,
      });
      onOpenChange(false);
      if (onSaved) await onSaved();
      toast.success(form.id ? "템플릿이 수정되었습니다." : "템플릿이 등록되었습니다.");
    } catch (e: any) {
      toast.error(e?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!form.pin) {
      toast.error("삭제를 위해 PIN을 입력해주세요.");
      return;
    }
    const ok = window.confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteTemplateRPC({ id: form.id, pin: form.pin });
      toast.success("템플릿이 삭제되었습니다.");
      onOpenChange(false);
      if (onSaved) await onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-8 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/assets/miso-market-boss.png"
                alt="MISO Market Boss"
                fill
                className="object-contain"
                sizes="40px"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-medium text-gray-900">
                {form.id ? "템플릿 수정하기" : "새 템플릿 등록하기"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                동료들과 공유할 바이브코딩·MISO 템플릿을 만들어보세요
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6">
          <div className="space-y-8">
            {/* 기본 정보 */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pl-2 border-l-4 border-gray-900/80">
                기본 정보
              </h3>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      템플릿 제목 <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="예: 고객지원 챗봇 템플릿" 
                      value={form.title} 
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-0 py-3 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                    />
                    <div className="flex justify-end"><span className="text-xs text-gray-500">{counts.title}자</span></div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      list="category-suggestions"
                      placeholder="챗봇" 
                      value={form.category_name} 
                      onChange={(e) => setForm({ ...form, category_name: e.target.value })} 
                      className="w-full px-0 py-3 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                    />
                    <datalist id="category-suggestions">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      작성자 <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="이름 입력" 
                      value={form.author} 
                      onChange={(e) => setForm({ ...form, author: e.target.value })} 
                      className="w-full px-0 py-3 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">소속 (선택)</label>
                    <input 
                      type="text"
                      placeholder="회사 또는 팀 이름" 
                      value={form.organization} 
                      onChange={(e) => setForm({ ...form, organization: e.target.value })} 
                      className="w-full px-0 py-3 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">요약 설명</label>
                  <input 
                    type="text"
                    placeholder="챗봇의 핵심 목적과 기능을 간단히 설명해주세요" 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    className="w-full px-0 py-3 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">카드에 표시되는 짧은 설명입니다</p>
                    <span className="text-xs text-gray-500">{counts.description}자</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 썸네일 이미지 */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pl-2 border-l-4 border-gray-900/80">
                썸네일 이미지 <span className="text-red-500 text-sm font-normal align-middle">*</span>
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input 
                    type="text"
                    placeholder="이미지 URL 입력 또는 파일 업로드" 
                    value={form.thumbnail_url} 
                    onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} 
                    onPaste={handleThumbnailPaste}
                    className="flex-1 px-0 py-3 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => triggerFileSelect("image/*", thumbnailInputRef)} 
                    disabled={isUploading}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                  >
                    {isUploading ? "업로드 중..." : "파일 선택"}
                  </Button>
                </div>
                <div
                  className={`relative mt-2 rounded-lg border ${thumbDragOver ? "border-gray-400 ring-2 ring-gray-300" : "border-gray-200"} bg-white p-3 transition-all max-w-xl`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setThumbDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setThumbDragOver(false); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setThumbDragOver(false);
                    const files = e.dataTransfer?.files;
                    if (!files || files.length === 0) return;
                    const file = files[0];
                    if (!file.type.startsWith("image/")) {
                      toast.error("이미지 파일만 첨부할 수 있습니다.");
                      return;
                    }
                    const url = await uploadToStorage(file, "images");
                    if (url) setForm(prev => ({ ...prev, thumbnail_url: url }));
                  }}
                  onPaste={handleThumbnailPaste}
                  tabIndex={0}
                >
                  {form.thumbnail_url ? (
                    <div className="aspect-[3/2] relative max-w-full rounded-md overflow-hidden border border-gray-100">
                      <img 
                        src={form.thumbnail_url} 
                        alt="썸네일 미리보기" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">이미지를 드래그/붙여넣기로 변경</div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-gray-700">이미지를 이 영역에 드래그하여 첨부하세요</div>
                        <div className="text-xs text-gray-500 mt-1">또는 상단 입력/버튼을 사용하거나 클립보드에서 붙여넣기</div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => triggerFileSelect("image/*", thumbnailInputRef)} 
                        disabled={isUploading}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                      >
                        이미지 업로드
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 프로젝트 링크 */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pl-2 border-l-4 border-gray-900/80">
                프로젝트 링크
              </h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">v0 프로젝트 (선택)</label>
                  <input 
                    type="text"
                    placeholder="https://v0.dev/..." 
                    value={form.v0_project_url} 
                    onChange={(e) => setForm({ ...form, v0_project_url: e.target.value })} 
                    className="w-full px-0 py-3 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">MISO YAML (복수 선택 가능)</label>
                  <div 
                    className={`relative rounded-lg border ${yamlDragOver ? "border-gray-400 ring-2 ring-gray-300" : "border-gray-200"} bg-white p-4 transition-all`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setYamlDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setYamlDragOver(false); }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setYamlDragOver(false);
                      const files = e.dataTransfer?.files;
                      if (!files || files.length === 0) return;
                      for (const file of Array.from(files)) {
                        if (!/(yml|yaml)$/i.test(file.name)) {
                          toast.error("YAML(.yml, .yaml) 파일만 첨부할 수 있습니다.");
                          continue;
                        }
                        const url = await uploadToStorage(file, "yaml");
                        if (url) setYamlAssets(prev => ([...prev, { url, kind: "workflow" }]));
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-gray-700">여러 개의 YAML 파일을 이 영역에 드래그하여 첨부하세요</div>
                        <div className="text-xs text-gray-500 mt-1">또는 우측 버튼으로 복수 파일을 선택하세요</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => triggerFileSelect(".yml,.yaml", yamlInputRef, { multiple: true })} 
                          disabled={isUploading}
                          className="px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                        >
                          YAML 업로드
                        </Button>
                      </div>
                    </div>
                    {yamlAssets.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {yamlAssets.map((a, idx) => {
                          const setKind = (k: MisoAssetKind) => setYamlAssets(prev => prev.map((x, i) => i === idx ? { ...x, kind: k } : x));
                          const fileLabel = (() => { try { const p = new URL(a.url).pathname.split('/').pop(); return p || a.url; } catch { return a.url; } })();
                          return (
                            <div key={`${a.url}-${idx}`} className="flex items-center gap-3 justify-between border border-gray-100 rounded-md p-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-700 truncate">{fileLabel}</div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap justify-end">
                                <div className="flex flex-wrap gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setKind("workflow")}
                                    aria-pressed={a.kind === "workflow"}
                                    className={`${a.kind === "workflow" 
                                      ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900" 
                                      : "border-gray-300 hover:bg-transparent hover:text-inherit hover:border-gray-300"} h-8 px-2 text-xs transition-none`}
                                  >
                                    워크플로우
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setKind("agent")}
                                    aria-pressed={a.kind === "agent"}
                                    className={`${a.kind === "agent" 
                                      ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900" 
                                      : "border-gray-300 hover:bg-transparent hover:text-inherit hover:border-gray-300"} h-8 px-2 text-xs transition-none`}
                                  >
                                    에이전트
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setKind("chatflow")}
                                    aria-pressed={a.kind === "chatflow"}
                                    className={`${a.kind === "chatflow" 
                                      ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900" 
                                      : "border-gray-300 hover:bg-transparent hover:text-inherit hover:border-gray-300"} h-8 px-2 text-xs transition-none`}
                                  >
                                    챗플로우
                                  </Button>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setYamlAssets(prev => prev.filter((_, i) => i !== idx))}
                                  className="px-2 py-1 border border-gray-300 rounded-md hover:border-gray-400 transition-colors h-8"
                                >
                                  제거
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 설명 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 pl-2 border-l-4 border-gray-900/80">상세 설명</h3>
                <div className="inline-flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setViewMode("edit")}
                    className={`${viewMode === "edit" ? "bg-gray-900 text-white" : ""} px-3 h-8`}
                  >
                    에디터
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setViewMode("preview")}
                    className={`${viewMode === "preview" ? "bg-gray-900 text-white" : ""} px-3 h-8`}
                  >
                    미리보기
                  </Button>
                </div>
              </div>
              <div className="gap-8">
                {/* 에디터 */}
                {(viewMode === "edit") && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">마크다운 에디터</label>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => triggerFileSelect("image/*", fileInputRef)} 
                        disabled={isUploading}
                        className="text-xs px-3 py-1 hover:bg-gray-100"
                      >
                        + 이미지
                      </Button>
                    </div>
                    <div
                      className={`relative border rounded-lg overflow-hidden h-[50vh] transition-all ${
                        dragOver ? "ring-2 ring-gray-300 border-gray-400" : "border-gray-200"
                      }`}
                      onDrop={handleEditorDrop}
                      onDragOver={handleEditorDragOver}
                      onDragLeave={handleEditorDragLeave}
                    >
                      <Textarea
                        className="w-full h-full resize-none border-0 rounded-lg text-sm leading-relaxed font-mono focus-visible:ring-0 p-4"
                        value={form.long_description}
                        onChange={(e) => setForm({ ...form, long_description: e.target.value })}
                        onPaste={handlePaste}
                      />
                      {dragOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                          <div className="text-center text-gray-700">
                            <div className="text-sm font-medium">여기에 파일을 놓아 업로드하세요</div>
                            <div className="text-xs mt-1 text-gray-500">이미지 · YAML 지원 | 붙여넣기도 가능</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 미리보기 */}
                {(viewMode === "preview") && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">미리보기</label>
                    <div className="border border-gray-200 rounded-lg h-[50vh] overflow-hidden bg-white">
                      <div className="h-full overflow-y-auto p-4">
                        {form.long_description ? (
                          <div className="prose prose-sm prose-neutral max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-code:text-rose-600 prose-pre:bg-gray-100 prose-pre:text-gray-900 prose-img:rounded-md">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                              {form.long_description}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm italic">
                            마크다운을 작성하면 여기에 미리보기가 표시됩니다
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 보안 PIN */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pl-2 border-l-4 border-gray-900/80">
                보안 PIN
              </h3>
              <div className="max-w-sm space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  PIN 번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type={showPin ? "text" : "password"}
                    placeholder="4자리 이상 입력" 
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value })}
                    className="flex-1 px-0 py-3 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPin(v => !v)}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                  >
                    {showPin ? "숨기기" : "보기"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  나중에 템플릿을 수정하거나 삭제할 때 필요합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-6 border-t border-gray-200 px-4 md:px-6">
          <div className="flex-1 text-xs text-gray-500">
            {(!form.title || !form.author || !form.thumbnail_url || !form.category_name || !form.pin) ? (
              <span>필수 입력 누락: {[
                !form.title && "제목",
                !form.author && "작성자",
                !form.thumbnail_url && "썸네일",
                !form.category_name && "카테고리",
                !form.pin && "PIN",
              ].filter(Boolean).join(", ")}</span>
            ) : (
              <span className="text-green-600">모든 필수 항목이 입력되었습니다</span>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            {form.id && (
              <Button 
                variant="outline" 
                onClick={handleDelete} 
                disabled={loading || isUploading || deleting}
                className="border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-600 hover:text-gray-800">
              취소
            </Button>
            <Button 
              onClick={submitUpsert} 
              disabled={loading || isUploading || deleting}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-2"
            >
              {loading || isUploading 
                ? "처리 중..." 
                : form.id ? "수정하기" : "등록하기"
              }
            </Button>
          </div>
        </DialogFooter>

        <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => onFileInputChange(e, "image")} />
        <input ref={yamlInputRef} type="file" className="hidden" onChange={(e) => onFileInputChange(e, "yaml")} />
        <input ref={thumbnailInputRef} type="file" className="hidden" onChange={(e) => onFileInputChange(e, "thumbnail")} />
      </DialogContent>
    </Dialog>
  );
}

export default TemplateEditorModal;