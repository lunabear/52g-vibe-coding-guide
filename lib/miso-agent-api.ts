interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatCompletionChunk {
  event: string;
  answer?: string;
  conversation_id?: string;
  message_id?: string;
  task_id?: string;
}

interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: string;
}

interface Conversation {
  id: string;
  name: string;
  inputs: Record<string, any>;
  status: string;
  introduction: string;
  created_at: string;
  updated_at: string;
}

export class MISOAgentAPI {
  private endpoint: string;
  private apiKey: string;

  constructor() {
    this.endpoint = process.env.MISO_AGENT_ENDPOINT || '';
    this.apiKey = process.env.MISO_AGENT_API_KEY || '';
  }

  // 채팅 메시지 전송 (스트리밍)
  async sendChatMessage(
    query: string,
    conversationId?: string,
    userId: string = 'prd-generator-user',
    files?: Array<{ type: string; transfer_method: string; url?: string; upload_file_id?: string }>
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const response = await fetch(`${this.endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query,
        mode: 'streaming',
        conversation_id: conversationId || '',
        user: userId,
        files: files || [],
        auto_gen_name: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    return response.body.getReader();
  }

  // SSE 스트림 파싱
  parseSSEStream(chunk: string): ChatCompletionChunk[] {
    const lines = chunk.split('\n');
    const events: ChatCompletionChunk[] = [];

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          events.push(data);
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }

    return events;
  }

  // 파일 업로드
  async uploadFile(file: File, userId: string = 'prd-generator-user'): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', userId);

    const response = await fetch(`${this.endpoint}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload error: ${response.statusText}`);
    }

    return response.json();
  }

  // 대화 목록 가져오기
  async getConversations(
    userId: string = 'prd-generator-user',
    lastId?: string,
    limit: number = 20
  ): Promise<{ data: Conversation[]; has_more: boolean; limit: number }> {
    const params = new URLSearchParams({
      user: userId,
      limit: limit.toString(),
      sort_by: '-updated_at',
    });

    if (lastId) {
      params.append('last_id', lastId);
    }

    const response = await fetch(`${this.endpoint}/conversations?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Get conversations error: ${response.statusText}`);
    }

    return response.json();
  }

  // 대화 삭제
  async deleteConversation(conversationId: string, userId: string = 'prd-generator-user'): Promise<{ result: string }> {
    const response = await fetch(`${this.endpoint}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: userId }),
    });

    if (!response.ok) {
      throw new Error(`Delete conversation error: ${response.statusText}`);
    }

    return response.json();
  }

  // 대화 이름 변경
  async renameConversation(
    conversationId: string,
    name: string,
    userId: string = 'prd-generator-user',
    autoGenerate: boolean = false
  ): Promise<Conversation> {
    const response = await fetch(`${this.endpoint}/conversations/${conversationId}/rename`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        auto_generate: autoGenerate,
        user: userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Rename conversation error: ${response.statusText}`);
    }

    return response.json();
  }

  // 메시지 내역 가져오기
  async getMessages(
    conversationId: string,
    userId: string = 'prd-generator-user',
    firstId?: string,
    limit: number = 20
  ): Promise<{ data: any[]; has_more: boolean; limit: number }> {
    const params = new URLSearchParams({
      conversation_id: conversationId,
      user: userId,
      limit: limit.toString(),
    });

    if (firstId) {
      params.append('first_id', firstId);
    }

    const response = await fetch(`${this.endpoint}/messages?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Get messages error: ${response.statusText}`);
    }

    return response.json();
  }

  // 추천 질문 가져오기
  async getSuggestedQuestions(messageId: string, userId: string = 'prd-generator-user'): Promise<string[]> {
    const params = new URLSearchParams({ user: userId });

    const response = await fetch(`${this.endpoint}/messages/${messageId}/suggest-questions?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Get suggested questions error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.questions || [];
  }

  // 채팅 중지
  async stopChat(taskId: string, userId: string = 'prd-generator-user'): Promise<{ result: string }> {
    const response = await fetch(`${this.endpoint}/chat/${taskId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: userId }),
    });

    if (!response.ok) {
      throw new Error(`Stop chat error: ${response.statusText}`);
    }

    return response.json();
  }

  // 프롬프트 생성
  async generatePrompt(query: string, flowContext: string, userId: string = 'prd-generator-user'): Promise<{ result: string }> {
    const response = await fetch(`${this.endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: `프롬프트 생성 요청: ${query}\n\n컨텍스트: ${flowContext}`,
        mode: 'standard',
        conversation_id: '',
        user: userId,
        files: [],
        auto_gen_name: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Prompt generation error: ${response.statusText}`);
    }

    const data = await response.json();
    return { result: data.answer || '프롬프트 생성에 실패했습니다.' };
  }
}

export const misoAgentAPI = new MISOAgentAPI();