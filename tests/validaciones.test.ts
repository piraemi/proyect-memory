 import { describe, expect, test } from 'vitest';
import { validarEnteroPositivo } from '../src/validaciones';

describe('validarEnteroPositivo', () => {
  test('acepta números positivos', () => {
    expect(() => validarEnteroPositivo(5, 'valor')).not.toThrow();
  });

  test('rechaza el 0, negativos y decimales', () => {
    expect(() => validarEnteroPositivo(0, 'valor')).toThrow();
    expect(() => validarEnteroPositivo(-5, 'valor')).toThrow();
    expect(() => validarEnteroPositivo(2.5, 'valor')).toThrow();
  });
});