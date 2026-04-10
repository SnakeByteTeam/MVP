import { describe, expect, it } from 'vitest';
import { environment } from './environment';

describe('environment', () => {
  it('espone la configurazione base attesa', () => {
    expect(typeof environment.production).toBe('boolean');
    expect(environment.apiBaseUrl.endsWith('/api')).toBe(true);
  });
});
