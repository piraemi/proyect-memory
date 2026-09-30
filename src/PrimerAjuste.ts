import { EstrategiaAjuste } from './EstrategiaAjuste';

export class PrimerAjuste extends EstrategiaAjuste {
  obtenerNombre(): string { return 'Primer Ajuste'; }
  protected comparar(): number { return 0; }
}