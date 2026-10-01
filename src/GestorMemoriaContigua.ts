import { BloqueMemoria } from './BloqueMemoria';
import type { IAsignadorMemoria } from './IAsignadorMemoria';
import type { IBloqueMemoria } from './IBloqueMemoria';
import type { IConsultaMemoria } from './IConsultaMemoria';
import type { IEstrategiaAsignacion } from './IEstrategiaAsignacion';
import { exigir, validarEnteroPositivo } from './validaciones';


export class GestorMemoriaContigua implements IAsignadorMemoria, IConsultaMemoria {
  private memoriaTotal = 0;
  private estrategia!: IEstrategiaAsignacion;
  private bloques: BloqueMemoria[] = [];

  constructor(memoriaTotal: number, estrategia: IEstrategiaAsignacion) {
    this.establecerMemoriaTotal(memoriaTotal);
    this.establecerEstrategia(estrategia);
    this.establecerBloques([new BloqueMemoria(0, memoriaTotal, null)]);
  }

  asignar(pid: number, tamanio: number): boolean {
    validarEnteroPositivo(pid, 'pid');
    validarEnteroPositivo(tamanio, 'tamanio');
    exigir(this.bloqueDe(pid) === undefined, `El proceso ${pid} ya tiene memoria asignada`);
    const elegido = this.obtenerEstrategia().seleccionarBloque(this.obtenerBloques(), tamanio);
    return elegido !== undefined && this.ocupar(pid, elegido.obtenerInicio(), tamanio);
  }

  liberar(pid: number): void {
    exigir(this.bloqueDe(pid) !== undefined, `El proceso ${pid} no tiene memoria asignada`);
    this.reconstruir(this.bloquesOcupados().filter((bloque) => bloque.obtenerPid() !== pid));
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

  private ocupar(pid: number, inicio: number, tamanio: number): boolean {
    this.reconstruir([...this.bloquesOcupados(), new BloqueMemoria(inicio, tamanio, pid)]);
    return true;
  }

  
  private reconstruir(ocupados: BloqueMemoria[]): void {
    const ordenados = [...ocupados].sort((a, b) => a.obtenerInicio() - b.obtenerInicio());
    const desde = [0, ...ordenados.map((bloque) => bloque.obtenerFin())];
    const hasta = [...ordenados.map((bloque) => bloque.obtenerInicio()), this.obtenerMemoriaTotal()];
    const huecos = hasta
      .map((fin, i) => ({ inicio: desde[i]!, tamanio: fin - desde[i]! }))
      .filter((hueco) => hueco.tamanio > 0)
      .map((hueco) => new BloqueMemoria(hueco.inicio, hueco.tamanio, null));
    this.establecerBloques([...ordenados, ...huecos].sort((a, b) => a.obtenerInicio() - b.obtenerInicio()));
  }

  private bloqueDe(pid: number): BloqueMemoria | undefined {
    return this.obtenerBloques().find((bloque) => bloque.obtenerPid() === pid);
  }
  private bloquesOcupados(): BloqueMemoria[] { return this.obtenerBloques().filter((b) => !b.estaLibre()); }
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