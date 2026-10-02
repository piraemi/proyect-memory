import { describe, expect, test } from 'vitest';
import { GestorMemoriaContigua } from '../src/GestorMemoriaContigua';
import { MetricasSimulacion } from '../src/MetricasSimulacion';
import { PrimerAjuste } from '../src/PrimerAjuste';

describe('MetricasSimulacion', () => {
  test('en el tick 0 todo está en cero', () => {
    const memoria = new GestorMemoriaContigua(1024, new PrimerAjuste());
    const m = new MetricasSimulacion(memoria, 0, 0, 0);
    expect(m.obtenerUtilizacionCpu()).toBe(0);
    expect(m.obtenerOcupacionMemoria()).toBe(0);
    expect(m.obtenerFragmentacionExterna()).toBe(0);
  });

  test('caso de la consigna: huecos de 100 y 300 KB dan 25% de fragmentación', () => {
    const memoria = new GestorMemoriaContigua(1024, new PrimerAjuste());
    [[1, 100], [2, 200], [3, 300], [4, 424]].forEach(([pid, kb]) => memoria.asignar(pid!, kb!));
    memoria.liberar(1);
    memoria.liberar(3);
    const m = new MetricasSimulacion(memoria, 4, 5, 1);
    expect(m.obtenerMemoriaLibre()).toBe(400);
    expect(m.obtenerMayorBloqueLibre()).toBe(300);
    expect(m.obtenerFragmentacionExterna()).toBe(25);
    expect(m.obtenerUtilizacionCpu()).toBe(80);
    expect(m.obtenerCambiosContexto()).toBe(1);
    expect(m.estado()).toBe('Memoria 60.9% | CPU 80.0% | Cambios de contexto 1 | Fragmentación 25.0%');
  });

  test('con la memoria llena la fragmentación es 0%', () => {
    const memoria = new GestorMemoriaContigua(1024, new PrimerAjuste());
    memoria.asignar(1, 1024);
    const m = new MetricasSimulacion(memoria, 1, 1, 0);
    expect(m.obtenerOcupacionMemoria()).toBe(100);
    expect(m.obtenerFragmentacionExterna()).toBe(0);
  });
});