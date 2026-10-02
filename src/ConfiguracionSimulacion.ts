import type { IConfiguracion } from './IConfiguracion';
import type { IEstrategiaAsignacion } from './IEstrategiaAsignacion';
import { validarEnteroPositivo } from './validaciones';

export class ConfiguracionSimulacion implements IConfiguracion {
  private memoriaTotal = 0;
  private quantum = 0;
  private estrategia!: IEstrategiaAsignacion;

  constructor(memoriaTotal: number, quantum: number, estrategia: IEstrategiaAsignacion) {
    this.establecerMemoriaTotal(memoriaTotal);
    this.establecerQuantum(quantum);
    this.establecerEstrategia(estrategia);
  }

  obtenerMemoriaTotal(): number { return this.memoriaTotal; }
  obtenerQuantum(): number { return this.quantum; }
  obtenerEstrategia(): IEstrategiaAsignacion { return this.estrategia; }

  estado(): string {
    return `${this.obtenerMemoriaTotal()} KB | quantum ${this.obtenerQuantum()} | ${this.obtenerEstrategia().obtenerNombre()}`;
  }

  private establecerMemoriaTotal(kb: number): void { validarEnteroPositivo(kb, 'memoriaTotal'); this.memoriaTotal = kb; }
  private establecerQuantum(ticks: number): void { validarEnteroPositivo(ticks, 'quantum'); this.quantum = ticks; }
  private establecerEstrategia(estrategia: IEstrategiaAsignacion): void { this.estrategia = estrategia; }
}