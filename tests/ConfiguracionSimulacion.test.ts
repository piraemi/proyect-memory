import { describe, expect, test } from 'vitest';
import { ConfiguracionSimulacion } from '../src/ConfiguracionSimulacion';
import { PrimerAjuste } from '../src/PrimerAjuste';

describe('ConfiguracionSimulacion', () => {
  test('guarda la configuración de referencia', () => {
    const config = new ConfiguracionSimulacion(1024, 2, new PrimerAjuste());
    expect(config.obtenerMemoriaTotal()).toBe(1024);
    expect(config.obtenerQuantum()).toBe(2);
    expect(config.estado()).toBe('1024 KB | quantum 2 | Primer Ajuste');
  });

  test('rechaza memoria o quantum inválidos', () => {
    expect(() => new ConfiguracionSimulacion(0, 2, new PrimerAjuste())).toThrow();
    expect(() => new ConfiguracionSimulacion(1024, 1.5, new PrimerAjuste())).toThrow();
  });
});