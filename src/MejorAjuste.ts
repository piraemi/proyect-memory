import { EstrategiaAjuste } from './EstrategiaAjuste';
import type { IBloqueMemoria } from './IBloqueMemoria';

export class MejorAjuste extends EstrategiaAjuste {
  obtenerNombre(): string { return 'Mejor Ajuste'; }
  protected comparar(a: IBloqueMemoria, b: IBloqueMemoria): number {
    return a.obtenerTamanio() - b.obtenerTamanio();
  }
}