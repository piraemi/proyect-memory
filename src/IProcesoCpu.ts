export interface IProcesoCpu {
  despachar(): void;
  ejecutarTick(): void;
  agotoQuantum(quantum: number): boolean;
  renovarQuantum(): void;
  expropiar(): void;
  terminar(): void;
}