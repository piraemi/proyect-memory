import { describe, expect, test } from 'vitest';
import { ConfiguracionSimulacion } from '../src/ConfiguracionSimulacion';
import { EstadoProceso } from '../src/EstadoProceso';
import { PrimerAjuste } from '../src/PrimerAjuste';
import { Simulador } from '../src/Simulador';

const nuevoSimulador = (memoria = 1024, quantum = 2) =>
  Simulador.crear(new ConfiguracionSimulacion(memoria, quantum, new PrimerAjuste()));
const avanzar = (sim: Simulador, ticks: number) => Array.from({ length: ticks }).forEach(() => sim.avanzarTick());
const estadoDe = (sim: Simulador, pid: number) => sim.obtenerProcesos().find((p) => p.obtenerPid() === pid)?.obtenerEstado();

describe('Simulador', () => {
  test('tick 0: nada ejecutó y las métricas están en cero', () => {
    const sim = nuevoSimulador();
    expect(sim.obtenerTick()).toBe(0);
    expect(sim.obtenerMetricas().obtenerUtilizacionCpu()).toBe(0);
  });

  test('caso de la consigna: Q=2, P1 (3 ticks) y P2 (2 ticks)', () => {
    const sim = nuevoSimulador();
    sim.registrarProceso(1, 100, 3);
    sim.registrarProceso(2, 200, 2);
    avanzar(sim, 5);
    expect(sim.obtenerHistorialCpu()).toEqual([1, 1, 2, 2, 1]);
    expect(sim.obtenerMetricas().obtenerCambiosContexto()).toBe(1);
    expect(estadoDe(sim, 1)).toBe(EstadoProceso.TERMINADO);
    expect(sim.obtenerMetricas().obtenerMemoriaLibre()).toBe(1024); // se liberó toda la memoria
  });

  test('rechaza pid repetido y procesos más grandes que la memoria', () => {
    const sim = nuevoSimulador();
    sim.registrarProceso(1, 100, 3);
    expect(() => sim.registrarProceso(1, 100, 3)).toThrow();
    expect(() => sim.registrarProceso(2, 2000, 3)).toThrow();
  });
});