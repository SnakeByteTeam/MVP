import { Suggestion } from './suggestion.model';

describe('Suggestion', () => {
  describe('getMessage', () => {
    it('should return the message passed in the constructor', () => {
      const suggestion = new Suggestion(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
        true,
      );
      expect(suggestion.getMessage()).toBe(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
      );
    });

    it('should return "No action required." when no action is needed', () => {
      const suggestion = new Suggestion('No action required.', false);
      expect(suggestion.getMessage()).toBe('No action required.');
    });
  });

  describe('getIsSuggestion', () => {
    it('should return true when action is required', () => {
      const suggestion = new Suggestion(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
        true,
      );
      expect(suggestion.getIsSuggestion()).toBe(true);
    });

    it('should return false when no action is required', () => {
      const suggestion = new Suggestion('No action required.', false);
      expect(suggestion.getIsSuggestion()).toBe(false);
    });
  });
});
