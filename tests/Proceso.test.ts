import { describe, expect, test } from 'vitest';
import { EstadoProceso } from '../src/EstadoProceso';
import { EventoES } from '../src/EventoES';
import { Proceso } from '../src/Proceso';

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
    expect(() => p.admitir()).toThrow(); // de LISTO a LISTO no se puede
  });
});

describe('Proceso - uso de CPU', () => {
  const listo = () => {
    const p = new Proceso(1, 100, 3);
    p.admitir();
    return p;
  };

  test('al ejecutar un tick le queda un tick menos', () => {
    const p = listo();
    p.despachar();
    p.ejecutarTick();
    expect(p.obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);
    expect(p.obtenerCpuRestante()).toBe(2);
    expect(p.estado()).toBe('P1 EJECUTANDO | 100 KB | CPU 1/3');
  });

  test('agota el quantum, lo renueva y puede ser expropiado', () => {
    const p = listo();
    p.despachar();
    p.ejecutarTick();
    p.ejecutarTick();
    expect(p.agotoQuantum(2)).toBe(true);
    p.renovarQuantum();
    expect(p.agotoQuantum(2)).toBe(false);
    p.expropiar();
    expect(p.obtenerEstado()).toBe(EstadoProceso.LISTO);
  });

  test('termina solo cuando usó toda su CPU', () => {
    const p = listo();
    p.despachar();
    expect(() => p.terminar()).toThrow();
    [1, 2, 3].forEach(() => p.ejecutarTick());
    expect(p.haFinalizado()).toBe(true);
    expect(() => p.ejecutarTick()).toThrow();
    p.terminar();
    expect(p.obtenerEstado()).toBe(EstadoProceso.TERMINADO);
  });

  test('no puede ejecutar si no está en la CPU', () => {
    expect(() => listo().ejecutarTick()).toThrow();
  });
});

describe('Proceso - entrada/salida', () => {
  test('se bloquea después de los ticks indicados y vuelve a LISTO al terminar la espera', () => {
    const p = new Proceso(1, 100, 3, new EventoES(1, 2)); // E/S después de 1 tick, dura 2
    p.admitir();
    p.despachar();
    expect(p.debeBloquearse()).toBe(false);
    p.ejecutarTick();
    expect(p.debeBloquearse()).toBe(true);
    p.bloquear();
    expect(p.obtenerEstado()).toBe(EstadoProceso.BLOQUEADO);
    p.avanzarBloqueo();
    expect(p.esperaTerminada()).toBe(false);
    p.avanzarBloqueo();
    expect(p.esperaTerminada()).toBe(true);
    p.desbloquear();
    expect(p.obtenerEstado()).toBe(EstadoProceso.LISTO);
    expect(p.obtenerCpuRestante()).toBe(2); // bloqueado no usó CPU
  });

  test('sin evento de E/S nunca se bloquea', () => {
    const p = new Proceso(1, 100, 3);
    p.admitir();
    p.despachar();
    p.ejecutarTick();
    expect(p.debeBloquearse()).toBe(false);
    expect(() => p.bloquear()).toThrow();
  });

  test('la E/S tiene que ocurrir antes de terminar', () => {
    expect(() => new Proceso(1, 100, 3, new EventoES(3, 2))).toThrow();
  });
});