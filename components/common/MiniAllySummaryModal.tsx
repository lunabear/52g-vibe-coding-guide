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
    personaProfile: '타겟 사용자',
    painPointContext: '문제 상황',
    painPointReason: '문제의 원인',
    coreProblemStatement: '핵심 문제',
    solutionNameIdea: '아이디어 이름',
    solutionMechanism: '작동 방식',
    expectedOutcome: '기대 효과'
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
    return `타겟 사용자

${data.personaProfile || ''}

문제 상황

${data.painPointContext || ''}

문제의 원인

${data.painPointReason || ''}

핵심 문제

${data.coreProblemStatement || ''}

솔루션

아이디어 이름
${data.solutionNameIdea || ''}

작동 방식
${data.solutionMechanism || ''}

기대 효과
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
        {/* 타겟 사용자 */}
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900 mb-3">타겟 사용자</h3>
          <EditableText 
            field="personaProfile" 
            value={data.personaProfile}
            placeholder="이 서비스의 핵심 타겟 사용자는 누구인가요? 직업, 역할, 목표, 현재 상황 등을 구체적으로 설명해주세요."
          />
        </div>

        {/* 문제 분석 */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-[16px] font-semibold text-gray-900 mb-4">문제 분석</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">문제 상황</h4>
              <EditableText 
                field="painPointContext" 
                value={data.painPointContext}
                placeholder="사용자는 언제, 어디서, 어떤 구체적인 상황에서 불편함을 경험하나요? 문제가 발생하는 특정 시나리오를 상세히 설명해주세요."
              />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">문제의 원인</h4>
              <EditableText 
                field="painPointReason" 
                value={data.painPointReason}
                placeholder="왜 이 상황을 불편하게 느끼나요? 근본적인 원인과 사용자가 충족시키고 싶은 핵심적인 욕구는 무엇인가요?"
              />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">핵심 문제</h4>
              <EditableText 
                field="coreProblemStatement" 
                value={data.coreProblemStatement}
                placeholder="해결해야 할 핵심 문제를 한 문장으로 요약해주세요. '[사용자]는 [목표/상황]에서 [어려움] 때문에 [부정적 결과]를 겪는다' 형식으로 작성해보세요."
                className="text-[14px] text-gray-700 leading-relaxed font-medium"
              />
            </div>
          </div>
        </div>

        {/* 솔루션 */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-[16px] font-semibold text-gray-900 mb-4">솔루션</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">아이디어 이름</h4>
              <EditableText 
                field="solutionNameIdea" 
                value={data.solutionNameIdea}
                placeholder="이 해결책을 어떻게 부르시겠어요? 솔루션의 특징을 잘 나타내는 간결한 이름을 지어주세요."
                className="text-[14px] text-gray-700 leading-relaxed font-medium"
              />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">작동 방식</h4>
              <EditableText 
                field="solutionMechanism" 
                value={data.solutionMechanism}
                placeholder="이 해결책이 어떻게 작동하나요? 사용자가 문제를 해결하는 과정을 단계별로 구체적으로 설명해주세요."
              />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-gray-800 mb-2">기대 효과</h4>
              <EditableText 
                field="expectedOutcome" 
                value={data.expectedOutcome}
                placeholder="이 솔루션을 통해 사용자는 어떤 긍정적인 변화를 얻게 될까요? 사용자의 삶이나 업무가 어떻게 개선될지 설명해주세요."
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
              ? "대화 내용을 정리하고 있어요" 
              : "대화 내용을 정리해봤어요"
            }
          </DialogTitle>
          <DialogDescription className="text-gray-500 leading-relaxed text-[14px] custom:text-[15px] mt-1">
            {loading 
              ? "지금까지의 대화를 요약하여 다음 단계 진행을 위해 준비하고 있습니다." 
              : "내용을 클릭하여 수정하거나, 확인 후 다음 단계로 진행해주세요."
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
                <p className="text-[15px] font-light text-gray-700">대화 내용을 분석 중입니다</p>
                <div className="flex justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                </div>
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
            {/* 확인 안내 메시지 */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-[13px] custom:text-[14px] font-normal text-gray-700">
                  내용을 확인하셨나요?
                </p>
                <p className="text-[11px] custom:text-[12px] text-gray-500">
                  각 항목을 클릭하여 수정하거나, 확인 후 진행해주세요.
                </p>
              </div>
            </div>
            
            {/* 다음 단계 버튼 */}
            {editableData && (
              <Button 
                onClick={handleConfirm}
                className="text-[14px] custom:text-[15px] bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2"
              >
                다음 단계로 진행
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 