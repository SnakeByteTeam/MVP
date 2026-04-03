import * as bodyParser from 'body-parser';
import { RawBodyMiddleware } from './raw-body.middleware';

jest.mock('body-parser', () => ({
  raw: jest.fn(),
}));

describe('RawBodyMiddleware', () => {
  it('should call body-parser raw middleware with wildcard type', () => {
    const middleware = new RawBodyMiddleware();
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();
    const parser = jest.fn((_, __, n) => n());

    (bodyParser.raw as unknown as jest.Mock).mockReturnValue(parser);

    middleware.use(req, res, next);

    expect(bodyParser.raw).toHaveBeenCalledWith({ type: '*/*' });
    expect(parser).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
