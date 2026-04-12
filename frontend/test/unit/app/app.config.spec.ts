import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appConfig } from 'src/app/app.config';
import { EventSubscriptionService } from 'src/app/core/alarm/services/event-subscription.service';

describe('appConfig initialization', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('runs EventSubscriptionService initialization at bootstrap', () => {
    const initializeSpy = vi
      .spyOn(EventSubscriptionService.prototype, 'initialize')
      .mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [...(appConfig.providers ?? [])],
    });

    TestBed.inject(EventSubscriptionService);

    expect(initializeSpy).toHaveBeenCalledWith([]);
  });
});
