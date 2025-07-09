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
    prdContent: string,
    designContent: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/miso/generate-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prdContent, designContent }),
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
    prdContent: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/miso/generate-design', {
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
      return data.design || '';
    } catch (error) {
      console.error('Failed to generate design:', error);
      return '';
    }
  }

  async fixDocument(
    documentType: 'prd' | 'design' | 'database',
    currentContent: string,
    fixRequest: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/miso/fix-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentType, currentContent, fixRequest }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return '';
      }

      const data = await response.json();
      return data.fixedContent || '';
    } catch (error) {
      console.error('Failed to fix document:', error);
      return '';
    }
  }
}

export const misoAPI = new MISOAPIClient();