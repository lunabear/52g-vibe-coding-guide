import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, CheckCircle2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { saveMiniAllySession } from '@/lib/mini-ally-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ProjectData {
  personaProfile: string | null;
  painPointContext: string | null;
  painPointReason: string | null;
  coreProblemStatement: string | null;
  solutionNameIdea: string | null;
  solutionMechanism: string | null;
  expectedOutcome: string | null;
}

interface MiniAllySummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  projectData: ProjectData | null;
  onConfirm?: (content: string) => void; // optional로 변경 (하위 호환성)
  action?: string; // 액션 타입 추가
}

export function MiniAllySummaryModal({
  open,
  onOpenChange,
  loading,
  projectData,
  onConfirm,
  action,
}: MiniAllySummaryModalProps) {
  const router = useRouter();
  const [editableData, setEditableData] = useState<ProjectData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  // projectData가 변경될 때마다 editableData 업데이트
  useEffect(() => {
    if (projectData) {
      setEditableData({ ...projectData });
    }
  }, [projectData]);

  // 필드별 라벨 정의
  const fieldLabels: Record<keyof ProjectData, string> = {
    personaProfile: 'Target user',
    painPointContext: 'Situation',
    painPointReason: 'Root cause',
    coreProblemStatement: 'Core problem',
    solutionNameIdea: 'Idea name',
    solutionMechanism: 'Mechanism',
    expectedOutcome: 'Expected outcome'
  };

  // 빈 필드 검증 함수
  const validateFields = (data: ProjectData): string[] => {
    const emptyFields: string[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (!value || value.trim().length === 0) {
        emptyFields.push(fieldLabels[key as keyof ProjectData]);
      }
    });
    
    return emptyFields;
  };

  // 프로젝트 데이터를 일반 텍스트 형태로 포맷팅
  const formatProjectData = (data: ProjectData): string => {
    return `Target user

${data.personaProfile || ''}

Situation

${data.painPointContext || ''}

Root cause

${data.painPointReason || ''}

Core problem

${data.coreProblemStatement || ''}

Solution

Idea name
${data.solutionNameIdea || ''}

Mechanism
${data.solutionMechanism || ''}

Expected outcome
${data.expectedOutcome || ''}`;
  };

  // 확인 버튼 클릭 시 편집된 내용으로 진행
  const handleConfirm = () => {
    if (editableData) {
      const emptyFields = validateFields(editableData);
      
      if (emptyFields.length > 0) {
        toast.error('내용이 부족합니다', {
          description: `다음 항목들을 클릭해서 작성해주세요: ${emptyFields.join(', ')}`
        });
        return;
      }
      
      // mini-ally 세션 저장
      saveMiniAllySession(editableData, 'expert-questions');
      
      // 모달 닫기
      onOpenChange(false);
      
      // 액션에 따라 다른 페이지로 이동
      if (action === 'generate_miso') {
        // MISO 설계 도우미로 가는 경우 step을 'miso-design'으로 업데이트
        saveMiniAllySession(editableData, 'miso-design');
        router.push('/miso-generator?fromMiniAlly=true');
      } else {
        // 기본값: prd-generator 페이지로 이동 (전문가 질문 단계)
        router.push('/prd-generator?fromMiniAlly=true&step=insight');
      }
    }
  };

  // 필드 편집 시작
  const startEditing = (field: string) => {
    setEditingField(field);
  };

  // 필드 편집 완료
  const finishEditing = () => {
    setEditingField(null);
  };

  // 필드 값 업데이트
  const updateField = (field: keyof ProjectData, value: string) => {
    if (editableData) {
      setEditableData({
        ...editableData,
        [field]: value
      });
    }
  };

  // 편집 가능한 텍스트 컴포넌트
  const EditableText = ({ 
    field, 
    value, 
    placeholder,
    className = "text-[14px] text-gray-700 leading-relaxed"
  }: { 
    field: keyof ProjectData; 
    value: string | null; 
    placeholder?: string;
    className?: string;
  }) => {
    const isEditing = editingField === field;
    const isEmpty = !value || value.trim().length === 0;
    const [localValue, setLocalValue] = useState('');

    useEffect(() => {
      if (isEditing) {
        setLocalValue(value || '');
      }
    }, [isEditing, value]);

    const handleFinishEditing = () => {
      updateField(field, localValue);
      finishEditing();
    };

    if (isEditing) {
      return (
        <Textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setLocalValue(value || ''); // 변경사항 저장 안함
              finishEditing();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleFinishEditing();
            }
          }}
          placeholder={placeholder}
          className="w-full min-h-[60px] text-[14px] leading-relaxed resize-none border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
          autoFocus
        />
      );
    }

    return (
      <div
        onClick={() => startEditing(field)}
        className={`${isEmpty ? 'text-gray-400 italic' : className} cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors duration-200 group relative min-h-[40px] flex items-start border border-dashed ${isEmpty ? 'border-gray-300 bg-gray-50' : 'border-transparent'}`}
      >
        <span className="flex-1">
          {isEmpty ? '내용이 충분하지 않습니다. 클릭해서 직접 작성해주세요.' : value}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
          <Edit3 className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    );
  };

  // 프로젝트 데이터를 구조화된 UI로 렌더링
  const renderProjectData = (data: ProjectData) => {
    return (
      <div className="space-y-8">
        {/* Target user */}
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900 mb-3">Target user</h3>
          <EditableText 
            field="personaProfile" 
            value={data.personaProfile}
            placeholder="Who is the core target user of this service? Describe their job, role, goals, and current situation."
          />
        </div>

        {/* Problem analysis */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-[16px] font-semibold text-gray-900 mb-4">Problem analysis</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">Situation</h4>
              <EditableText 
                field="painPointContext" 
                value={data.painPointContext}
                placeholder="When and where do users experience friction? Describe the specific scenario in detail."
              />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">Root cause</h4>
              <EditableText 
                field="painPointReason" 
                value={data.painPointReason}
                placeholder="Why is this frustrating? What is the root cause and the unmet need?"
              />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">Core problem</h4>
              <EditableText 
                field="coreProblemStatement" 
                value={data.coreProblemStatement}
                placeholder="Summarize the core problem in one sentence. e.g., '[User] in [goal/context] experiences [difficulty], resulting in [negative outcome]'."
                className="text-[14px] text-gray-700 leading-relaxed font-medium"
              />
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-[16px] font-semibold text-gray-900 mb-4">Solution</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">Idea name</h4>
              <EditableText 
                field="solutionNameIdea" 
                value={data.solutionNameIdea}
                placeholder="What would you call this solution? Choose a concise, descriptive name."
                className="text-[14px] text-gray-700 leading-relaxed font-medium"
              />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">Mechanism</h4>
              <EditableText 
                field="solutionMechanism" 
                value={data.solutionMechanism}
                placeholder="How does the solution work? Describe the step-by-step process for users."
              />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">Expected outcome</h4>
              <EditableText 
                field="expectedOutcome" 
                value={data.expectedOutcome}
                placeholder="What positive change will users gain? Explain how life or work improves."
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="font-normal text-gray-900 text-[18px] custom:text-[20px]">
            {loading 
              ? "Summarizing the conversation" 
              : "Here’s a summary of the conversation"
            }
          </DialogTitle>
          <DialogDescription className="text-gray-500 leading-relaxed text-[14px] custom:text-[15px] mt-1">
            {loading 
              ? "We’re summarizing the conversation to prepare for the next step." 
              : "Click to edit any section, or confirm and proceed to the next step."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[15px] font-light text-gray-700">Analyzing the conversation</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="pr-4 pb-4">
                <div className="space-y-6">
                  {/* 편집 가능한 콘텐츠 영역 */}
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 min-h-[410px]">
                    {editableData && renderProjectData(editableData)}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            {/* Confirmation hint */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-[13px] custom:text-[14px] font-normal text-gray-700">All set?</p>
                <p className="text-[11px] custom:text-[12px] text-gray-500">Click any field to edit, or confirm to proceed.</p>
              </div>
            </div>
            
            {/* Next step button */}
            {editableData && (
              <Button 
                onClick={handleConfirm}
                className="text-[14px] custom:text-[15px] bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2"
              >
                Proceed to next step
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 