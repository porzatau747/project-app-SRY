import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'mock generated content' } }]
          })
        }
      }
    }))
  };
});

vi.mock('fs/promises', () => {
  return {
    default: {
      readFile: vi.fn().mockResolvedValue('mock design guide content')
    }
  };
});

describe('POST /api/generate-content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  it('should return 500 if GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ template: 'free-text', prompt: 'test' })
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Missing GEMINI_API_KEY');
  });

  it('should generate content for free-text template', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ template: 'free-text', prompt: 'hello' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.result).toBe('mock generated content');
  });

  it('should generate content for ทิปส์ไอที template', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ template: 'ทิปส์ไอที', prompt: 'how to fix pc', imageLayout: 'album5' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.result).toBe('mock generated content');
  });
});
