'use client';

import React from 'react';

interface FlowNode {
  id: string;
  label: string;
  type: 'rectangle' | 'diamond' | 'circle' | 'start' | 'end';
  level?: number;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'success' | 'error' | 'normal';
}

interface FlowChartData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowChartProps {
  data: FlowChartData;
}

export const FlowChart: React.FC<FlowChartProps> = ({ data }) => {
  // 단일 컬러(검정) 팔레트
  const EDGE_COLOR = {
    normal: '#000000',
    success: '#000000',
    error: '#000000'
  } as const;
  const NODE_STROKE = {
    default: '#000000',
    accent: '#000000'
  } as const;
  // 자동 레이아웃 계산
  const calculateLayout = (nodes: FlowNode[], edges: FlowEdge[]) => {
    const nodeWidth = 140;
    const nodeHeight = 60;
    const levelGap = 120;
    const nodeGap = 40;
    
    // 레벨별로 노드 그룹화 (깊이 우선 탐색)
    const levels: { [key: number]: FlowNode[] } = {};
    const visited = new Set<string>();
    
    const dfs = (nodeId: string, level: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        node.level = level;
        if (!levels[level]) levels[level] = [];
        levels[level].push(node);
        
        // 자식 노드들 방문
        edges
          .filter(e => e.from === nodeId)
          .forEach(e => dfs(e.to, level + 1));
      }
    };
    
    // 시작 노드 찾기 (들어오는 엣지가 없는 노드)
    const startNodes = nodes.filter(node => 
      !edges.some(edge => edge.to === node.id)
    );
    
    startNodes.forEach(node => dfs(node.id, 0));
    
    // 각 레벨의 노드들에 위치 할당
    const positionedNodes = nodes.map(node => {
      const level = node.level || 0;
      const levelNodes = levels[level] || [];
      const index = levelNodes.findIndex(n => n.id === node.id);
      const totalWidth = levelNodes.length * (nodeWidth + nodeGap) - nodeGap;
      const startX = -totalWidth / 2;
      
      return {
        ...node,
        x: startX + index * (nodeWidth + nodeGap) + nodeWidth / 2,
        y: level * levelGap + nodeHeight / 2
      };
    });
    
    return positionedNodes;
  };
  
  const positionedNodes = calculateLayout(data.nodes, data.edges);
  
  // SVG 크기 계산
  const maxX = Math.max(...positionedNodes.map(n => n.x || 0)) + 40;
  const maxY = Math.max(...positionedNodes.map(n => n.y || 0)) + 30;
  const minX = Math.min(...positionedNodes.map(n => n.x || 0)) - 40;
  const minY = Math.min(...positionedNodes.map(n => n.y || 0)) - 40;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // 노드 렌더링 함수
  const renderNode = (node: FlowNode & { x: number; y: number }) => {
    const nodeWidth = 140;
    const nodeHeight = 60;
    
    const commonProps = {
      fill: 'white',
      stroke: node.type === 'start' || node.type === 'end' ? NODE_STROKE.accent : NODE_STROKE.default,
      strokeWidth: node.type === 'start' || node.type === 'end' ? '2' : '1',
      className: 'filter drop-shadow-sm'
    };
    
    let shape;
    switch (node.type) {
      case 'diamond':
        const points = `${node.x},${node.y - nodeHeight/2} ${node.x + nodeWidth/2},${node.y} ${node.x},${node.y + nodeHeight/2} ${node.x - nodeWidth/2},${node.y}`;
        shape = <polygon points={points} {...commonProps} />;
        break;
      case 'circle':
        shape = <ellipse cx={node.x} cy={node.y} rx={nodeWidth/2} ry={nodeHeight/2} {...commonProps} />;
        break;
      default:
        shape = (
          <rect 
            x={node.x - nodeWidth/2} 
            y={node.y - nodeHeight/2} 
            width={nodeWidth} 
            height={nodeHeight} 
            rx="8" 
            {...commonProps} 
          />
        );
    }
    
    return (
      <g key={node.id}>
        {shape}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-black"
          style={{ fontSize: '12px' }}
        >
          {node.label.length > 12 ? 
            <>
              <tspan x={node.x} dy="-0.3em">{node.label.slice(0, 12)}</tspan>
              <tspan x={node.x} dy="1.2em">{node.label.slice(12)}</tspan>
            </> :
            node.label
          }
        </text>
      </g>
    );
  };
  
  // 엣지 렌더링 함수
  const renderEdge = (edge: FlowEdge) => {
    const fromNode = positionedNodes.find(n => n.id === edge.from);
    const toNode = positionedNodes.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return null;
    
    const color = '#000000';
    const markerId = 'arrowhead-black';
    
    const startX = fromNode.x;
    const startY = (fromNode.y || 0) + 30; // nodeHeight/2 하단에서 시작
    const endX = toNode.x;
    const endY = (toNode.y || 0) - 30; // nodeHeight/2 상단에서 종료
    
    const fromLevel = (fromNode as any).level ?? 0;
    const toLevel = (toNode as any).level ?? 0;
    const isImmediateNextLevel = toLevel === fromLevel + 1;
    
    return (
      <g key={`${edge.from}-${edge.to}`}>
        {isImmediateNextLevel ? (
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={color}
            strokeWidth="2"
            markerEnd={`url(#${markerId})`}
            className="filter drop-shadow-sm"
          />
        ) : (
          // 원거리(레벨 건너뜀 등)는 깔끔한 직각(맨해튼) 경로로 렌더링
          <path
            d={`M ${startX} ${startY} L ${startX} ${(startY + endY) / 2} L ${endX} ${(startY + endY) / 2} L ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            markerEnd={`url(#${markerId})`}
            className="filter drop-shadow-sm"
          />
        )}
        {edge.label && (
          <text
            x={(startX + endX) / 2}
            y={(startY + endY) / 2}
            textAnchor="middle"
            className="text-xs fill-black"
            style={{ fontSize: '10px' }}
          >
            <tspan 
              x={(startX + endX) / 2}
              dy="0.3em"
              className="bg-white px-1"
            >
              {edge.label}
            </tspan>
          </text>
        )}
      </g>
    );
  };
  
  return (
    <div className="my-2 bg-gray-50 p-3 rounded-lg overflow-auto">
      <svg 
        width={width}
        height={height}
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="w-full"
        style={{ minHeight: '220px' }}
      >
        {/* 화살표 마커 정의 */}
        <defs>
          <marker id="arrowhead-black" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#000000" />
          </marker>
        </defs>
        
        {/* 엣지 먼저 그리기 */}
        {data.edges.map(renderEdge)}
        
        {/* 노드 나중에 그리기 */}
        {positionedNodes.map(renderNode)}
      </svg>
    </div>
  );
};