import { EstadoProceso, puedeCambiar } from './EstadoProceso';
import type { IProcesoInfo } from './IProcesoInfo';
import type { IProcesoMemoria } from './IProcesoMemoria';
import { exigir, validarEnteroPositivo } from './validaciones';


export class Proceso implements IProcesoInfo, IProcesoMemoria {
  private pid = 0;
  private memoriaRequerida = 0;
  private cpuTotal = 0;
  private cpuRestante = 0;
  private estadoActual = EstadoProceso.NUEVO;

  constructor(pid: number, memoriaRequerida: number, cpuTotal: number) {
    this.establecerPid(pid);
    this.establecerMemoriaRequerida(memoriaRequerida);
    this.establecerCpuTotal(cpuTotal);
    this.establecerCpuRestante(cpuTotal);
  }

  obtenerPid(): number { return this.pid; }
  obtenerMemoriaRequerida(): number { return this.memoriaRequerida; }
  obtenerCpuRestante(): number { return this.cpuRestante; }
  obtenerEstado(): EstadoProceso { return this.estadoActual; }
  haFinalizado(): boolean { return this.obtenerCpuRestante() === 0; }

 
  estado(): string {
    const usada = this.obtenerCpuTotal() - this.obtenerCpuRestante();
    return `P${this.obtenerPid()} ${this.obtenerEstado()} | ${this.obtenerMemoriaRequerida()} KB | CPU ${usada}/${this.obtenerCpuTotal()}`;
  }

  admitir(): void { this.cambiarEstado(EstadoProceso.LISTO); }
  esperarMemoria(): void { this.cambiarEstado(EstadoProceso.ESPERANDO_MEMORIA); }

 
  private cambiarEstado(nuevo: EstadoProceso): void {
    exigir(puedeCambiar(this.obtenerEstado(), nuevo), `P${this.obtenerPid()} no puede pasar de ${this.obtenerEstado()} a ${nuevo}`);
    this.establecerEstado(nuevo);
  }

  private obtenerCpuTotal(): number { return this.cpuTotal; }
  private establecerPid(pid: number): void { validarEnteroPositivo(pid, 'pid'); this.pid = pid; }
  private establecerMemoriaRequerida(kb: number): void { validarEnteroPositivo(kb, 'memoria'); this.memoriaRequerida = kb; }
  private establecerCpuTotal(ticks: number): void { validarEnteroPositivo(ticks, 'cpu'); this.cpuTotal = ticks; }
  private establecerCpuRestante(ticks: number): void { this.cpuRestante = ticks; }
  private establecerEstado(estado: EstadoProceso): void { this.estadoActual = estado; }
}