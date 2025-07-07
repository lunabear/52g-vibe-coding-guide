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
  ): Promise<{ planner: string[]; designer: string[]; developer: string[] }> {
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
        return { planner: [], designer: [], developer: [] };
      }

      const data = await response.json();
      return data.questions || { planner: [], designer: [], developer: [] };
    } catch (error) {
      console.error('Failed to generate final questions:', error);
      return { planner: [], designer: [], developer: [] };
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

  async generateDatabaseSchema(
    prdContent: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/miso/generate-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prdContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return '';
      }

      const data = await response.json();
      return data.schema || '';
    } catch (error) {
      console.error('Failed to generate database schema:', error);
      return '';
    }
  }

  async generateDesign(
    prdContent: string,
    databaseSchema: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/miso/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prdContent, databaseSchema }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return '';
      }

      const data = await response.json();
      return data.design || '';
    } catch (error) {
      console.error('Failed to generate design:', error);
      return '';
    }
  }
}

export const misoAPI = new MISOAPIClient();