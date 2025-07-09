'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  messages: Message[];
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 대화 목록 불러오기
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
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
    } catch (error) {
      console.error('Failed to send message:', error);
      // 에러 발생 시 어시스턴트 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // 엔터키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* 채팅 인터페이스 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/mini_ally_default.png"
                  alt="Mini Ally"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">Ally</h3>
                  <p className="text-xs text-gray-500">AI 어시스턴트</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConversationList(!showConversationList)}
                  className="hover:bg-gray-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* 대화 목록 */}
            <AnimatePresence>
              {showConversationList && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b bg-gray-50 overflow-hidden"
                >
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">최근 대화</h4>
                    <div className="space-y-2">
                      {conversations.length === 0 ? (
                        <p className="text-sm text-gray-500">대화 내역이 없습니다</p>
                      ) : (
                        conversations.map(conv => (
                          <div
                            key={conv.id}
                            className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                            onClick={() => {
                              setCurrentConversationId(conv.id);
                              setMessages(conv.messages);
                              setShowConversationList(false);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conv.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(conv.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit3 className="w-3 h-3 mr-2" />
                                  이름 변경
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 메시지 영역 */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <img
                      src="/assets/mini_ally_hover.png"
                      alt="Ally"
                      className="w-24 h-24 mx-auto mb-4 opacity-50"
                    />
                    <p className="text-gray-500 text-sm">
                      안녕하세요! 무엇을 도와드릴까요?
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-3',
                        msg.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <img
                          src="/assets/mini_ally_default.png"
                          alt="Ally"
                          className="w-8 h-8 object-contain flex-shrink-0"
                        />
                      )}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2',
                          msg.role === 'user'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-900'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={cn(
                            'text-xs mt-1',
                            msg.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                          )}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <img
                      src="/assets/mini_ally_default.png"
                      alt="Ally"
                      className="w-8 h-8 object-contain"
                    />
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* 입력 영역 */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  disabled={isLoading}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  size="icon"
                  className="bg-black hover:bg-gray-800"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};