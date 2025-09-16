"use client"
import { ITemplate } from "@/lib/data/templates"

export function TemplateCard({ template, onClick }: { template: ITemplate; onClick?: (t: ITemplate) => void }) {
  return (
    <article
      className="group cursor-pointer h-full flex flex-col"
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(template)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(template);
        }
      }}
    >
      <div className="relative aspect-[3/2] overflow-hidden mb-6 bg-gray-50 rounded-lg">
        <img
          src={template.thumbnailUrl}
          alt={template.title}
          className="w-full h-full object-cover block group-hover:opacity-95 transition-opacity duration-300"
          loading="lazy"
        />
      </div>

      <div className="space-y-3 flex-1 flex flex-col">
        {template.category && (
          <span className="text-primary text-sm font-light tracking-wide uppercase">
            {template.category}
          </span>
        )}

        <h3 className="text-[18px] md:text-[20px] font-light leading-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {template.title}
        </h3>

        {template.description && (
          <p className="text-muted-foreground leading-relaxed line-clamp-2 text-base font-light">
            {template.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 mt-auto">
          <div className="flex items-center gap-2 text-sm font-light">
            <span className="text-foreground">{template.author}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-foreground">{template.organization ?? "소속 미상"}</span>
          </div>
        </div>
      </div>
    </article>
  )
}


