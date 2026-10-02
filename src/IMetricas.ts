// Los números que resumen cómo va la simulación.
export interface IMetricas {
  obtenerOcupacionMemoria(): number;     // % de memoria ocupada
  obtenerUtilizacionCpu(): number;       // % de ticks en que la CPU trabajó
  obtenerCambiosContexto(): number;
  obtenerMemoriaLibre(): number;         // KB
  obtenerMayorBloqueLibre(): number;     // KB
  obtenerFragmentacionExterna(): number; // % de la memoria libre que NO está en el hueco más grande
  estado(): string;
}