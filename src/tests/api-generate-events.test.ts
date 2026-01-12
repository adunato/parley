/**
 * @jest-environment node
 */
import { POST } from '../app/api/bio-config/generate-events/route';
import { generateLifeEvents } from '../lib/generator/lifeEventGenerator';
import { NextRequest } from 'next/server';

jest.mock('../lib/generator/lifeEventGenerator', () => ({
  generateLifeEvents: jest.fn(),
}));

describe('POST /api/bio-config/generate-events', () => {
  it('should return generated events', async () => {
    const mockEvents = [{ id: 'e1', text: 'Event 1', weights: { DEFAULT: 1 } }];
    const mockTags = [{ id: 't1', description: 'Tag 1' }];
    (generateLifeEvents as jest.Mock).mockResolvedValue({ lifeEvents: mockEvents, newTags: mockTags });

    const req = new NextRequest('http://localhost/api/bio-config/generate-events', {
      method: 'POST',
      body: JSON.stringify({
        sourceEntity: { id: 's1', text: 'Source' },
        count: 3
      })
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.events).toEqual(mockEvents);
    expect(data.newTags).toEqual(mockTags);
  });

  it('should return 400 if parameters are missing', async () => {
    const req = new NextRequest('http://localhost/api/bio-config/generate-events', {
      method: 'POST',
      body: JSON.stringify({ count: 3 }) // Missing sourceEntity
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
