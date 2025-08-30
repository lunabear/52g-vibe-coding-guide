'use client';
import React, { useState, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Zap, Brain, MessageCircle, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  typing?: boolean;
  quickReplies?: string[];
  features?: Array<{icon: React.ReactNode; text: string}>;
}

interface ChatbotPreviewProps {
  themeId?: string;
}

export function ChatbotPreview({ themeId }: ChatbotPreviewProps) {
  // 테마별 스타일 클래스 결정
  const getThemeClasses = () => {
    switch (themeId) {
      case 'apple-liquid-glass':
        return {
          container: 'h-full min-h-0 flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 font-[var(--font-sans)] rounded-xl overflow-hidden liquid-glass',
          header: 'px-4 py-3 border-b border-[hsl(var(--border))] liquid-glass-nav',
          messageCard: 'liquid-glass px-4 py-2.5 text-gray-800',
          userMessage: 'liquid-glass-button px-4 py-2.5 text-gray-800',
          input: 'flex-1 px-4 py-2.5 liquid-glass border-none text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all text-gray-800 placeholder:text-gray-500',
          sendButton: 'liquid-glass-button p-2.5 text-gray-800',
          quickReply: 'liquid-glass px-3 py-1.5 text-xs font-medium hover:backdrop-blur-lg transition-all flex items-center gap-1 group text-gray-700'
        };
      case 'bold-colors':
        return {
          container: 'h-full min-h-0 flex flex-col bg-white font-[var(--font-sans)] brutalist-card overflow-hidden',
          header: 'px-4 py-3 border-b-2 border-black bg-white',
          messageCard: 'brutalist-card px-4 py-2.5 text-black bg-white',
          userMessage: 'brutalist-button px-4 py-2.5',
          input: 'brutalist-input flex-1 px-4 py-2.5 text-sm bg-white',
          sendButton: 'brutalist-button p-2.5',
          quickReply: 'brutalist-button px-3 py-1.5 text-xs flex items-center gap-1 group'
        };
      case 'chic-black':
        return {
          container: 'h-full min-h-0 flex flex-col bg-[hsl(var(--background))] font-[var(--font-sans)] rounded-[var(--radius)] overflow-hidden chic-minimal',
          header: 'px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]',
          messageCard: 'chic-minimal rounded-[calc(var(--radius)+4px)] bg-[hsl(var(--card))] px-4 py-2.5',
          userMessage: 'chic-minimal rounded-[calc(var(--radius)+4px)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5',
          input: 'chic-minimal flex-1 px-4 py-2.5 bg-[hsl(var(--background))] rounded-[calc(var(--radius)+4px)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] transition-all',
          sendButton: 'chic-minimal p-2.5 rounded-[calc(var(--radius)-2px)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 transition-colors',
          quickReply: 'chic-minimal px-3 py-1.5 rounded-[calc(var(--radius)+2px)] bg-[hsl(var(--card))] text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/10 transition-all flex items-center gap-1 group'
        };
      case 'nature-green':
        return {
          container: 'h-full min-h-0 flex flex-col bg-[hsl(var(--background))] font-[var(--font-sans)] nature-organic overflow-hidden rounded-xl border border-[hsl(var(--border))]',
          header: 'px-4 py-3 border-b border-[hsl(var(--border))] bg-white',
          messageCard: 'nature-organic border border-[hsl(var(--border))] bg-white px-4 py-2.5',
          userMessage: 'nature-organic bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5 border border-[hsl(var(--primary))]',
          input: 'nature-organic flex-1 px-4 py-2.5 bg-white border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] transition-all',
          sendButton: 'nature-organic p-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 transition-colors border border-[hsl(var(--primary))]',
          quickReply: 'nature-organic px-3 py-1.5 border border-[hsl(var(--border))] bg-white text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/10 transition-all flex items-center gap-1 group'
        };
      case 'modern-purple':
        return {
          container: 'h-full min-h-0 flex flex-col bg-[hsl(var(--background))] font-[var(--font-sans)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]',
          header: 'px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]',
          messageCard: 'purple-glow rounded-[calc(var(--radius)+4px)] px-4 py-2.5',
          userMessage: 'purple-glow rounded-[calc(var(--radius)+4px)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5',
          input: 'purple-glow flex-1 px-4 py-2.5 bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] transition-all',
          sendButton: 'purple-glow p-2.5 rounded-[calc(var(--radius)-2px)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 transition-colors',
          quickReply: 'purple-glow px-3 py-1.5 rounded-[calc(var(--radius)+2px)] bg-[hsl(var(--card))] text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/10 transition-all flex items-center gap-1 group'
        };
      default:
        return {
          container: 'h-full min-h-0 flex flex-col bg-[hsl(var(--background))] font-[var(--font-sans)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]',
          header: 'px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]',
          messageCard: 'rounded-[calc(var(--radius)+4px)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 shadow-[var(--shadow-sm)]',
          userMessage: 'rounded-[calc(var(--radius)+4px)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5',
          input: 'flex-1 px-4 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-[calc(var(--radius)+4px)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] transition-all shadow-[var(--shadow-xs)] focus:shadow-[var(--shadow-sm)]',
          sendButton: 'p-2.5 rounded-[calc(var(--radius)-2px)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 transition-colors shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
          quickReply: 'px-3 py-1.5 rounded-[calc(var(--radius)+2px)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/10 hover:border-[hsl(var(--accent))] transition-all flex items-center gap-1 group shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]'
        };
    }
  };

  const themeClasses = getThemeClasses();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const conversationFlow: Message[] = [
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 저는 AI 어시스턴트입니다. 무엇을 도와드릴까요? ✨',
      timestamp: '오전 10:32',
    },
    {
      id: '2',
      type: 'user',
      content: '프로젝트 진행 상황을 알려주세요',
      timestamp: '오전 10:33',
    },
    {
      id: '3',
      type: 'bot',
      content: '현재 프로젝트 진행률은 72%입니다. 주요 마일스톤 3개가 완료되었고, 2개가 진행 중입니다.',
      timestamp: '오전 10:33',
      features: [
        { icon: <Zap className="w-3 h-3" />, text: '실시간 분석' },
        { icon: <Brain className="w-3 h-3" />, text: 'AI 인사이트' },
      ]
    },
    {
      id: '4',
      type: 'user',
      content: '다음 단계는 무엇인가요?',
      timestamp: '오전 10:34',
    },
    {
      id: '5',
      type: 'bot',
      content: '다음 단계를 위한 추천 사항입니다:',
      timestamp: '오전 10:34',
      quickReplies: ['작업 할당하기', '일정 확인하기', '팀 미팅 예약'],
    }
  ];

  useEffect(() => {
    if (messages.length === 0) {
      // Start conversation
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setMessages([conversationFlow[0]]);
          setIsTyping(false);
          setCurrentMessageIndex(1);
        }, 1500);
      }, 500);
    } else if (currentMessageIndex < conversationFlow.length) {
      // Continue conversation
      const timer = setTimeout(() => {
        const nextMessage = conversationFlow[currentMessageIndex];
        if (nextMessage.type === 'bot') {
          setIsTyping(true);
          setTimeout(() => {
            setMessages(prev => [...prev, nextMessage]);
            setIsTyping(false);
            setCurrentMessageIndex(currentMessageIndex + 1);
          }, 1500);
        } else {
          setMessages(prev => [...prev, nextMessage]);
          setCurrentMessageIndex(currentMessageIndex + 1);
        }
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Reset conversation after completion
      const resetTimer = setTimeout(() => {
        setMessages([]);
        setCurrentMessageIndex(0);
      }, 5000);

      return () => clearTimeout(resetTimer);
    }
  }, [messages, currentMessageIndex]);

  return (
    <div className={themeClasses.container}>
      {/* Chat Header */}
      <div className={themeClasses.header}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center ${
                themeId === 'bold-colors' 
                  ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_black]' 
                  : themeId === 'apple-liquid-glass'
                  ? 'rounded-xl liquid-glass'
                  : 'rounded-[calc(var(--radius)-2px)] shadow-[var(--shadow-sm)]'
              }`}>
                <Bot className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[hsl(var(--background))] ${
                themeId === 'bold-colors' 
                  ? 'rounded-none border-black' 
                  : 'rounded-full'
              }`} />
            </div>
            <div>
              <h4 className={`text-sm font-semibold text-[hsl(var(--foreground))] ${themeId === 'bold-colors' ? 'font-black uppercase tracking-wider text-lg' : ''}`}>
                {themeId === 'bold-colors' ? 'AI BOT 9000' : 'AI Assistant'}
              </h4>
              <p className={`text-xs text-[hsl(var(--muted-foreground))] ${themeId === 'bold-colors' ? 'font-bold uppercase tracking-widest' : ''}`}>
                {themeId === 'bold-colors' ? 'ALWAYS ONLINE!' : '항상 온라인'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(var(--accent))]" />
            <MessageCircle className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-fadeIn ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            style={{
              animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`
            }}
          >
            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${
              themeId === 'bold-colors' 
                ? 'rounded-none border-2 border-black shadow-[2px_2px_0px_0px_black]' 
                : themeId === 'apple-liquid-glass'
                ? 'rounded-lg liquid-glass'
                : 'rounded-[calc(var(--radius)-4px)] shadow-[var(--shadow-xs)]'
            } ${
              message.type === 'bot' 
                ? 'bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]' 
                : 'bg-[hsl(var(--secondary))]'
            }`}>
              {message.type === 'bot' ? (
                <Bot className="w-4 h-4 text-[hsl(var(--primary-foreground))]" />
              ) : (
                <User className="w-4 h-4 text-[hsl(var(--secondary-foreground))]" />
              )}
            </div>
            <div className={`max-w-[70%] ${message.type === 'user' ? 'items-end' : ''}`}>
              <div className={message.type === 'bot' ? themeClasses.messageCard : themeClasses.userMessage}>
                <p className={`text-sm leading-relaxed ${themeId === 'bold-colors' ? 'font-bold' : ''}`}>{message.content}</p>
                
                {/* Feature badges */}
                {message.features && (
                  <div className="flex gap-2 mt-2">
                    {message.features.map((feature, idx) => (
                      <div key={idx} className={`flex items-center gap-1 px-2 py-1 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent-foreground))] ${
                        themeId === 'bold-colors' 
                          ? 'rounded-none border border-black shadow-[2px_2px_0px_0px_black] font-bold' 
                          : themeId === 'apple-liquid-glass'
                          ? 'rounded-lg liquid-glass'
                          : 'rounded-[calc(var(--radius)-2px)]'
                      }`}>
                        {feature.icon}
                        <span className="text-xs">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Quick replies */}
              {message.quickReplies && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      className={themeClasses.quickReply}
                    >
                      {reply}
                      <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))] transition-colors" />
                    </button>
                  ))}
                </div>
              )}
              
              <p className={`text-xs text-[hsl(var(--muted-foreground))] mt-1 ml-1 ${themeId === 'bold-colors' ? 'font-bold uppercase' : ''}`}>{message.timestamp}</p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-fadeIn">
            <div className={`w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex-shrink-0 flex items-center justify-center ${
              themeId === 'bold-colors' 
                ? 'rounded-none border-2 border-black shadow-[2px_2px_0px_0px_black]' 
                : themeId === 'apple-liquid-glass'
                ? 'rounded-lg liquid-glass'
                : 'rounded-[calc(var(--radius)-4px)] shadow-[var(--shadow-xs)]'
            }`}>
              <Bot className="w-4 h-4 text-[hsl(var(--primary-foreground))]" />
            </div>
            <div className={themeClasses.messageCard}>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 bg-[hsl(var(--muted-foreground))]/40 animate-bounce ${
                  themeId === 'bold-colors' ? 'rounded-none' : 'rounded-full'
                }`} style={{ animationDelay: '0ms' }} />
                <div className={`w-2 h-2 bg-[hsl(var(--muted-foreground))]/40 animate-bounce ${
                  themeId === 'bold-colors' ? 'rounded-none' : 'rounded-full'
                }`} style={{ animationDelay: '200ms' }} />
                <div className={`w-2 h-2 bg-[hsl(var(--muted-foreground))]/40 animate-bounce ${
                  themeId === 'bold-colors' ? 'rounded-none' : 'rounded-full'
                }`} style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className={`p-4 border-t bg-[hsl(var(--card))] ${
        themeId === 'bold-colors' 
          ? 'border-t-4 border-black' 
          : themeId === 'apple-liquid-glass'
          ? 'border-t border-[hsl(var(--border))] liquid-glass-nav'
          : 'border-t border-[hsl(var(--border))]'
      }`}>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={themeId === 'bold-colors' ? 'TYPE YOUR MESSAGE!' : '메시지를 입력하세요...'}
            className={themeClasses.input}
          />
          <button className={themeClasses.sendButton}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}