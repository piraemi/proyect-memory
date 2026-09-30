import type { IBloqueMemoria } from './IBloqueMemoria';

export interface IEstrategiaAsignacion {
  obtenerNombre(): string;
  seleccionarBloque(bloques: ReadonlyArray<IBloqueMemoria>, tamanio: number): IBloqueMemoria | undefined;
}