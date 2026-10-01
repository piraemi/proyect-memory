import type { IBloqueMemoria } from './IBloqueMemoria';


export interface IConsultaMemoria {
  obtenerMemoriaTotal(): number;
  obtenerMemoriaOcupada(): number;
  obtenerMemoriaLibre(): number;
  obtenerMayorBloqueLibre(): number;
  obtenerMapa(): ReadonlyArray<IBloqueMemoria>;
  estado(): string;
}