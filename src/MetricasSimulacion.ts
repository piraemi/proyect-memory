import type { IConsultaMemoria } from './IConsultaMemoria';
import type { IMetricas } from './IMetricas';


export class MetricasSimulacion implements IMetricas {
  private ocupacionMemoria = 0;
  private utilizacionCpu = 0;
  private cambiosContexto = 0;
  private memoriaLibre = 0;
  private mayorBloqueLibre = 0;
  constructor(memoria: IConsultaMemoria, ticksCpuOcupada: number, ticksTotales: number, cambiosContexto: number) {
    this.establecerOcupacionMemoria((memoria.obtenerMemoriaOcupada() / memoria.obtenerMemoriaTotal()) * 100);
    this.establecerUtilizacionCpu((ticksCpuOcupada / Math.max(ticksTotales, 1)) * 100);
    this.establecerCambiosContexto(cambiosContexto);
    this.establecerMemoriaLibre(memoria.obtenerMemoriaLibre());
    this.establecerMayorBloqueLibre(memoria.obtenerMayorBloqueLibre());
  }

  obtenerOcupacionMemoria(): number { return this.ocupacionMemoria; }
  obtenerUtilizacionCpu(): number { return this.utilizacionCpu; }
  obtenerCambiosContexto(): number { return this.cambiosContexto; }
  obtenerMemoriaLibre(): number { return this.memoriaLibre; }
  obtenerMayorBloqueLibre(): number { return this.mayorBloqueLibre; }

  obtenerFragmentacionExterna(): number {
    const libre = this.obtenerMemoriaLibre();
    return ((libre - this.obtenerMayorBloqueLibre()) / Math.max(libre, 1)) * 100;
  }

  estado(): string {
    const f = (n: number) => n.toFixed(1);
    return `Memoria ${f(this.obtenerOcupacionMemoria())}% | CPU ${f(this.obtenerUtilizacionCpu())}% | Cambios de contexto ${this.obtenerCambiosContexto()} | Fragmentación ${f(this.obtenerFragmentacionExterna())}%`;
  }
  private establecerOcupacionMemoria(porcentaje: number): void { this.ocupacionMemoria = porcentaje; }
  private establecerUtilizacionCpu(porcentaje: number): void { this.utilizacionCpu = porcentaje; }
  private establecerCambiosContexto(cantidad: number): void { this.cambiosContexto = cantidad; }
  private establecerMemoriaLibre(kb: number): void { this.memoriaLibre = kb; }
  private establecerMayorBloqueLibre(kb: number): void { this.mayorBloqueLibre = kb; }
}