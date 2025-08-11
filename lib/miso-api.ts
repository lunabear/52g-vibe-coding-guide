import { WorkflowNode } from '@/types/prd.types';

interface MISOWorkflowResponse {
  data?: {
    outputs?: {
      result?: string[];
    };
  };
}

export class MISOAPIClient {
  async runMisoWorkflowWithType(query: string, misoAppType?: string, optionalContext?: string | null): Promise<{ explanation: string; flow?: WorkflowNode[]; flowYaml?: string; prompt?: string; knowledge?: string }> {
    try {
      const body: any = { query };
      if (misoAppType) {
        body.miso_app_type = misoAppType;
      }
      if (optionalContext) {
        body.optional_context = optionalContext;
      }

      const response = await fetch('/api/miso/run-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error - Status:', response.status);
        console.error('API Error - Data:', errorData);
        
        // explanation이 있으면 그것을 반환 (정상적인 응답일 수 있음)
        if (errorData.explanation) {
          console.log('Found explanation in error response, treating as success');
          return { explanation: errorData.explanation, flow: errorData.flow, flowYaml: errorData.flowYaml, prompt: errorData.prompt, knowledge: errorData.knowledge };
        }
        
        return { explanation: `Error: ${errorData.error || 'Unknown error'}` };
      }

      const data = await response.json();
      console.log('Success response data:', data);
      return { explanation: data.explanation || '', flow: data.flow, flowYaml: data.flowYaml, prompt: data.prompt, knowledge: data.knowledge };
    } catch (error) {
      console.error('Failed to run Miso workflow:', error);
      return { explanation: 'An unexpected error occurred.' };
    }
  }
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