import { describe, expect, test } from 'vitest';
import { exigir, validarEnteroPositivo } from '../src/validaciones';

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

describe('exigir', () => {
  test('no hace nada si la condición se cumple', () => {
    expect(() => exigir(true, 'error')).not.toThrow();
  });

  test('lanza el error con el mensaje si no se cumple', () => {
    expect(() => exigir(false, 'algo salió mal')).toThrow('algo salió mal');
  });
});