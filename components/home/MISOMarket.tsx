"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { MarketTemplate, MarketCategory } from "@/lib/miso-supabase";
import { fetchCategories, fetchTemplates } from "@/lib/miso-supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "./CategoryFilter";
import { TemplateCard } from "./TemplateCard";
import { UI_CONSTANTS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TemplateEditorModal from "./TemplateEditorModal";

const ALL_LABEL = "전체" as const;
const SEARCH_DEBOUNCE_MS = 200;

export default function MISOMarket() {
  const [selectedTemplate, setSelectedTemplate] = useState<MarketTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_LABEL);
  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [templates, setTemplates] = useState<MarketTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<MarketTemplate | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [keyword]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cats, temps] = await Promise.all([
          fetchCategories(),
          fetchTemplates({ keyword: debouncedKeyword, categoryId: selectedCategory === ALL_LABEL ? undefined : selectedCategory })
        ]);
        if (cancelled) return;
        setCategories(cats);
        const catById = new Map(cats.map(c => [c.id, c] as const));
        setTemplates(
          temps.map(t => ({
            ...t,
            category: t.category_id ? (catById.get(t.category_id) ?? null) : null,
          }))
        );
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "데이터 로드 중 오류가 발생했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, [debouncedKeyword, selectedCategory]);

  const handleTemplateClick = (template: MarketTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCloseModal = () => {
    setSelectedTemplate(null);
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const openEditWithPin = (t: MarketTemplate) => {
    const pin = window.prompt("편집 PIN을 입력하세요") ?? "";
    if (!pin) return;
    setEditingTemplate({ ...t, pin } as any);
    setShowEditor(true);
    setSelectedTemplate(null);
  };

  const handleTemplateSaved = async () => {
    const temps = await fetchTemplates({ keyword: debouncedKeyword, categoryId: selectedCategory === ALL_LABEL ? undefined : selectedCategory });
    const catById = new Map(categories.map(c => [c.id, c] as const));
    setTemplates(
      temps.map(t => ({
        ...t,
        category: t.category_id ? (catById.get(t.category_id) ?? null) : null,
      }))
    );
    setShowEditor(false);
  };

  return (
    <>
      <section className="bg-gradient-to-b from-white to-gray-50 pb-16">
        <div className="w-full max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16"
          >
            <div className="mx-auto">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-2">
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                      템플릿으로 시작하기
                    </span>
                    <div className="space-y-1.5">
                      <h2 className="text-[28px] custom:text-[36px] font-bold text-gray-900 leading-tight">
                        빠른 시작이 어려우신가요?
                      </h2>
                      <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                        동료들의 검증된 바이브코딩·MISO 템플릿으로 빠르게 구현해보세요.
                      </p>
                    </div>
                  </div>

                  <div className="relative w-40 h-28 md:w-64 md:h-40">
                    <Image
                      src="/assets/mini-zoey-miso-market.png"
                      alt="MISO Market 소개 이미지"
                      fill
                      className="object-contain"
                      sizes="(min-width: 768px) 256px, 160px"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="mx-auto pt-1.5">
                <CategoryFilter
                  categories={[ALL_LABEL, ...categories.map(c => c.name)] as unknown as string[]}
                  selected={(selectedCategory === ALL_LABEL ? ALL_LABEL : (categories.find(c => c.id === selectedCategory)?.name ?? ALL_LABEL))}
                  onSelect={(label) => {
                    if (label === ALL_LABEL) return setSelectedCategory(ALL_LABEL);
                    const found = categories.find(c => c.name === label);
                    setSelectedCategory(found?.id ?? ALL_LABEL);
                  }}
                  rightContent={
                    <div className="flex items-center gap-3">
                      <div className="w-40 md:w-64">
                        <Input
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          placeholder="템플릿 검색"
                        />
                      </div>
                      <Button size="sm" onClick={openCreate}>템플릿 등록</Button>
                    </div>
                  }
                />
                {error && (
                  <div className="text-sm text-red-600 py-2">{error}</div>
                )}
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${UI_CONSTANTS.grid.gapX} ${UI_CONSTANTS.grid.gapY} gap-x-8 md:gap-x-10 lg:gap-x-12 min-h-[380px]`}>
                  {templates.map((t) => (
                    <TemplateCard key={t.id} template={{
                      id: t.id,
                      title: t.title,
                      author: t.author,
                      downloads: String(t.downloads),
                      thumbnailUrl: t.thumbnail_url,
                      category: t.category?.name,
                      description: t.description ?? undefined,
                      longDescription: t.long_description ?? undefined,
                      v0ProjectUrl: t.v0_project_url ?? undefined,
                      misoYamlUrl: t.miso_yaml_url ?? undefined,
                      organization: t.organization ?? undefined,
                    }} onClick={() => handleTemplateClick(t)} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Dialog open={!!selectedTemplate} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="relative">
              <div className="px-6 py-5 border-b bg-gray-50">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-16">
                      <Image
                        src="/assets/mini-zoey-hug.png"
                        alt="MISO 캐릭터"
                        fill
                        className="object-contain"
                        sizes="64px"
                        priority
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">{selectedTemplate.title}</h1>
                      <div className="mt-1 text-sm text-gray-600 flex items-center justify-between">
                        <div className="truncate">
                          <span className="font-medium text-gray-800">{selectedTemplate.author}</span>
                          <span className="mx-2 opacity-60">|</span>
                          <span className="font-medium text-gray-800">{selectedTemplate.organization ?? "소속 미상"}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 pl-3">
                          <button
                            onClick={() => openEditWithPin(selectedTemplate)}
                            className="text-xs text-gray-600 hover:text-gray-800 underline underline-offset-4"
                          >
                            편집하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-base text-gray-600 leading-relaxed">
                      {selectedTemplate.description ?? "이 템플릿을 사용하여 빠르게 프로젝트를 시작하세요."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">시작하기</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTemplate.v0_project_url && (
                        <a
                          href={selectedTemplate.v0_project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">바이브코딩 프로젝트</div>
                              <div className="text-sm text-gray-500">v0에서 바로 시작하기</div>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                      {selectedTemplate.miso_yaml_url && (
                        <a
                          href={selectedTemplate.miso_yaml_url}
                          download
                          className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">MISO 워크플로우</div>
                              <div className="text-sm text-gray-500">YAML 파일 다운로드</div>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </a>
                      )}
                    </div>

                    <div className="pt-2 space-y-2">
                      <h3 className="text-lg font-medium text-gray-900">상세 설명</h3>
                      <div className="border border-gray-100 rounded-lg">
                        <div className="p-5 prose prose-neutral max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-code:text-rose-600 prose-pre:bg-gray-100 prose-pre:text-gray-900 prose-img:rounded-md">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {selectedTemplate.long_description || selectedTemplate.description || "이 템플릿의 세부 구조와 사용 방법은 곧 추가될 예정입니다."}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TemplateEditorModal 
        open={showEditor}
        onOpenChange={setShowEditor}
        initialTemplate={editingTemplate}
        onSaved={handleTemplateSaved}
      />
    </>
  );
}