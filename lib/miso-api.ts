interface MISOWorkflowResponse {
  data?: {
    outputs?: {
      result?: string[];
    };
  };
}

export class MISOAPIClient {
  async generateFinalQuestions(
    context: Record<string, string>
  ): Promise<string[]> {
    try {
      const response = await fetch('/api/miso/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return [];
      }

      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error('Failed to generate final questions:', error);
      return [];
    }
  }

  async generatePRD(
    allQuestionsAndAnswers: Array<{ question: string; answer: string }>
  ): Promise<string> {
    try {
      const response = await fetch('/api/miso/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allQuestionsAndAnswers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return '';
      }

      const data = await response.json();
      return data.prd || '';
    } catch (error) {
      console.error('Failed to generate PRD:', error);
      return '';
    }
  }
}

export const misoAPI = new MISOAPIClient();