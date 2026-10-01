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