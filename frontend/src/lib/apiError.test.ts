import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './apiError';

describe('API errors shown to users', () => {
  it.each([
    [{ message: 'Título inválido' }, 'Título inválido'],
    [{ message: 'Erro', meta: { message: 'Ticket indisponível' } }, 'Ticket indisponível'],
    [{ message: 42 }, 'Tente novamente'],
    [{}, 'Tente novamente'],
  ])('handles a server error body %j', (body, expected) => {
    const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      data: body, status: 422, statusText: 'Unprocessable Entity', headers: {},
      config: { headers: new AxiosHeaders() },
    });
    expect(getApiErrorMessage(error, 'Tente novamente')).toBe(expected);
  });

  it.each([null, new Error('Offline'), 'unexpected'])('handles non-HTTP failures', (error) => {
    expect(getApiErrorMessage(error, 'Tente novamente')).toBe('Tente novamente');
  });
});
