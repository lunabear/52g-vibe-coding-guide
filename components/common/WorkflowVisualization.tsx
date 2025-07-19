'use client';

import { WorkflowNode } from '@/types/prd.types';
import { Play, Bot, CheckCircle2, Circle } from 'lucide-react';

interface WorkflowVisualizationProps {
  flow: WorkflowNode[];
}

export default function WorkflowVisualization({ flow }: WorkflowVisualizationProps) {
  if (!flow || flow.length === 0) {
    return null;
  }

  const getNodeIcon = (nodeName: string, index: number) => {
    const name = nodeName.toLowerCase();
    if (name.includes('start') || name.includes('시작')) {
      return <Play className="w-4 h-4 text-white fill-current" />;
    } else if (name.includes('end') || name.includes('종료') || name.includes('완료')) {
      return <CheckCircle2 className="w-4 h-4 text-white" />;
    } else {
      return <Bot className="w-4 h-4 text-white" />;
    }
  };

  const getNodeColor = (nodeName: string, index: number) => {
    const name = nodeName.toLowerCase();
    if (name.includes('start') || name.includes('시작')) {
      return 'bg-pink-500';
    } else if (name.includes('end') || name.includes('종료') || name.includes('완료')) {
      return 'bg-green-500';
    } else {
      return 'bg-blue-500';
    }
  };

  // order에 따라 정렬
  const sortedFlow = [...flow].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full">
      <h3 className="text-base font-medium text-gray-900 mb-6">워크플로우</h3>
      
      {/* 세로 플로우 컨테이너 */}
      <div className="space-y-0">
        {sortedFlow.map((node, index) => (
          <div key={`${node.name}-${node.order}`} className="flex flex-col items-center">
            {/* 노드 블록 */}
            <div className="bg-white border-2 border-green-400 rounded-xl px-4 py-3 w-full max-w-sm flex items-center gap-3 shadow-sm relative">
              {/* 아이콘 */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNodeColor(node.name, index)}`}>
                {getNodeIcon(node.name, index)}
              </div>
              
              {/* 콘텐츠 */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 capitalize mb-1">
                  {node.name}
                </h4>
                <p className="text-xs text-gray-500 leading-tight">
                  {node.description.length > 60 
                    ? `${node.description.slice(0, 60)}...` 
                    : node.description
                  }
                </p>
                {node.parallel_group && (
                  <div className="mt-1">
                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                      병렬
                    </span>
                  </div>
                )}
              </div>

              {/* 연결 포인트 - 아래쪽 */}
              {index < sortedFlow.length - 1 && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* 연결선 */}
            {index < sortedFlow.length - 1 && (
              <div className="w-0.5 h-6 bg-black flex-shrink-0"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* 요약 정보 */}
      <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 flex items-center justify-between">
          <span>총 {flow.length}개 단계</span>
          <span>{flow.some(node => node.parallel_group) ? '병렬 처리' : '순차 실행'}</span>
        </div>
      </div>
    </div>
  );
} 