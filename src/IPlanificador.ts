import type { IProcesoCpu } from './IProcesoCpu';
import type { IProcesoES } from './IProcesoES';
import type { IProcesoInfo } from './IProcesoInfo';


export type ProcesoPlanificable = IProcesoInfo & IProcesoCpu & IProcesoES;


export interface ResultadoTick {
  proceso: ProcesoPlanificable | null; 
  termino: boolean;                    
  seBloqueo: boolean;                 
  cambioContexto: boolean;           
}


export interface IPlanificador {
  encolar(proceso: ProcesoPlanificable): void;
  ejecutarTick(): ResultadoTick;
  obtenerEnEjecucion(): IProcesoInfo | null;
  obtenerListos(): ReadonlyArray<IProcesoInfo>;
  estado(): string;
}