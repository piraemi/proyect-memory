import type { IEstrategiaAsignacion } from './IEstrategiaAsignacion';
export interface IConfiguracion {
  obtenerMemoriaTotal(): number;
  obtenerQuantum(): number;
  obtenerEstrategia(): IEstrategiaAsignacion;
  estado(): string;
}