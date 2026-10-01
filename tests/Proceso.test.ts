import { describe, expect, test } from 'vitest';
import { EstadoProceso } from '../src/EstadoProceso';
import { Proceso } from '../src/proceso';

describe('Proceso - creación y memoria', () => {
  test('empieza NUEVO con toda su CPU por usar', () => {
    const p = new Proceso(1, 100, 3);
    expect(p.obtenerEstado()).toBe(EstadoProceso.NUEVO);
    expect(p.obtenerCpuRestante()).toBe(3);
    expect(p.haFinalizado()).toBe(false);
    expect(p.estado()).toBe('P1 NUEVO | 100 KB | CPU 0/3');
  });

  test('rechaza datos inválidos', () => {
    expect(() => new Proceso(0, 100, 3)).toThrow();
    expect(() => new Proceso(1, -5, 3)).toThrow();
    expect(() => new Proceso(1, 100, 0)).toThrow();
  });

  test('puede esperar memoria y después ser admitido', () => {
    const p = new Proceso(1, 100, 3);
    p.esperarMemoria();
    expect(p.obtenerEstado()).toBe(EstadoProceso.ESPERANDO_MEMORIA);
    p.admitir();
    expect(p.obtenerEstado()).toBe(EstadoProceso.LISTO);
  });

  test('no puede hacer un cambio de estado prohibido', () => {
    const p = new Proceso(1, 100, 3);
    p.admitir();
    expect(() => p.admitir()).toThrow(); 
  });
});