import { BloqueMemoria } from './BloqueMemoria';
import type { IBloqueMemoria } from './IBloqueMemoria';
import type { IConsultaMemoria } from './IConsultaMemoria';
import type { IEstrategiaAsignacion } from './IEstrategiaAsignacion';
import { validarEnteroPositivo } from './validaciones';


export class GestorMemoriaContigua implements IConsultaMemoria {
  private memoriaTotal = 0;
  private estrategia!: IEstrategiaAsignacion;
  private bloques: BloqueMemoria[] = [];

  constructor(memoriaTotal: number, estrategia: IEstrategiaAsignacion) {
    this.establecerMemoriaTotal(memoriaTotal);
    this.establecerEstrategia(estrategia);
    this.establecerBloques([new BloqueMemoria(0, memoriaTotal, null)]);
  }

 
  obtenerMemoriaTotal(): number { return this.memoriaTotal; }

  obtenerMemoriaLibre(): number {
    return this.bloquesLibres().reduce((suma, bloque) => suma + bloque.obtenerTamanio(), 0);
  }
  obtenerMemoriaOcupada(): number { return this.obtenerMemoriaTotal() - this.obtenerMemoriaLibre(); }
  obtenerMayorBloqueLibre(): number {
    return Math.max(0, ...this.bloquesLibres().map((bloque) => bloque.obtenerTamanio()));
  }

  obtenerMapa(): ReadonlyArray<IBloqueMemoria> { return Object.freeze([...this.obtenerBloques()]); }

  
  estado(): string {
    const titulo = `Memoria ${this.obtenerMemoriaTotal()} KB (${this.obtenerEstrategia().obtenerNombre()})`;
    return [titulo, ...this.obtenerBloques().map((bloque) => bloque.estado())].join('\n');
  }

  private bloquesLibres(): BloqueMemoria[] { return this.obtenerBloques().filter((b) => b.estaLibre()); }
  private obtenerEstrategia(): IEstrategiaAsignacion { return this.estrategia; }
  private obtenerBloques(): BloqueMemoria[] { return this.bloques; }

  private establecerMemoriaTotal(memoriaTotal: number): void {
    validarEnteroPositivo(memoriaTotal, 'memoriaTotal');
    this.memoriaTotal = memoriaTotal;
  }
  private establecerEstrategia(estrategia: IEstrategiaAsignacion): void { this.estrategia = estrategia; }
  private establecerBloques(bloques: BloqueMemoria[]): void { this.bloques = bloques; }
}