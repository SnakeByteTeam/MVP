import { AppController } from 'src/app.controller';

describe('AppController', () => {
  it('getHello restituisce il testo atteso', () => {
    const controller = new AppController();

    expect(controller.getHello()).toBe('Hello World!');
  });
});
