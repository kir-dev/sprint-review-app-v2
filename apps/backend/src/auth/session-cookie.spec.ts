import type { Request } from 'express';
import { readCookie } from './session-cookie';

describe('readCookie', () => {
  const requestWith = (cookie?: string) =>
    ({ headers: cookie === undefined ? {} : { cookie } }) as Request;

  it('reads the named cookie among others', () => {
    expect(
      readCookie(
        requestWith('a=1; sprint-review-session=x.y.z; b=2'),
        'sprint-review-session',
      ),
    ).toBe('x.y.z');
  });

  it('does not match a cookie whose name only ends with the requested one', () => {
    expect(
      readCookie(
        requestWith('old-sprint-review-session=x.y.z'),
        'sprint-review-session',
      ),
    ).toBeNull();
  });

  it('returns null without a header or for malformed encoding', () => {
    expect(readCookie(requestWith(), 'session')).toBeNull();
    expect(readCookie(requestWith('session=%E0%A4%A'), 'session')).toBeNull();
  });
});
