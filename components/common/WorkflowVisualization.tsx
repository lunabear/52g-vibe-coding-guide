'use client';

import { useState } from 'react';
import { WorkflowNode } from '@/types/prd.types';
import { Play, Bot, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import PromptModal from './PromptModal';

interface WorkflowVisualizationProps {
  flow: WorkflowNode[];
  explanation?: string;
}

export default function WorkflowVisualization({ flow, explanation = '' }: WorkflowVisualizationProps) {
  const [promptStates, setPromptStates] = useState<Record<string, { loading: boolean; generated: boolean; result: string }>>({});
  const [modalState, setModalState] = useState<{ isOpen: boolean; nodeName: string; prompt: string }>({
    isOpen: false,
    nodeName: '',
    prompt: ''
  });

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

  const isLLMNode = (nodeName: string) => {
    const name = nodeName.toLowerCase();
    return name.includes('llm') || name.includes('ai') || name.includes('gpt') || name.includes('gemini') || name.includes('생성');
  };

  const createFlowContext = (selectedNode: WorkflowNode) => {
    const flowXML = flow.map(node => 
      `<node name="${node.name}" order="${node.order}" ${node.parallel_group ? `parallel_group="${node.parallel_group}"` : ''}>
        <description>${node.description}</description>
      </node>`
    ).join('\n');

    return `<flow_context>
      <explanation>
        ${explanation}
      </explanation>
      <workflow>
        ${flowXML}
      </workflow>
      <selected_node>
        <name>${selectedNode.name}</name>
        <description>${selectedNode.description}</description>
        <order>${selectedNode.order}</order>
      </selected_node>
    </flow_context>`;
  };

  const handlePromptGenerate = async (node: WorkflowNode) => {
    const nodeKey = `${node.name}-${node.order}`;
    
    // 이미 생성된 프롬프트가 있으면 모달 표시
    if (promptStates[nodeKey]?.generated) {
      setModalState({
        isOpen: true,
        nodeName: node.name,
        prompt: promptStates[nodeKey].result
      });
      return;
    }

    // 로딩 상태 시작
    setPromptStates(prev => ({
      ...prev,
      [nodeKey]: { loading: true, generated: false, result: '' }
    }));

    try {
      const query = `${node.name} 노드에 대한 프롬프트를 생성해주세요. 이 노드는 "${node.description}" 역할을 담당합니다.`;
      const flowContext = createFlowContext(node);

      const response = await fetch('/api/miso/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          flow_context: flowContext,
        }),
      });

      if (!response.ok) {
        throw new Error('프롬프트 생성에 실패했습니다.');
      }

      const data = await response.json();
      
      // 성공 상태 업데이트
      setPromptStates(prev => ({
        ...prev,
        [nodeKey]: { loading: false, generated: true, result: data.result }
      }));

    } catch (error) {
      console.error('프롬프트 생성 오류:', error);
      
      // 에러 상태 업데이트
      setPromptStates(prev => ({
        ...prev,
        [nodeKey]: { loading: false, generated: false, result: '' }
      }));
      
      alert('프롬프트 생성 중 오류가 발생했습니다.');
    }
  };

  const handlePromptView = (node: WorkflowNode) => {
    const nodeKey = `${node.name}-${node.order}`;
    const promptState = promptStates[nodeKey];
    
    if (promptState?.generated) {
      setModalState({
        isOpen: true,
        nodeName: node.name,
        prompt: promptState.result
      });
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

              {/* LLM 노드용 프롬프트 생성/보기 버튼 */}
              {isLLMNode(node.name) && (() => {
                const nodeKey = `${node.name}-${node.order}`;
                const promptState = promptStates[nodeKey];
                
                if (promptState?.loading) {
                  return (
                    <div className="flex-shrink-0 ml-2">
                      <button
                        disabled
                        className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed flex items-center gap-1"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        생성 중...
                      </button>
                    </div>
                  );
                }
                
                if (promptState?.generated) {
                  return (
                    <div className="flex-shrink-0 ml-2">
                      <button
                        onClick={() => handlePromptView(node)}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors"
                      >
                        프롬프트 보기
                      </button>
                    </div>
                  );
                }
                
                return (
                  <div className="flex-shrink-0 ml-2">
                    <button
                      onClick={() => handlePromptGenerate(node)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      프롬프트 생성
                    </button>
                  </div>
                );
              })()}

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

      {/* 프롬프트 모달 */}
      <PromptModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, nodeName: '', prompt: '' })}
        nodeName={modalState.nodeName}
        prompt={modalState.prompt}
      />
    </div>
  );
} 