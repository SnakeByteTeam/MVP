import { json } from 'body-parser';
import { JsonBodyMiddleware } from 'src/middlewares/json-body.middleware';

jest.mock('body-parser', () => ({
  json: jest.fn(),
}));

describe('JsonBodyMiddleware', () => {
  it('should call body-parser json middleware', () => {
    const middleware = new JsonBodyMiddleware();
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();
    const parser = jest.fn((_, __, n) => n());

    (json as unknown as jest.Mock).mockReturnValue(parser);

    middleware.use(req, res, next);

    expect(json).toHaveBeenCalled();
    expect(parser).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
