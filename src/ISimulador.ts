import type { IEventoES } from './IEventoES';
import type { IMetricas } from './IMetricas';
import type { IProcesoInfo } from './IProcesoInfo';
export interface ISimulador {
  registrarProceso(pid: number, memoria: number, cpu: number, eventoES?: IEventoES | null): void;
  avanzarTick(): void;
}

export interface IConsultaSimulador {
  obtenerTick(): number;
  obtenerProcesos(): ReadonlyArray<IProcesoInfo>;

  obtenerHistorialCpu(): ReadonlyArray<number | null>;
  obtenerMetricas(): IMetricas;
  estado(): string;
}