import { describe, expect, test } from 'vitest';
import { EventoES } from '../src/EventoES';
import { PlanificadorRoundRobin } from '../src/PlanificadorRoundRobin';
import { Proceso } from '../src/Proceso';

const listo = (pid: number, cpu: number, evento: EventoES | null = null) => {
  const p = new Proceso(pid, 100, cpu, evento);
  p.admitir();
  return p;
};

describe('PlanificadorRoundRobin - cola', () => {
  test('encola en orden y muestra su estado', () => {
    const rr = new PlanificadorRoundRobin(2);
    rr.encolar(listo(1, 3));
    rr.encolar(listo(2, 2));
    expect(rr.obtenerEnEjecucion()).toBeNull();
    expect(rr.obtenerListos().map((p) => p.obtenerPid())).toEqual([1, 2]);
    expect(rr.estado()).toBe('Round Robin (Q=2) | CPU: libre | Listos: P1, P2');
  });

  test('no se puede encolar dos veces el mismo proceso ni usar quantum inválido', () => {
    const rr = new PlanificadorRoundRobin(2);
    const p1 = listo(1, 3);
    rr.encolar(p1);
    expect(() => rr.encolar(p1)).toThrow();
    expect(() => new PlanificadorRoundRobin(0)).toThrow();
  });
});