import { EstadoProceso, puedeCambiar } from './EstadoProceso';
import type { IEventoES } from './IEventoES';
import type { IProcesoCpu } from './IProcesoCpu';
import type { IProcesoES } from './IProcesoES';
import type { IProcesoInfo } from './IProcesoInfo';
import type { IProcesoMemoria } from './IProcesoMemoria';
import { exigir, validarEnteroPositivo } from './validaciones';

export class Proceso implements IProcesoInfo, IProcesoMemoria, IProcesoCpu, IProcesoES {
  private pid = 0;
  private memoriaRequerida = 0;
  private cpuTotal = 0;
  private cpuRestante = 0;
  private estadoActual = EstadoProceso.NUEVO;
  private quantumUsado = 0;
  private eventoES: IEventoES | null = null;
  private bloqueoRestante = 0;

  constructor(pid: number, memoriaRequerida: number, cpuTotal: number, eventoES: IEventoES | null = null) {
    this.establecerPid(pid);
    this.establecerMemoriaRequerida(memoriaRequerida);
    this.establecerCpuTotal(cpuTotal);
    this.establecerCpuRestante(cpuTotal);
    this.establecerEventoES(eventoES);
  }

  obtenerPid(): number { return this.pid; }
  obtenerMemoriaRequerida(): number { return this.memoriaRequerida; }
  obtenerCpuRestante(): number { return this.cpuRestante; }
  obtenerEstado(): EstadoProceso { return this.estadoActual; }
  haFinalizado(): boolean { return this.obtenerCpuRestante() === 0; }

 
  estado(): string {
    return `P${this.obtenerPid()} ${this.obtenerEstado()} | ${this.obtenerMemoriaRequerida()} KB | CPU ${this.cpuUsada()}/${this.obtenerCpuTotal()}`;
  }

  admitir(): void { this.cambiarEstado(EstadoProceso.LISTO); }
  esperarMemoria(): void { this.cambiarEstado(EstadoProceso.ESPERANDO_MEMORIA); }


  despachar(): void {
    this.cambiarEstado(EstadoProceso.EJECUTANDO);
    this.renovarQuantum();
  }


  ejecutarTick(): void {
    exigir(this.obtenerEstado() === EstadoProceso.EJECUTANDO, `P${this.obtenerPid()} no está ejecutando`);
    exigir(!this.haFinalizado(), `P${this.obtenerPid()} ya terminó su CPU`);
    this.establecerCpuRestante(this.obtenerCpuRestante() - 1);
    this.establecerQuantumUsado(this.obtenerQuantumUsado() + 1);
  }

  agotoQuantum(quantum: number): boolean { return this.obtenerQuantumUsado() >= quantum; }
  renovarQuantum(): void { this.establecerQuantumUsado(0); }
  expropiar(): void { this.cambiarEstado(EstadoProceso.LISTO); }

  terminar(): void {
    exigir(this.haFinalizado(), `P${this.obtenerPid()} todavía tiene CPU por usar`);
    this.cambiarEstado(EstadoProceso.TERMINADO);
  }


  debeBloquearse(): boolean {
    return this.obtenerEventoES()?.obtenerTicksAntesDeBloquear() === this.cpuUsada() && !this.haFinalizado();
  }

  bloquear(): void {
    const evento = this.obtenerEventoES();
    exigir(evento !== null, `P${this.obtenerPid()} no tiene evento de E/S`);
    this.cambiarEstado(EstadoProceso.BLOQUEADO);
    this.establecerBloqueoRestante(evento!.obtenerDuracion());
  }

  avanzarBloqueo(): void {
    exigir(this.obtenerEstado() === EstadoProceso.BLOQUEADO, `P${this.obtenerPid()} no está bloqueado`);
    this.establecerBloqueoRestante(this.obtenerBloqueoRestante() - 1);
  }

  esperaTerminada(): boolean { return this.obtenerBloqueoRestante() === 0; }
  desbloquear(): void { this.cambiarEstado(EstadoProceso.LISTO); }


  private cambiarEstado(nuevo: EstadoProceso): void {
    exigir(puedeCambiar(this.obtenerEstado(), nuevo), `P${this.obtenerPid()} no puede pasar de ${this.obtenerEstado()} a ${nuevo}`);
    this.establecerEstado(nuevo);
  }

  private obtenerCpuTotal(): number { return this.cpuTotal; }
  private obtenerQuantumUsado(): number { return this.quantumUsado; }
  private obtenerEventoES(): IEventoES | null { return this.eventoES; }
  private obtenerBloqueoRestante(): number { return this.bloqueoRestante; }
  private cpuUsada(): number { return this.obtenerCpuTotal() - this.obtenerCpuRestante(); }
  private establecerPid(pid: number): void { validarEnteroPositivo(pid, 'pid'); this.pid = pid; }
  private establecerMemoriaRequerida(kb: number): void { validarEnteroPositivo(kb, 'memoria'); this.memoriaRequerida = kb; }
  private establecerCpuTotal(ticks: number): void { validarEnteroPositivo(ticks, 'cpu'); this.cpuTotal = ticks; }
  private establecerCpuRestante(ticks: number): void { this.cpuRestante = ticks; }
  private establecerEstado(estado: EstadoProceso): void { this.estadoActual = estado; }
  private establecerQuantumUsado(ticks: number): void { this.quantumUsado = ticks; }
  private establecerBloqueoRestante(ticks: number): void { this.bloqueoRestante = ticks; }
  private establecerEventoES(evento: IEventoES | null): void {
    exigir(evento === null || evento.obtenerTicksAntesDeBloquear() < this.obtenerCpuTotal(), 'la E/S tiene que ocurrir antes de que el proceso termine');
    this.eventoES = evento;
  }
}