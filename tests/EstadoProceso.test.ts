import { describe, expect, test } from 'vitest';
import { EstadoProceso, puedeCambiar } from '../src/EstadoProceso';

describe('EstadoProceso', () => {
  test('cambios permitidos', () => {
    expect(puedeCambiar(EstadoProceso.NUEVO, EstadoProceso.LISTO)).toBe(true);
    expect(puedeCambiar(EstadoProceso.LISTO, EstadoProceso.EJECUTANDO)).toBe(true);
    expect(puedeCambiar(EstadoProceso.EJECUTANDO, EstadoProceso.BLOQUEADO)).toBe(true);
    expect(puedeCambiar(EstadoProceso.BLOQUEADO, EstadoProceso.LISTO)).toBe(true);
    expect(puedeCambiar(EstadoProceso.EJECUTANDO, EstadoProceso.TERMINADO)).toBe(true);
  });

  test('cambios NO permitidos', () => {
    expect(puedeCambiar(EstadoProceso.NUEVO, EstadoProceso.EJECUTANDO)).toBe(false);
    expect(puedeCambiar(EstadoProceso.BLOQUEADO, EstadoProceso.EJECUTANDO)).toBe(false);
    expect(puedeCambiar(EstadoProceso.TERMINADO, EstadoProceso.LISTO)).toBe(false);
  });
});