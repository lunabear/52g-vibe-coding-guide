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
    if (name.includes('start') || name.includes('start')) {
      return <Play className="w-4 h-4 text-white fill-current" />;
    } else if (name.includes('end') || name.includes('end') || name.includes('done')) {
      return <CheckCircle2 className="w-4 h-4 text-white" />;
    } else {
      return <Bot className="w-4 h-4 text-white" />;
    }
  };

  const isLLMNode = (nodeName: string) => {
    const name = nodeName.toLowerCase();
    return name.includes('llm') || name.includes('ai') || name.includes('gpt') || name.includes('gemini') || name.includes('generate');
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
    
    // If prompt already generated, show modal
    if (promptStates[nodeKey]?.generated) {
      setModalState({
        isOpen: true,
        nodeName: node.name,
        prompt: promptStates[nodeKey].result
      });
      return;
    }

    // Start loading state
    setPromptStates(prev => ({
      ...prev,
      [nodeKey]: { loading: true, generated: false, result: '' }
    }));

    try {
      const query = `Generate a prompt for the node ${node.name}. This node is responsible for "${node.description}".`;
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
        throw new Error('Failed to generate prompt.');
      }

      const data = await response.json();
      
      // Success state update
      setPromptStates(prev => ({
        ...prev,
        [nodeKey]: { loading: false, generated: true, result: data.result }
      }));

    } catch (error) {
      console.error('Prompt generation error:', error);
      
      // Error state update
      setPromptStates(prev => ({
        ...prev,
        [nodeKey]: { loading: false, generated: false, result: '' }
      }));
      
      alert('An error occurred while generating the prompt.');
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
    if (name.includes('start') || name.includes('start')) {
      return 'bg-pink-500';
    } else if (name.includes('end') || name.includes('end') || name.includes('done')) {
      return 'bg-green-500';
    } else {
      return 'bg-blue-500';
    }
  };

  // order에 따라 정렬
  const sortedFlow = [...flow].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full">
      <h3 className="text-base font-medium text-gray-900 mb-6">Workflow</h3>
      
      {/* Vertical flow container */}
      <div className="space-y-0">
        {sortedFlow.map((node, index) => (
          <div key={`${node.name}-${node.order}`} className="flex flex-col items-center">
            {/* Node block */}
            <div className="bg-white border-2 border-green-400 rounded-xl px-4 py-3 w-full max-w-sm flex items-center gap-3 shadow-sm relative">
              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNodeColor(node.name, index)}`}>
                {getNodeIcon(node.name, index)}
              </div>
              
              {/* Content */}
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
                      Parallel
                    </span>
                  </div>
                )}
              </div>

              {/* Prompt generate/view buttons for LLM nodes */}
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
                        Generating...
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
                        View Prompt
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
                      Generate Prompt
                    </button>
                  </div>
                );
              })()}

              {/* Connection point - bottom */}
              {index < sortedFlow.length - 1 && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Connector line */}
            {index < sortedFlow.length - 1 && (
              <div className="w-0.5 h-6 bg-black flex-shrink-0"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Summary info */}
      <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 flex items-center justify-between">
          <span>Total {flow.length} steps</span>
          <span>{flow.some(node => node.parallel_group) ? 'Parallel' : 'Sequential'}</span>
        </div>
      </div>

      {/* Prompt modal */}
      <PromptModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, nodeName: '', prompt: '' })}
        nodeName={modalState.nodeName}
        prompt={modalState.prompt}
      />
    </div>
  );
} 