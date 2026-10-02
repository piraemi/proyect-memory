import { describe, expect, test } from 'vitest';
import { EstadoProceso } from '../src/EstadoProceso';
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

describe('PlanificadorRoundRobin - ejecución', () => {
  test('caso de la consigna: Q=2, P1 (3 ticks) y P2 (2 ticks)', () => {
    const rr = new PlanificadorRoundRobin(2);
    rr.encolar(listo(1, 3));
    rr.encolar(listo(2, 2));
    const resultados = [1, 2, 3, 4, 5].map(() => rr.ejecutarTick());
    expect(resultados.map((r) => r.proceso?.obtenerPid())).toEqual([1, 1, 2, 2, 1]);
    expect(resultados.filter((r) => r.cambioContexto).length).toBe(1);
    expect(resultados.filter((r) => r.termino).length).toBe(2);
  });

  test('un proceso solo renueva su quantum sin cambio de contexto', () => {
    const rr = new PlanificadorRoundRobin(1);
    rr.encolar(listo(1, 3));
    const resultados = [1, 2, 3].map(() => rr.ejecutarTick());
    expect(resultados.map((r) => r.cambioContexto)).toEqual([false, false, false]);
    expect(resultados[2]?.termino).toBe(true);
  });

  test('si se bloquea por E/S deja la CPU (cambio de contexto)', () => {
    const rr = new PlanificadorRoundRobin(2);
    const p1 = listo(1, 3, new EventoES(1, 2));
    rr.encolar(p1);
    rr.encolar(listo(2, 2));
    const r = rr.ejecutarTick();
    expect(r.seBloqueo).toBe(true);
    expect(r.cambioContexto).toBe(true);
    expect(p1.obtenerEstado()).toBe(EstadoProceso.BLOQUEADO);
    expect(rr.ejecutarTick().proceso?.obtenerPid()).toBe(2);
  });

  test('con la cola vacía la CPU queda libre', () => {
    expect(new PlanificadorRoundRobin(2).ejecutarTick().proceso).toBeNull();
  });
});