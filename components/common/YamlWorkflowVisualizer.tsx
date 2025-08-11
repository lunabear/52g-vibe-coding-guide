'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Upload, Eye, Code, Settings, MessageCircle, Database, Cpu, CheckCircle } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: string;
  title?: string;
  position?: { x: number; y: number };
  config?: any;
  description?: string;
}

interface WorkflowConnection {
  source: string;
  target: string;
  condition?: string;
}

interface ParsedWorkflow {
  workflow: {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
  };
}

interface YamlWorkflowVisualizerProps {
  yamlContent: string;
  className?: string;
}

const YamlWorkflowVisualizer: React.FC<YamlWorkflowVisualizerProps> = ({ yamlContent, className = '' }) => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [parsedData, setParsedData] = useState<ParsedWorkflow | null>(null);
  const [showYamlInput, setShowYamlInput] = useState(false);
  const [yamlInput, setYamlInput] = useState(yamlContent);

  const parseYaml = (yamlText: string): ParsedWorkflow | null => {
    try {
      const lines = yamlText.split('\n');
      const result: ParsedWorkflow = { workflow: { nodes: [], connections: [] } };
      let currentSection: string | null = null;
      let currentNode: WorkflowNode | null = null;
      let currentConnection: WorkflowConnection | null = null;
      let currentConfig: any = null;
      let inConfig = false;

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        if (trimmed === 'nodes:') {
          currentSection = 'nodes';
          return;
        } else if (trimmed === 'connections:') {
          currentSection = 'connections';
          return;
        }

        if (currentSection === 'nodes') {
          if (trimmed.startsWith('- id:')) {
            if (currentNode) {
              if (currentConfig) (currentNode as any).config = currentConfig;
              result.workflow.nodes.push(currentNode);
            }
            const idValue = trimmed.replace('- id:', '').trim().replace(/['"]/g, '');
            currentNode = { id: idValue, type: 'unknown' };
            currentConfig = null;
            inConfig = false;
          } else if (currentNode && trimmed.includes(':') && !inConfig) {
            const colonIndex = trimmed.indexOf(':');
            const key = trimmed.substring(0, colonIndex).trim();
            let value = trimmed.substring(colonIndex + 1).trim();
            
            if (key === 'config') {
              inConfig = true;
              currentConfig = {};
            } else if (key === 'position') {
              const posMatch = value.match(/\{\s*x:\s*(\d+),\s*y:\s*(\d+)\s*\}/);
              if (posMatch) {
                currentNode.position = { x: parseInt(posMatch[1]), y: parseInt(posMatch[2]) };
              }
            } else {
              value = value.replace(/^["']|["']$/g, '');
              (currentNode as any)[key] = value;
            }
          } else if (inConfig && currentNode && trimmed.includes(':')) {
            const colonIndex = trimmed.indexOf(':');
            const key = trimmed.substring(0, colonIndex).trim();
            let value = trimmed.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
            currentConfig[key] = value;
          }
        }

        if (currentSection === 'connections') {
          if (trimmed.startsWith('- source:')) {
            if (currentConnection) {
              result.workflow.connections.push(currentConnection);
            }
            const sourceValue = trimmed.replace('- source:', '').trim().replace(/['"]/g, '');
            currentConnection = { source: sourceValue, target: '' };
          } else if (currentConnection && trimmed.includes(':')) {
            const colonIndex = trimmed.indexOf(':');
            const key = trimmed.substring(0, colonIndex).trim();
            let value = trimmed.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
            (currentConnection as any)[key] = value;
          }
        }
      });

      if (currentNode) {
        if (currentConfig) (currentNode as any).config = currentConfig;
        result.workflow.nodes.push(currentNode);
      }
      if (currentConnection) {
        result.workflow.connections.push(currentConnection);
      }

      console.log('파싱된 결과:', result);
      return result;
    } catch (error) {
      console.error('YAML 파싱 오류:', error);
      return null;
    }
  };

  useEffect(() => {
    const parsed = parseYaml(yamlContent);
    setParsedData(parsed);
    setYamlInput(yamlContent);
  }, [yamlContent]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'llm': return <Cpu className="w-4 h-4 text-blue-500" />;
      case 'variable': return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'if-else': return <Settings className="w-4 h-4 text-orange-500" />;
      case 'knowledge-retrieval': return <Database className="w-4 h-4 text-indigo-500" />;
      case 'answer': return <Eye className="w-4 h-4 text-green-600" />;
      case 'code': return <Code className="w-4 h-4 text-gray-700" />;
      case 'parallel': return <ChevronRight className="w-4 h-4 text-yellow-500" />;
      case 'human': return <MessageCircle className="w-4 h-4 text-pink-500" />;
      case 'http-request': return <Upload className="w-4 h-4 text-red-500" />;
      default: return <Code className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'llm': return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      case 'variable': return 'bg-purple-100 border-purple-300 hover:bg-purple-200';
      case 'if-else': return 'bg-orange-100 border-orange-300 hover:bg-orange-200';
      case 'knowledge-retrieval': return 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200';
      case 'answer': return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'code': return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
      case 'parallel': return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'human': return 'bg-pink-100 border-pink-300 hover:bg-pink-200';
      case 'http-request': return 'bg-red-100 border-red-300 hover:bg-red-200';
      default: return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
    }
  };

  const handleYamlSubmit = () => {
    const parsed = parseYaml(yamlInput);
    if (parsed) {
      setParsedData(parsed);
      setShowYamlInput(false);
    } else {
      alert('YAML 파싱에 실패했습니다. 형식을 확인해주세요.');
    }
  };

  if (!parsedData) {
    return <div className="flex items-center justify-center h-64">로딩 중...</div>;
  }

  return (
    <div className="w-full bg-white">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-medium text-gray-900">워크플로우 YAML 시각화</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowYamlInput(!showYamlInput)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              YAML 편집
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(yamlContent);
                const button = document.getElementById('copy-yaml-btn-viz');
                if (button) {
                  const originalText = button.textContent;
                  button.textContent = '✓ 복사됨';
                  button.classList.add('bg-green-100', 'text-green-700', 'border-green-300');
                  setTimeout(() => {
                    button.textContent = originalText || '';
                    button.classList.remove('bg-green-100', 'text-green-700', 'border-green-300');
                  }, 2000);
                }
              }}
              id="copy-yaml-btn-viz"
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              YAML 복사
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600">노드를 클릭하여 상세 정보를 확인하세요</p>
      </div>

      {showYamlInput && (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="text-sm font-semibold mb-2">YAML 입력</h4>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            className="w-full h-64 p-3 border rounded font-mono text-xs"
            placeholder="YAML을 입력하세요..."
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleYamlSubmit}
              className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
            >
              적용
            </button>
            <button
              onClick={() => setShowYamlInput(false)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="bg-gray-50 border rounded-lg p-4 min-h-96">
            <h4 className="text-sm font-semibold mb-4 px-2">워크플로우 다이어그램</h4>
            
            <div className="overflow-auto border rounded bg-white" style={{ height: '400px' }}>
              <div className="relative p-4" style={{ width: '1400px', height: '300px', minWidth: '1400px' }}>
                {parsedData.workflow.connections?.map((conn, index) => {
                  const sourceNode = parsedData.workflow.nodes.find(n => n.id === conn.source);
                  const targetNode = parsedData.workflow.nodes.find(n => n.id === conn.target);
                  
                  if (!sourceNode?.position || !targetNode?.position) return null;
                  
                  const startX = sourceNode.position.x + 120;
                  const startY = sourceNode.position.y + 35;
                  const endX = targetNode.position.x;
                  const endY = targetNode.position.y + 35;
                  
                  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                  const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
                  
                  return (
                    <div key={index}>
                      <div
                        className="absolute bg-gray-400 h-0.5"
                        style={{
                          left: startX + 'px',
                          top: startY + 'px',
                          width: length + 'px',
                          transformOrigin: '0 50%',
                          transform: `rotate(${angle}deg)`,
                          zIndex: 1
                        }}
                      />
                      <div
                        className="absolute w-0 h-0 border-l-4 border-l-gray-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"
                        style={{
                          left: (endX - 8) + 'px',
                          top: (endY - 4) + 'px',
                          zIndex: 2
                        }}
                      />
                      {conn.condition && (
                        <div
                          className="absolute text-xs bg-white px-1 rounded border text-gray-600"
                          style={{
                            left: ((startX + endX) / 2 - 15) + 'px',
                            top: ((startY + endY) / 2 - 10) + 'px',
                            zIndex: 3
                          }}
                        >
                          {conn.condition}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {parsedData.workflow.nodes?.map((node) => {
                  if (!node.position) return null;
                  
                  return (
                    <div
                      key={node.id}
                      className={`absolute w-28 h-16 p-2 border-2 rounded-lg cursor-pointer transition-all ${getNodeColor(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-blue-400 shadow-lg' : 'shadow-sm'
                      }`}
                      style={{
                        left: node.position.x + 'px',
                        top: node.position.y + 'px',
                        zIndex: 10
                      }}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {getNodeIcon(node.type)}
                        <span className="text-xs font-medium truncate">
                          {node.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 font-medium leading-tight">
                        {node.title || node.id}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 px-2">
              💡 다이어그램을 좌우로 스크롤하여 전체 워크플로우를 확인하세요
            </div>
          </div>
        </div>

        <div className="w-80">
          <div className="bg-white border rounded-lg p-4 sticky top-4">
            <h4 className="text-sm font-semibold mb-3">노드 상세 정보</h4>
            
            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getNodeIcon(selectedNode.type)}
                  <span className="font-medium">{selectedNode.title || selectedNode.id}</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">ID:</span>
                    <span className="ml-2">{selectedNode.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">타입:</span>
                    <span className="ml-2">{selectedNode.type}</span>
                  </div>
                  {selectedNode.description && (
                    <div>
                      <span className="font-medium text-gray-600">설명:</span>
                      <span className="ml-2">{selectedNode.description}</span>
                    </div>
                  )}
                  {selectedNode.position && (
                    <div>
                      <span className="font-medium text-gray-600">위치:</span>
                      <span className="ml-2">
                        ({selectedNode.position.x}, {selectedNode.position.y})
                      </span>
                    </div>
                  )}
                </div>

                {selectedNode.config && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">설정</h5>
                    <div className="bg-gray-50 p-3 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedNode.config, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-xs">
                노드를 클릭하여 상세 정보를 확인하세요
              </p>
            )}
          </div>

          <div className="bg-white border rounded-lg p-4 mt-4">
            <h4 className="text-sm font-semibold mb-3">워크플로우 통계</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>총 노드 수:</span>
                <span className="font-medium">{parsedData.workflow.nodes?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>연결 수:</span>
                <span className="font-medium">{parsedData.workflow.connections?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>LLM 노드:</span>
                <span className="font-medium">
                  {parsedData.workflow.nodes?.filter(n => n.type === 'llm').length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YamlWorkflowVisualizer;