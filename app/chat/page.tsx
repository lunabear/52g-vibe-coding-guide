'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MoreHorizontal, Edit2, X, Plus, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getUserId } from '@/lib/user-id';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
}

interface Conversation {
  id: string;
  name: string;
  updatedAt: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newName, setNewName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 대화 목록 불러오기 및 사용자 ID 설정
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    fetchConversations(id);
  }, []);

  const fetchConversations = async (uid?: string) => {
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
  };

  // 대화 메시지 불러오기
  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
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
    <div className="h-screen bg-white flex overflow-hidden">
      {/* 사이드바 - 대화 목록 */}
      {showSidebar && (
        <div
          className="w-[320px] bg-[#FAFAFA] border-r border-gray-100 flex flex-col"
        >
          {/* 사이드바 헤더 */}
          <div className="h-[72px] px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="h-10 w-10 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
              <h2 className="text-[22px] font-light text-gray-900 tracking-tight">대화 목록</h2>
            </div>
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
        </div>
      )}

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col bg-white">
        {/* 헤더 */}
        <div className="h-[72px] px-8 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-5">
            {!showSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(true)}
                className="h-10 w-10 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <img
                src="/assets/mini_ally_default.png"
                alt="Mini Ally"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-[18px] font-normal text-gray-900">Mini Ally</h1>
                <p className="text-[13px] text-gray-500">MISO</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="max-w-[720px] mx-auto px-8 py-8">
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
                  <h2 className="text-[28px] font-light text-gray-900 mb-3">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour >= 5 && hour < 12) {
                        return "좋은 아침이에요! 오늘은 어떤 도움이 필요하신가요?";
                      } else if (hour >= 12 && hour < 17) {
                        return "안녕하세요! 무엇을 도와드릴까요?";
                      } else if (hour >= 17 && hour < 21) {
                        return "좋은 저녁이에요! 어떤 프로젝트를 진행 중이신가요?";
                      } else {
                        return "안녕하세요! 늦은 시간까지 열정적이시네요!";
                      }
                    })()}
                  </h2>
                  <p className="text-[16px] text-gray-500 leading-relaxed max-w-md mx-auto">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour >= 5 && hour < 12) {
                        return "새로운 아이디어를 시작하기 좋은 시간이에요. 궁금한 점을 편하게 물어보세요.";
                      } else if (hour >= 12 && hour < 17) {
                        return "프로젝트 아이디어나 궁금한 점을 자유롭게 물어보세요.";
                      } else if (hour >= 17 && hour < 21) {
                        return "오늘 하루도 수고 많으셨어요. 제가 도와드릴 일이 있을까요?";
                      } else {
                        return "밤늦게까지 작업 중이시군요! 어떤 도움이 필요하신가요?";
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
                            className="w-12 h-12 object-contain"
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
                              'inline-block px-5 py-3.5',
                              msg.role === 'user'
                                ? 'bg-gray-900 text-white rounded-[20px] max-w-[360px]'
                                : 'text-gray-800 max-w-full'
                            )}
                          >
                            {msg.content ? (
                              <p className={cn(
                                "whitespace-pre-wrap leading-relaxed break-words",
                                msg.role === 'user' ? 'text-[15px]' : 'text-[16px] font-light'
                              )}>
                                {msg.content}
                              </p>
                            ) : msg.isStreaming ? (
                              <div className="flex gap-2 py-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                              </div>
                            ) : null}
                          </div>
                          <p
                            className={cn(
                              'text-[12px] px-2',
                              msg.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400'
                            )}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
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
          <div className="max-w-[720px] mx-auto px-8 py-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                className="w-full min-h-[56px] max-h-[150px] px-5 py-4 resize-none border border-gray-200 rounded-2xl text-[16px] leading-relaxed focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all placeholder:text-gray-400"
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3">
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all",
                    message.trim() && !isLoading
                      ? "bg-gray-900 hover:bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <p className="text-[13px] text-gray-400 text-center mt-3">
              Mini Ally는 실수할 수 있습니다. 중요한 정보는 확인해 주세요.
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
    </div>
  );
}