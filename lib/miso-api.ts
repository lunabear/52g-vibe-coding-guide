interface MISOWorkflowResponse {
  data?: {
    outputs?: {
      result?: string[];
    };
  };
}

export class MISOAPIClient {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_MISO_API_KEY || '';
    this.endpoint = process.env.NEXT_PUBLIC_MISO_ENDPOINT || '';
  }

  async generateFinalQuestions(
    context: Record<string, string>
  ): Promise<string[]> {
    try {
      // API 설정 확인
      if (!this.apiKey || !this.endpoint) {
        console.warn('MISO API not configured.');
        return [];
      }

      const response = await fetch(`${this.endpoint}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            context: JSON.stringify(context),
            step: 'generate_questions',
          },
          mode: 'blocking',
          user: 'prd-generator',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MISO API Error Response:', errorText);
        console.error('Response Status:', response.status);
        console.error('Endpoint:', this.endpoint);
        
        return [];
      }

      const responseText = await response.text();
      console.log('MISO API Response Text:', responseText);
      
      const data = JSON.parse(responseText);
      console.log('MISO API Parsed Data:', data);
      
      // 중첩된 응답 구조 처리: data.data.outputs.result
      if (data.data && data.data.outputs && data.data.outputs.result && Array.isArray(data.data.outputs.result)) {
        console.log('Found questions in data.data.outputs.result:', data.data.outputs.result);
        return data.data.outputs.result;
      }
      
      // 대체 응답 구조들
      if (data.outputs && data.outputs.result && Array.isArray(data.outputs.result)) {
        console.log('Found questions in data.outputs.result:', data.outputs.result);
        return data.outputs.result;
      }
      
      if (data.result && Array.isArray(data.result)) {
        console.log('Found questions in data.result:', data.result);
        return data.result;
      }
      
      console.warn('Unexpected MISO API response structure:', JSON.stringify(data, null, 2));
      return [];
    } catch (error) {
      console.error('Failed to generate final questions:', error);
      return [];
    }
  }

  async generatePRD(
    allQuestionsAndAnswers: Array<{ question: string; answer: string }>
  ): Promise<string> {
    try {
      // API 설정 확인
      if (!this.apiKey || !this.endpoint) {
        console.warn('MISO API not configured.');
        return '';
      }

      // 질문과 답변을 상세한 context로 변환
      const contextString = allQuestionsAndAnswers
        .map(qa => `질문: ${qa.question}\n답변: ${qa.answer}`)
        .join('\n\n');

      const response = await fetch(`${this.endpoint}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            context: contextString,
            step: 'generate_prd',
          },
          mode: 'blocking',
          user: 'prd-generator',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MISO API Error Response:', errorText);
        return '';
      }

      const responseText = await response.text();
      console.log('MISO API PRD Response:', responseText);
      
      const data = JSON.parse(responseText);
      
      // 중첩된 응답 구조 처리
      if (data.data && data.data.outputs && data.data.outputs.result) {
        return data.data.outputs.result;
      }
      
      if (data.outputs && data.outputs.result) {
        return data.outputs.result;
      }
      
      if (data.result) {
        return data.result;
      }
      
      console.warn('Unexpected MISO API response structure for PRD:', data);
      return '';
    } catch (error) {
      console.error('Failed to generate PRD:', error);
      return '';
    }
  }
}

export const misoAPI = new MISOAPIClient();