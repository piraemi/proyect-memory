import { EstrategiaAjuste } from './EstrategiaAjuste';
import type { IBloqueMemoria } from './IBloqueMemoria';

export class PeorAjuste extends EstrategiaAjuste {
  obtenerNombre(): string { return 'Peor Ajuste'; }
  protected comparar(a: IBloqueMemoria, b: IBloqueMemoria): number {
    return b.obtenerTamanio() - a.obtenerTamanio();
  }
}
