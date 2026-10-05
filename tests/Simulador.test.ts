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
    expect(sim.obtenerMetricas().obtenerMemoriaLibre()).toBe(1024); 
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
    sim.avanzarTick(); 
    expect(estadoDe(sim, 1)).toBe(EstadoProceso.TERMINADO);
    expect(estadoDe(sim, 2)).toBe(EstadoProceso.ESPERANDO_MEMORIA);
    sim.avanzarTick(); // ahora sí entra
    expect(estadoDe(sim, 2)).toBe(EstadoProceso.TERMINADO);
    expect(sim.obtenerHistorialCpu()).toEqual([1, 2]);
  });

  test('un proceso que se bloquea por E/S deja la CPU y después vuelve', () => {
    const sim = nuevoSimulador();
    sim.registrarProceso(1, 100, 2, new EventoES(1, 1)); 
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

  test('RF03: un proceso que no entra no impide que entren otros más chicos', () => {
    const sim = nuevoSimulador();
    sim.registrarProceso(1, 1000, 5);
    sim.registrarProceso(2, 500, 1); 
    sim.registrarProceso(3, 20, 1); 
    sim.avanzarTick();
    expect(estadoDe(sim, 2)).toBe(EstadoProceso.ESPERANDO_MEMORIA);
    expect(estadoDe(sim, 3)).toBe(EstadoProceso.LISTO);
  });

  test('RF10: consulta CPU, listos, bloqueados y mapa de memoria', () => {
    const sim = nuevoSimulador();
    sim.registrarProceso(1, 100, 3, new EventoES(1, 2));
    sim.registrarProceso(2, 200, 3);
    sim.avanzarTick(); 
    sim.avanzarTick(); 
    expect(sim.obtenerEnEjecucion()?.obtenerPid()).toBe(2);
    expect(sim.obtenerListos().length).toBe(0);
    expect(sim.obtenerBloqueados().map((p) => p.obtenerPid())).toEqual([1]);
    expect(sim.obtenerMapaMemoria().map((b) => b.estado())).toEqual([
      '[0-100) 100 KB pid: 1',
      '[100-300) 200 KB pid: 2',
      '[300-1024) 724 KB pid: libre',
    ]);
    expect(() => (sim.obtenerListos() as unknown[]).push(1)).toThrow();
  });
});