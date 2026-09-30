export interface IBloqueMemoria {
  obtenerInicio(): number;
  obtenerTamanio(): number;
  obtenerFin(): number;
  obtenerPid(): number | null;
  estaLibre(): boolean;
  estado(): string;
}