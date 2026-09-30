import { describe, expect, test } from 'vitest';
import { BloqueMemoria } from '../src/BloqueMemoria';

describe('BloqueMemoria', () => {
  test('un bloque libre', () => {
    const bloque = new BloqueMemoria(0, 1024, null);
    expect(bloque.obtenerInicio()).toBe(0);
    expect(bloque.obtenerTamanio()).toBe(1024);
    expect(bloque.obtenerFin()).toBe(1024);
    expect(bloque.estaLibre()).toBe(true);
  });

  test('un bloque ocupado por un proceso', () => {
    const bloque = new BloqueMemoria(100, 50, 7);
    expect(bloque.obtenerPid()).toBe(7);
    expect(bloque.estaLibre()).toBe(false);
  });

  test('rechaza inicio negativo, tamaño 0 y pid inválido', () => {
    expect(() => new BloqueMemoria(-1, 10, null)).toThrow();
    expect(() => new BloqueMemoria(0, 0, null)).toThrow();
    expect(() => new BloqueMemoria(0, 10, 0)).toThrow();
  });

  test('muestra su estado completo como texto', () => {
    expect(new BloqueMemoria(0, 100, 1).estado()).toBe('[0-100) 100 KB pid: 1');
    expect(new BloqueMemoria(100, 924, null).estado()).toBe('[100-1024) 924 KB pid: libre');
  });
});