import { describe, expect, test } from 'vitest';
import { BloqueMemoria } from '../src/BloqueMemoria';
import type { IEstrategiaAsignacion } from '../src/IEstrategiaAsignacion';
import { MejorAjuste } from '../src/MejorAjuste';
import { PeorAjuste } from '../src/PeorAjuste';
import { PrimerAjuste } from '../src/PrimerAjuste';


const memoria = [
  new BloqueMemoria(0, 150, null),
  new BloqueMemoria(150, 50, 1),
  new BloqueMemoria(200, 100, null),
  new BloqueMemoria(300, 100, 2),
  new BloqueMemoria(400, 300, null),
];

describe('Estrategias de asignación (polimorfismo)', () => {
  
  test.each<[IEstrategiaAsignacion, number]>([
    [new PrimerAjuste(), 0],
    [new MejorAjuste(), 200],
    [new PeorAjuste(), 400],
  ])('%s elige el bloque correcto para 80 KB', (estrategia, inicioEsperado) => {
    expect(estrategia.seleccionarBloque(memoria, 80)?.obtenerInicio()).toBe(inicioEsperado);
  });

  test.each([new PrimerAjuste(), new MejorAjuste(), new PeorAjuste()])(
    '%s devuelve undefined si ningún bloque alcanza',
    (estrategia) => {
      expect(estrategia.seleccionarBloque(memoria, 500)).toBeUndefined();
    },
  );

  test.each([new PrimerAjuste(), new MejorAjuste(), new PeorAjuste()])(
    '%s ante un empate elige la menor dirección',
    (estrategia) => {
      const empate = [new BloqueMemoria(300, 100, null), new BloqueMemoria(0, 100, null)];
      expect(estrategia.seleccionarBloque(empate, 50)?.obtenerInicio()).toBe(0);
    },
  );

  test('cada estrategia tiene su nombre', () => {
    expect(new PrimerAjuste().obtenerNombre()).toBe('Primer Ajuste');
    expect(new MejorAjuste().obtenerNombre()).toBe('Mejor Ajuste');
    expect(new PeorAjuste().obtenerNombre()).toBe('Peor Ajuste');
  });
});