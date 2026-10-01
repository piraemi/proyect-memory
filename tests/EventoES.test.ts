import { describe, expect, test } from 'vitest';
import { EventoES } from '../src/EventoES';

describe('EventoES', () => {
  test('guarda cuándo se bloquea y cuánto dura', () => {
    const evento = new EventoES(2, 3);
    expect(evento.obtenerTicksAntesDeBloquear()).toBe(2);
    expect(evento.obtenerDuracion()).toBe(3);
  });

  test('muestra su estado como texto', () => {
    expect(new EventoES(2, 3).estado()).toBe('E/S después de 2 ticks, dura 3');
  });

  test('rechaza valores inválidos', () => {
    expect(() => new EventoES(0, 3)).toThrow();
    expect(() => new EventoES(2, -1)).toThrow();
  });
});