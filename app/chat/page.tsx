'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { track } from '@vercel/analytics';
import { ArrowLeft, Send, MoreHorizontal, Edit2, X, Plus, ChevronLeft, Menu, ChevronRight, Home, Paperclip, FileText, Image as ImageIcon, ZoomIn, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getUserId } from '@/lib/user-id';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { usePRDContext } from '@/contexts/PRDContext';
import { MiniAllySummaryModal } from '@/components/common/MiniAllySummaryModal';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: AttachedFile[];
}

interface Conversation {
  id: string;
  name: string;
  updatedAt: Date;
}

interface ProjectData {
  personaProfile: string;
  painPointContext: string;
  painPointReason: string;
  coreProblemStatement: string;
  solutionNameIdea: string;
  solutionMechanism: string;
  expectedOutcome: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedId?: string;
  url?: string;
  isUploading?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { setChatMessages, setProjectSummary } = usePRDContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newName, setNewName] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlSetRef = useRef<Set<string>>(new Set());
  const [journeyId, setJourneyId] = useState<string | null>(null);

  const generateUniqueId = () => {
    try {
      // @ts-ignore
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        // @ts-ignore
        return crypto.randomUUID();
      }
    } catch (_) {}
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Mini Ally Summary 모달 관련 상태
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // ACTION 버튼 파싱 함수
  const parseActionButtons = (content: string) => {
    const actionRegex = /\[ACTION:([^\]]+)\]([^\[]+)\[\/ACTION\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = actionRegex.exec(content)) !== null) {
      // 이전 텍스트 추가
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }
      
      // ACTION 버튼 추가
      parts.push({
        type: 'action',
        action: match[1],
        text: match[2]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // 남은 텍스트 추가
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }
    
    // 파싱된 부분이 없으면 전체 텍스트를 반환
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: content
      });
    }
    
    return parts;
  };

  // ACTION 버튼 클릭 핸들러
  const handleActionClick = async (action: string) => {
    // 대화가 없으면 토스트 표시하고 차단
    if (messages.length === 0) {
      toast.error('먼저 대화를 시작해주세요', {
        description: 'Mini Ally와 대화를 나눈 후 이용하실 수 있습니다.',
        duration: 3000,
      });
      return;
    }

    // 여정 ID 생성 및 클릭 이벤트 추적
    try {
      const jid = (typeof crypto !== 'undefined' && (crypto as any)?.randomUUID)
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setJourneyId(jid);
      const intent = action === 'generate_prd' ? 'generate_prd' : 'generate_miso';
      const ctx = { journey_id: jid, journey_origin: 'chat', journey_intent: intent } as const;
      sessionStorage.setItem('journey_ctx', JSON.stringify(ctx));
      track('chat_to_generate_cta_clicked', {
        feature_area: 'chat',
        target: action === 'generate_prd' ? 'prd' : 'miso',
        journey_id: jid,
        journey_intent: intent,
        has_attachment: attachedFiles.length > 0,
        chat_turn_index: messages.filter(m => m.role === 'user').length,
      });
    } catch {}

    // 대화가 있으면 API 호출 후 모달 표시
    setPendingAction(action);
    setSummaryLoading(true);
    setSummaryModalOpen(true);

    try {
      // 대화 내용을 문자열로 변환
      const context = messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n');

      const response = await fetch('/api/miso/mini-ally-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'chat',
          currentContent: context,
          fixRequest: 'mini_ally_summary',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get summary');
      }

      const data = await response.json();
      
      // 새로운 구조화된 데이터 설정
      setProjectData({
        personaProfile: data.personaProfile || '',
        painPointContext: data.painPointContext || '',
        painPointReason: data.painPointReason || '',
        coreProblemStatement: data.coreProblemStatement || '',
        solutionNameIdea: data.solutionNameIdea || '',
        solutionMechanism: data.solutionMechanism || '',
        expectedOutcome: data.expectedOutcome || '',
      });
      
      // 성공 토스트 표시
      toast.success('요약이 완성되었습니다', {
        description: '내용을 확인하신 후 다음 단계로 진행해주세요.',
        duration: 2500,
      });
    } catch (error) {
      console.error('Failed to get summary:', error);
      setProjectData(null);
      toast.error('요약 생성에 실패했습니다', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 3500,
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  // 모달 확인 후 정리 (MiniAllySummaryModal에서 직접 페이지 이동 처리)
  const handleSummaryConfirm = () => {
    setSummaryModalOpen(false);
    setPendingAction(null);
    setProjectData(null);
    // MiniAllySummaryModal이 직접 세션 저장 및 페이지 이동을 처리합니다
  };

  // 파일 업로드 처리 (업로드 ID만 반환)
  const uploadFile = async (file: File): Promise<{ uploadedId: string } | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', userId);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return { uploadedId: data.id };
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('파일 업로드에 실패했습니다', {
        description: file.name,
      });
      return null;
    }
  };

  // 파일 선택 처리
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const selectedFiles = Array.from(files);

    // 낙관적 미리보기 추가 (data URL)
    const tempItems: AttachedFile[] = await Promise.all(selectedFiles.map(async (file) => {
      const id = generateUniqueId();
      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        try {
          previewUrl = await readFileAsDataURL(file);
        } catch (_) {}
      }
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: previewUrl,
        isUploading: true,
      };
    }));

    setAttachedFiles((prev) => [...prev, ...tempItems]);

    let successCount = 0;
    await Promise.all(selectedFiles.map(async (file, idx) => {
      const tempId = tempItems[idx].id;
      const result = await uploadFile(file);
      if (result) {
        successCount++;
        setAttachedFiles((prev) => prev.map((f) => f.id === tempId ? { ...f, uploadedId: result.uploadedId, isUploading: false } : f));
      } else {
        setAttachedFiles((prev) => prev.filter((f) => f.id !== tempId));
      }
    }));

    if (successCount > 0) {
      toast.success(`${successCount}개 파일이 첨부되었습니다`);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setIsUploading(true);

    const tempItems: AttachedFile[] = await Promise.all(files.map(async (file) => {
      const id = generateUniqueId();
      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        try {
          previewUrl = await readFileAsDataURL(file);
        } catch (_) {}
      }
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: previewUrl,
        isUploading: true,
      };
    }));

    setAttachedFiles((prev) => [...prev, ...tempItems]);

    let successCount = 0;
    await Promise.all(files.map(async (file, idx) => {
      const tempId = tempItems[idx].id;
      const result = await uploadFile(file);
      if (result) {
        successCount++;
        setAttachedFiles((prev) => prev.map((f) => f.id === tempId ? { ...f, uploadedId: result.uploadedId, isUploading: false } : f));
      } else {
        setAttachedFiles((prev) => prev.filter((f) => f.id !== tempId));
      }
    }));

    if (successCount > 0) {
      toast.success(`${successCount}개 파일이 첨부되었습니다`);
    }

    setIsUploading(false);
  };

  // 붙여넣기(클립보드) 이미지 처리
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const candidateFiles: File[] = [];

    // 우선 items에서 이미지 탐색
    for (const item of Array.from(clipboardData.items || [])) {
      if (item.kind === 'file') {
        const blob = item.getAsFile();
        if (blob && blob.type.startsWith('image/')) {
          const extension = blob.type.split('/')[1] || 'png';
          const fileName = `pasted-image-${Date.now()}.${extension}`;
          const file = new File([blob], fileName, { type: blob.type });
          candidateFiles.push(file);
        }
      }
    }

    // 일부 브라우저의 files fallback 처리
    if (candidateFiles.length === 0 && clipboardData.files && clipboardData.files.length > 0) {
      for (const file of Array.from(clipboardData.files)) {
        if (file.type.startsWith('image/')) {
          candidateFiles.push(file);
        }
      }
    }

    // 이미지가 없으면 기본 붙여넣기(텍스트) 허용
    if (candidateFiles.length === 0) return;

    // 이미지가 있으면 텍스트 붙여넣기 방지하고 업로드 처리
    e.preventDefault();

    setIsUploading(true);

    const tempItems: AttachedFile[] = await Promise.all(candidateFiles.map(async (file) => {
      const id = generateUniqueId();
      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        try {
          previewUrl = await readFileAsDataURL(file);
        } catch (_) {}
      }
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: previewUrl,
        isUploading: true,
      };
    }));

    setAttachedFiles((prev) => [...prev, ...tempItems]);

    let successCount = 0;
    await Promise.all(candidateFiles.map(async (file, idx) => {
      const tempId = tempItems[idx].id;
      const result = await uploadFile(file);
      if (result) {
        successCount++;
        setAttachedFiles((prev) => prev.map((f) => f.id === tempId ? { ...f, uploadedId: result.uploadedId, isUploading: false } : f));
      } else {
        setAttachedFiles((prev) => prev.filter((f) => f.id !== tempId));
      }
    }));

    if (successCount > 0) {
      toast.success(`${successCount}개 이미지가 첨부되었습니다`);
    }

    setIsUploading(false);
  };

  // 파일 제거
  const removeFile = (fileId: string) => {
    const file = attachedFiles.find(f => f.id === fileId);
    if (file?.url) {
      try { URL.revokeObjectURL(file.url); } catch (_) {}
      objectUrlSetRef.current.delete(file.url);
    }
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // 이미지 미리보기 열기
  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  // 미리보기 닫기
  const closePreview = () => {
    setPreviewImage(null);
    setPreviewOpen(false);
  };

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      // PC에서는 사이드바를 기본적으로 표시, 모바일에서는 숨김
      if (isMobileDevice) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 컴포넌트 언마운트 시 생성된 Object URL 전체 정리
  useEffect(() => {
    return () => {
      objectUrlSetRef.current.forEach((url) => {
        try { URL.revokeObjectURL(url); } catch (_) {}
      });
      objectUrlSetRef.current.clear();
    };
  }, [attachedFiles]);

  const handleCopy = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.success('메시지를 복사했습니다');
    } catch (e) {
      console.error('Copy failed:', e);
      toast.error('복사에 실패했습니다');
    }
  };

  // 대화 목록 불러오기 및 사용자 ID 설정
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    fetchConversations(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConversations = useCallback(async (uid?: string) => {
    try {
      const userIdToUse = uid || userId;
      const response = await fetch(`/api/chat?userId=${userIdToUse}`);
      if (response.ok) {
        const data = await response.json();
        // Transform API response to match our Conversation interface
        const conversations = (data.data || []).map((conv: any) => ({
          id: conv.id,
          name: conv.name,
          updatedAt: new Date(conv.updated_at || conv.updatedAt || conv.created_at),
        }));
        setConversations(conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, [userId]);

  // 대화 메시지 불러오기
  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const sortedMessages = (data.messages || []).sort((a: any, b: any) => 
          a.timestamp.localeCompare(b.timestamp)
        );
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if ((!message.trim() && attachedFiles.length === 0) || isLoading || isUploading) return;

    const attachmentsForMessage: AttachedFile[] = attachedFiles.map(f => ({ ...f }));

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
      attachments: attachmentsForMessage,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // 스트리밍 응답을 위한 임시 메시지
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);

    // 첨부 파일 정보 준비
    const files = attachedFiles
      .filter(file => !!file.uploadedId)
      .map(file => ({
        type: 'image',
        transfer_method: 'local_file',
        upload_file_id: file.uploadedId,
      }));

    // 입력 영역의 첨부 파일 목록 초기화 (미리보기 URL은 메시지에 남겨둠)
    setAttachedFiles([]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          conversationId: currentConversationId,
          userId: userId,
          files: files.length > 0 ? files : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let conversationIdReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // conversation_id 저장
              if (data.conversation_id && !conversationIdReceived) {
                setCurrentConversationId(data.conversation_id);
                conversationIdReceived = true;
              }

              // 메시지 내용 업데이트
              if (data.event === 'agent_message' && data.answer) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: msg.content + data.answer, isStreaming: true }
                      : msg
                  )
                );
              } else if (data.event === 'message_replace' && data.answer) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: data.answer, isStreaming: true }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

      // 스트리밍 완료
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

      // 대화 목록 새로고침
      fetchConversations();
      
      // 입력창에 포커스
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // 에러 발생 시 어시스턴트 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
      // 에러가 발생해도 입력창에 포커스
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 대화 삭제
  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // 현재 대화가 삭제된 대화라면 초기화
        if (currentConversationId === selectedConversation.id) {
          setCurrentConversationId(null);
          setMessages([]);
        }
        // 대화 목록 새로고침
        fetchConversations();
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  // 대화 이름 변경
  const handleRenameConversation = async () => {
    if (!selectedConversation || !newName.trim()) return;

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId,
          name: newName.trim(),
        }),
      });

      if (response.ok) {
        // 대화 목록 새로고침
        fetchConversations();
        setRenameDialogOpen(false);
        setNewName('');
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden relative">
      {/* 모바일 사이드바 백드롭 */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 custom:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* 사이드바 - 대화 목록 */}
      <div
        className={cn(
          "bg-[#FAFAFA] border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out",
          isMobile 
            ? "fixed left-0 top-0 h-full z-50 w-[85%] max-w-[320px]" 
            : "relative w-[320px]",
          isMobile && !showSidebar && "-translate-x-full"
        )}
      >
          {/* 사이드바 헤더 */}
          <div className="h-[60px] custom:h-[72px] px-4 custom:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="h-10 w-10 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
              <h2 className="text-[18px] custom:text-[22px] font-light text-gray-900 tracking-tight">대화 목록</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setCurrentConversationId(null);
                  setMessages([]);
                }}
                className="h-10 w-10 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-700" />
              </Button>
              {/* 모바일에서만 닫기 버튼 표시 */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="h-10 w-10 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </Button>
              )}
            </div>
          </div>

          {/* 대화 목록 */}
          <ScrollArea className="flex-1">
            <div className="py-3">
              {conversations.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    아직 대화가 없습니다.<br />
                    새로운 대화를 시작해보세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 px-3">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={cn(
                        "group px-3 py-3 rounded-lg cursor-pointer transition-all duration-200",
                        currentConversationId === conv.id
                          ? "bg-gray-200"
                          : "hover:bg-gray-100"
                      )}
                      onClick={async () => {
                        setCurrentConversationId(conv.id);
                        await fetchMessages(conv.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-[15px] text-gray-800 truncate leading-snug">
                            {conv.name}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              className="text-[14px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedConversation(conv);
                                setNewName(conv.name);
                                setRenameDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              이름 변경
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-[14px] text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedConversation(conv);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <X className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 액션 카드들 */}
          <div className="p-3 space-y-3">
            {/* 헤더 */}
            <div className="px-1 pt-1">
              <h3 className="text-[18px] custom:text-[20px] font-light text-gray-900 tracking-tight leading-tight">
                아이디어가 완성되었나요?
              </h3>
              <p className="text-[16px] text-gray-500 font-light mt-1">
                다음 단계로 이동해보세요!
              </p>
            </div>
            
            {/* MISO Generator 카드 */}
            <div 
              onClick={() => handleActionClick('generate_miso')}
              className="group relative bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 relative">
                  <img
                    src="/assets/minian-default.png"
                    alt="Minian"
                    className="w-full h-full object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                  />
                  <img
                    src="/assets/minian-hover.png"
                    alt="Minian Hover"
                    className="w-full h-full object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-normal text-gray-900 leading-snug">
                    MISO 설계하기
                  </h3>
                  <p className="text-[12px] text-gray-500 font-light mt-0.5 leading-relaxed">
                    MISO 설계/연동 가이드 생성
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-[11px] text-gray-700 font-normal">시작하기 →</span>
                </div>
              </div>
            </div>

            {/* PRD Generator 카드 */}
            <div 
              onClick={() => handleActionClick('generate_prd')}
              className="group relative bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 relative">
                  <img
                    src="/assets/coach_default.png"
                    alt="Coach Team"
                    className="w-full h-full object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                  />
                  <img
                    src="/assets/coach_hover.png"
                    alt="Coach Team Hover"
                    className="w-full h-full object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-normal text-gray-900 leading-snug">
                    바이브코딩 설계하기
                  </h3>
                  <p className="text-[12px] text-gray-500 font-light mt-0.5 leading-relaxed">
                    체계적인 개발 설계서 작성
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-[11px] text-gray-700 font-normal">시작하기 →</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* 메인 채팅 영역 */}
      <div 
        className="flex-1 flex flex-col bg-white relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 드래그 오버레이 */}
        {isDragging && (
          <div className="absolute inset-0 bg-gray-900/10 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-lg font-medium text-gray-900">파일을 여기에 놓으세요</p>
                <p className="text-sm text-gray-500">이미지 파일을 업로드할 수 있습니다</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 헤더 */}
        <div className="h-[60px] custom:h-[72px] px-4 custom:px-8 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-5">
            {/* 모바일에서만 메뉴 버튼 표시 */}
            {isMobile && !showSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(true)}
                className="h-8 w-8 custom:h-10 custom:w-10 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <img
                src="/assets/mini_ally_default.png"
                alt="Mini Ally"
                className="w-8 h-8 custom:w-10 custom:h-10 object-contain"
              />
              <div>
                <h1 className="text-[16px] custom:text-[18px] font-normal text-gray-900">Mini Ally</h1>
                <p className="text-[12px] custom:text-[13px] text-gray-500">아이데이션 파트너</p>
              </div>
            </div>
          </div>
          
          {/* 모바일에서만 홈 버튼 표시 */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-8 w-8 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 text-gray-700" />
            </Button>
          )}
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="max-w-[720px] mx-auto px-4 custom:px-8 py-6 custom:py-8">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto mb-8">
                      <img
                        src="/assets/mini_ally_message_loading.png"
                        alt="Mini Ally Loading"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-[18px] text-gray-700 font-light">메시지를 불러오는 중</p>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div
                  className="text-center py-12"
                >
                  <div className="w-56 h-56 mx-auto mb-8">
                    <img
                      src="/assets/mini-ally-intro.png"
                      alt="Mini Ally"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-[20px] custom:text-[28px] font-light text-gray-900 mb-3 px-4 text-center">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour >= 5 && hour < 12) {
                        return "좋은 아침이에요! 오늘 어떤 아이디어를 탐색해볼까요?";
                      } else if (hour >= 12 && hour < 17) {
                        return "안녕하세요! 떠오르는 문제나 아이디어를 함께 정리해볼까요?";
                      } else if (hour >= 17 && hour < 21) {
                        return "좋은 저녁이에요! 지금 구체화하고 싶은 아이디어가 있나요?";
                      } else {
                        return "안녕하세요! 늦은 시간이지만 멋진 아이디어를 같이 다듬어봐요!";
                      }
                    })()}
                  </h2>
                  <p className="text-[14px] custom:text-[16px] text-gray-500 leading-relaxed max-w-md mx-auto px-4 text-center">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour >= 5 && hour < 12) {
                        return "가볍게 문제를 설명하거나 영감을 주는 사례를 알려주세요.";
                      } else if (hour >= 12 && hour < 17) {
                        return "목표 사용자, 해결하고 싶은 문제, 기대 효과를 적어보세요.";
                      } else if (hour >= 17 && hour < 21) {
                        return "스케치, 스크린샷도 좋아요. 제가 가설과 다음 질문을 제안해요.";
                      } else {
                        return "한 문장 아이디어부터 시작해도 충분해요. 확장과 변주를 도와드릴게요.";
                      }
                    })()}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-4',
                        msg.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <img
                            src="/assets/mini_ally_default.png"
                            alt="Mini Ally"
                            className="w-10 h-10 custom:w-12 custom:h-12 object-contain"
                          />
                        </div>
                      )}
                      <div
                        className={cn(
                          'flex-1',
                          msg.role === 'user' && 'flex justify-end'
                        )}
                      >
                        <div className="space-y-2">
                          <div
                            className={cn(
                              'inline-block px-4 custom:px-5 py-3 custom:py-3.5',
                              msg.role === 'user'
                                ? 'bg-gray-900 text-white rounded-[20px] max-w-[280px] custom:max-w-[360px]'
                                : 'text-gray-800 max-w-full'
                            )}
                          >
                            {msg.content ? (
                              <div className={cn(
                                "leading-relaxed break-words",
                                msg.role === 'user' 
                                  ? 'text-[14px] custom:text-[15px] whitespace-pre-wrap' 
                                  : 'text-[14px] custom:text-[16px] font-light [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
                              )}>
                                {msg.role === 'user' ? (
                                  <span className="select-text selection:bg-white selection:text-gray-900">{msg.content}</span>
                                ) : (
                                  parseActionButtons(msg.content).map((part: any, index: number) => (
                                    <React.Fragment key={index}>
                                      {part.type === 'text' ? (
                                        <ReactMarkdown 
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            h1: ({ children }) => (
                                              <h1 className="text-lg font-semibold text-gray-900 mt-4 mb-3 first:mt-0">
                                                {children}
                                              </h1>
                                            ),
                                            h2: ({ children }) => (
                                              <h2 className="text-base font-semibold text-gray-800 mt-4 mb-2 first:mt-0">
                                                {children}
                                              </h2>
                                            ),
                                            h3: ({ children }) => (
                                              <h3 className="text-sm font-medium text-gray-700 mt-3 mb-2 first:mt-0">
                                                {children}
                                              </h3>
                                            ),
                                            p: ({ children }) => (
                                              <p className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                                                {children}
                                              </p>
                                            ),
                                            ul: ({ children }) => (
                                              <ul className="my-3 space-y-1 list-disc ml-4 pl-2">
                                                {children}
                                              </ul>
                                            ),
                                            ol: ({ children }) => (
                                              <ol className="my-3 space-y-1 list-decimal ml-4 pl-2">
                                                {children}
                                              </ol>
                                            ),
                                            li: ({ children }) => (
                                              <li className="text-gray-700 leading-relaxed">
                                                {children}
                                              </li>
                                            ),
                                            strong: ({ children }) => (
                                              <strong className="font-semibold text-gray-900">{children}</strong>
                                            ),
                                            em: ({ children }) => (
                                              <em className="italic text-gray-600">{children}</em>
                                            ),
                                            code: ({ children, ...props }) => {
                                              const isInline = !props.node?.position;
                                              return isInline ? (
                                                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                                                  {children}
                                                </code>
                                              ) : (
                                                <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto my-3 border border-gray-200">
                                                  <code className="text-gray-800">{children}</code>
                                                </pre>
                                              );
                                            },
                                            blockquote: ({ children }) => (
                                              <blockquote className="pl-4 py-2 my-3 border-l-3 border-gray-300 bg-gray-50 rounded-r text-gray-600 italic">
                                                {children}
                                              </blockquote>
                                            ),
                                          }}
                                        >
                                          {part.content}
                                        </ReactMarkdown>
                                      ) : (
                                        <div
                                          onClick={() => handleActionClick(part.action)}
                                          className="group relative bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all duration-200 overflow-hidden inline-block mx-1 my-2 min-w-[280px]"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 flex-shrink-0 relative">
                                              {part.action === 'generate_prd' ? (
                                                <>
                                                  <img
                                                    src="/assets/coach_default.png"
                                                    alt="Coach Team"
                                                    className="w-full h-full object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                                                  />
                                                  <img
                                                    src="/assets/coach_hover.png"
                                                    alt="Coach Team Hover"
                                                    className="w-full h-full object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                  />
                                                </>
                                              ) : (
                                                <>
                                                  <img
                                                    src="/assets/minian-default.png"
                                                    alt="Minian"
                                                    className="w-full h-full object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                                                  />
                                                  <img
                                                    src="/assets/minian-hover.png"
                                                    alt="Minian Hover"
                                                    className="w-full h-full object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                  />
                                                </>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h3 className="text-[15px] font-normal text-gray-900 leading-snug">
                                                {part.action === 'generate_prd' ? '바이브코딩 설계하기' : 'MISO 설계하기'}
                                              </h3>
                                              <p className="text-[12px] text-gray-500 font-light mt-0.5 leading-relaxed">
                                                {part.action === 'generate_prd' ? '체계적인 개발 설계서 작성' : 'MISO 설계/연동 가이드 생성'}
                                              </p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                              <span className="text-[11px] text-gray-700 font-normal">시작하기 →</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  ))
                                )}
                              </div>
                            ) : msg.isStreaming ? (
                              <div className="flex gap-2 py-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                              </div>
                            ) : null}

                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className={cn('mt-2', msg.role === 'user' ? '' : '')}>
                                <div className="flex flex-wrap gap-2">
                                  {msg.attachments
                                    .filter(f => f.type?.startsWith('image/') && f.url)
                                    .map(f => (
                                      <div key={f.id} className="relative group">
                                        <img
                                          src={f.url!}
                                          alt={f.name}
                                          className={cn(
                                            'object-cover rounded-lg border',
                                            msg.role === 'user'
                                              ? 'w-24 h-24 border-white/20'
                                              : 'w-28 h-28 border-gray-200'
                                          )}
                                          onClick={() => openPreview(f.url!)}
                                        />
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div
                            className={cn(
                              'flex items-center px-2',
                              msg.role === 'user' ? 'justify-end' : undefined
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.content)}
                              aria-label="메시지 복사"
                              title="복사"
                              className={cn(
                                'inline-flex items-center justify-center rounded-md transition-colors',
                                'h-6 w-6',
                                msg.role === 'user' ? 'text-gray-300 hover:text-gray-200 hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              )}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-[720px] mx-auto px-4 custom:px-8 py-3 custom:py-4">
            {/* 첨부 파일 미리보기 */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {attachedFiles.map(file => (
                  <div
                    key={file.id}
                    className="relative group"
                  >
                    {file.type.startsWith('image/') && file.url ? (
                      <div className="relative">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                        {file.isUploading && (
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            onClick={() => file.url && openPreview(file.url)}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                            disabled={!!file.isUploading}
                          >
                            <ZoomIn className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="max-w-[150px] truncate text-gray-700">{file.name}</span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="아이디어나 해결하고 싶은 문제를 적어보세요..."
                className="w-full min-h-[48px] custom:min-h-[56px] max-h-[120px] custom:max-h-[150px] px-4 custom:px-5 py-3 custom:py-4 pr-24 custom:pr-28 resize-none border border-gray-200 rounded-2xl text-[14px] custom:text-[16px] leading-relaxed focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all placeholder:text-gray-400"
                disabled={isLoading}
              />
              <div className="absolute right-2 custom:right-3 bottom-2 custom:bottom-3 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 custom:h-10 custom:w-10 text-gray-500 hover:text-gray-700"
                >
                  <Paperclip className="w-4 h-4 custom:w-5 custom:h-5" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={(!message.trim() && attachedFiles.length === 0) || isLoading || isUploading}
                  size="icon"
                  className={cn(
                    "h-8 w-8 custom:h-10 custom:w-10 rounded-xl transition-all",
                    (message.trim() || attachedFiles.length > 0) && !isLoading && !isUploading
                      ? "bg-gray-900 hover:bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  <Send className="w-4 h-4 custom:w-5 custom:h-5" />
                </Button>
              </div>
            </div>
            <p className="text-[11px] custom:text-[13px] text-gray-400 text-center mt-2 custom:mt-3">
              Mini Ally는 아이디어 확장을 돕지만, 중요한 정보는 꼭 확인해 주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>대화 삭제</DialogTitle>
            <DialogDescription>
              &quot;{selectedConversation?.name}&quot; 대화를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 이름 변경 다이얼로그 */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>대화 이름 변경</DialogTitle>
            <DialogDescription>
              새로운 이름을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="대화 제목 입력..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRenameConversation();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialogOpen(false);
                setNewName('');
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleRenameConversation}
              disabled={!newName.trim()}
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mini Ally Summary 모달 */}
      <MiniAllySummaryModal
        open={summaryModalOpen}
        onOpenChange={setSummaryModalOpen}
        loading={summaryLoading}
        projectData={projectData}
        onConfirm={handleSummaryConfirm}
        action={pendingAction || undefined}
        journeyId={journeyId || undefined}
      />

      {/* 이미지 미리보기 모달 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>이미지 미리보기</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {previewImage && (
              <img
                src={previewImage}
                alt="이미지 미리보기"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}