'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (containerRef.current) {
        try {
          // Initialize mermaid with more lenient settings
          mermaid.initialize({ 
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
              htmlLabels: true,
              useMaxWidth: true
            },
            themeVariables: {
              primaryColor: '#3b82f6',
              primaryTextColor: '#fff',
              primaryBorderColor: '#2563eb',
              lineColor: '#6b7280',
              secondaryColor: '#f3f4f6',
              tertiaryColor: '#e5e7eb'
            }
          });
          
          // Clean up the chart text to handle common issues
          let processedChart = chart
            .replace(/\(/g, '（')  // Replace parentheses with full-width versions
            .replace(/\)/g, '）')
            .replace(/\[/g, '［')
            .replace(/\]/g, '］');
          
          containerRef.current.innerHTML = '';
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, processedChart);
          containerRef.current.innerHTML = svg;
        } catch (error: any) {
          console.error('Failed to render mermaid diagram:', error);
          // Show the original chart as fallback with proper formatting
          containerRef.current.innerHTML = `
            <div class="text-red-600 text-sm">
              <p class="font-semibold mb-2">Failed to render diagram</p>
              <p class="text-xs text-gray-600 mb-3">${error?.message || error}</p>
              <pre class="bg-gray-800 text-gray-200 p-4 rounded overflow-x-auto text-xs">${chart.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              <p class="text-xs text-gray-500 mt-2">Tip: Parentheses or special characters may cause issues.</p>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div 
      ref={containerRef} 
      className="my-6 flex justify-center overflow-x-auto bg-gray-50 p-4 rounded-lg"
    />
  );
};