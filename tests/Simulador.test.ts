import { describe, expect, test } from 'vitest';
import { ConfiguracionSimulacion } from '../src/ConfiguracionSimulacion';
import { EstadoProceso } from '../src/EstadoProceso';
import { EventoES } from '../src/EventoES';
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

  test('si no hay memoria espera, y entra el tick siguiente a que se libere', () => {
    const sim = nuevoSimulador();
    sim.registrarProceso(1, 1000, 1);
    sim.registrarProceso(2, 100, 1);
    sim.avanzarTick(); // P1 entra, ejecuta y termina; P2 no entró porque la memoria estaba ocupada
    expect(estadoDe(sim, 1)).toBe(EstadoProceso.TERMINADO);
    expect(estadoDe(sim, 2)).toBe(EstadoProceso.ESPERANDO_MEMORIA);
    sim.avanzarTick(); // ahora sí entra
    expect(estadoDe(sim, 2)).toBe(EstadoProceso.TERMINADO);
    expect(sim.obtenerHistorialCpu()).toEqual([1, 2]);
  });

  test('un proceso que se bloquea por E/S deja la CPU y después vuelve', () => {
    const sim = nuevoSimulador();
    sim.registrarProceso(1, 100, 2, new EventoES(1, 1)); // después de 1 tick, espera 1
    sim.registrarProceso(2, 100, 2);
    avanzar(sim, 5);
    expect(sim.obtenerHistorialCpu()).toEqual([1, 2, 2, 1, null]);
    expect(sim.obtenerMetricas().obtenerCambiosContexto()).toBe(1);
    expect(sim.obtenerMetricas().obtenerUtilizacionCpu()).toBe(80);
  });

  test('muestra el estado completo del sistema', () => {
    const sim = nuevoSimulador();
    sim.registrarProceso(1, 100, 3);
    sim.avanzarTick();
    expect(sim.estado()).toBe([
      'Tick 1',
      'Round Robin (Q=2) | CPU: P1 | Listos: ',
      'Bloqueados: ',
      'P1 EJECUTANDO | 100 KB | CPU 1/3',
      'Memoria 1024 KB (Primer Ajuste)',
      '[0-100) 100 KB pid: 1',
      '[100-1024) 924 KB pid: libre',
      'Memoria 9.8% | CPU 100.0% | Cambios de contexto 0 | Fragmentación 0.0%',
    ].join('\n'));
  });
});