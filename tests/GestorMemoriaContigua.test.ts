import { describe, expect, test } from 'vitest';
import { GestorMemoriaContigua } from '../src/GestorMemoriaContigua';
import { PrimerAjuste } from '../src/PrimerAjuste';

describe('GestorMemoriaContigua - consultas', () => {
  test('empieza con un solo bloque libre de toda la memoria', () => {
    const gestor = new GestorMemoriaContigua(1024, new PrimerAjuste());
    expect(gestor.estado()).toBe('Memoria 1024 KB (Primer Ajuste)\n[0-1024) 1024 KB pid: libre');
    expect(gestor.obtenerMemoriaTotal()).toBe(1024);
    expect(gestor.obtenerMemoriaLibre()).toBe(1024);
    expect(gestor.obtenerMemoriaOcupada()).toBe(0);
    expect(gestor.obtenerMayorBloqueLibre()).toBe(1024);
  });

  test('rechaza una memoria total inválida', () => {
    expect(() => new GestorMemoriaContigua(0, new PrimerAjuste())).toThrow();
  });

  test('el mapa es una copia que no se puede modificar', () => {
    const gestor = new GestorMemoriaContigua(1024, new PrimerAjuste());
    const mapa = gestor.obtenerMapa() as unknown[];
    expect(() => mapa.push('otro bloque')).toThrow();
    expect(gestor.obtenerMapa().length).toBe(1);
  });
});

describe('GestorMemoriaContigua - asignar y liberar', () => {
  const mapa = (gestor: GestorMemoriaContigua) => gestor.obtenerMapa().map((b) => b.estado());

  test('asignar parte el bloque libre en dos', () => {
    const gestor = new GestorMemoriaContigua(1024, new PrimerAjuste());
    expect(gestor.asignar(1, 100)).toBe(true);
    expect(mapa(gestor)).toEqual(['[0-100) 100 KB pid: 1', '[100-1024) 924 KB pid: libre']);
  });

  test('si no hay hueco suficiente devuelve false y no cambia nada', () => {
    const gestor = new GestorMemoriaContigua(400, new PrimerAjuste());
    [1, 2, 3, 4].forEach((pid) => gestor.asignar(pid, 100));
    gestor.liberar(1);
    gestor.liberar(3); 
    const antes = mapa(gestor);
    expect(gestor.asignar(5, 150)).toBe(false);
    expect(mapa(gestor)).toEqual(antes);
  });

  test('al liberar se unen los huecos libres pegados (coalescencia)', () => {
    const gestor = new GestorMemoriaContigua(1024, new PrimerAjuste());
    [1, 2, 3].forEach((pid) => gestor.asignar(pid, 100));
    gestor.liberar(1);
    gestor.liberar(2); 
    expect(mapa(gestor)).toEqual(['[0-200) 200 KB pid: libre', '[200-300) 100 KB pid: 3', '[300-1024) 724 KB pid: libre']);
    gestor.liberar(3); 
    expect(mapa(gestor)).toEqual(['[0-1024) 1024 KB pid: libre']);
  });

  test('no se puede asignar dos veces ni liberar lo que no está', () => {
    const gestor = new GestorMemoriaContigua(1024, new PrimerAjuste());
    gestor.asignar(1, 100);
    expect(() => gestor.asignar(1, 50)).toThrow();
    expect(() => gestor.liberar(99)).toThrow();
  });
});