// Lo que hace quien reparte la memoria: dar un bloque y devolverlo.
export interface IAsignadorMemoria {
 
  asignar(pid: number, tamanio: number): boolean;
  
  liberar(pid: number): void;
}