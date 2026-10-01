import type { EstadoProceso } from './EstadoProceso';

export interface IProcesoInfo {
  obtenerPid(): number;
  obtenerMemoriaRequerida(): number;
  obtenerCpuRestante(): number;
  obtenerEstado(): EstadoProceso;
  haFinalizado(): boolean;
  estado(): string;
}