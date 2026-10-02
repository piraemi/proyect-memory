import type { IProcesoES } from './IProcesoES';
import type { IProcesoInfo } from './IProcesoInfo';

export type ProcesoBloqueable = IProcesoInfo & IProcesoES;

export interface IGestorES {
  agregar(proceso: ProcesoBloqueable): void;
  avanzarTick(): ProcesoBloqueable[];
  obtenerBloqueados(): ReadonlyArray<IProcesoInfo>;
  estado(): string;
}