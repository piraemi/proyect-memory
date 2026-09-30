import type { IBloqueMemoria } from './IBloqueMemoria';
import { exigir, validarEnteroPositivo } from './validaciones';

export class BloqueMemoria implements IBloqueMemoria {
  private inicio = 0;
  private tamanio = 0;
  private pid: number | null = null;

  constructor(inicio: number, tamanio: number, pid: number | null) {
    this.establecerInicio(inicio);
    this.establecerTamanio(tamanio);
    this.establecerPid(pid);
  }

  obtenerInicio(): number { return this.inicio; }
  obtenerTamanio(): number { return this.tamanio; }
  obtenerPid(): number | null { return this.pid; }
  obtenerFin(): number { return this.obtenerInicio() + this.obtenerTamanio(); }
  estaLibre(): boolean { return this.obtenerPid() === null; }

  estado(): string {
    const pid = this.obtenerPid() ?? 'libre';
    return `[${this.obtenerInicio()}-${this.obtenerFin()}) ${this.obtenerTamanio()} KB pid: ${pid}`;
  }

  private establecerInicio(inicio: number): void {
    exigir(Number.isInteger(inicio) && inicio >= 0, `inicio debe ser un entero mayor o igual a 0 (recibido: ${inicio})`);
    this.inicio = inicio;
  }

  private establecerTamanio(tamanio: number): void {
    validarEnteroPositivo(tamanio, 'tamanio');
    this.tamanio = tamanio;
  }

  private establecerPid(pid: number | null): void {
    exigir(pid === null || (Number.isInteger(pid) && pid > 0), `pid debe ser null o un entero positivo (recibido: ${pid})`);
    this.pid = pid;
  }
}