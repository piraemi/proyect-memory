import { describe, expect, test } from 'vitest';
import { EstadoProceso } from '../src/EstadoProceso';
import { EventoES } from '../src/EventoES';
import { GestorES } from '../src/GestorES';
import { Proceso } from '../src/Proceso';


const bloqueado = (pid: number, duracion: number) => {
  const p = new Proceso(pid, 100, 3, new EventoES(1, duracion));
  p.admitir();
  p.despachar();
  p.ejecutarTick();
  p.bloquear();
  return p;
};

describe('GestorES', () => {
  test('cada proceso vuelve a LISTO cuando termina su espera', () => {
    const es = new GestorES();
    const p1 = bloqueado(1, 1);
    const p2 = bloqueado(2, 2);
    es.agregar(p1);
    es.agregar(p2);
    expect(es.estado()).toBe('Bloqueados: P1, P2');
    expect(es.avanzarTick()).toEqual([p1]);
    expect(p1.obtenerEstado()).toBe(EstadoProceso.LISTO);
    expect(es.avanzarTick()).toEqual([p2]);
    expect(es.obtenerBloqueados().length).toBe(0);
  });

  test('solo acepta procesos bloqueados y una sola vez', () => {
    const es = new GestorES();
    expect(() => es.agregar(new Proceso(1, 100, 3))).toThrow();
    const p1 = bloqueado(1, 2);
    es.agregar(p1);
    expect(() => es.agregar(p1)).toThrow();
  });
});