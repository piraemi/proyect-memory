import type { IPlanificador, ProcesoPlanificable, ResultadoTick } from './IPlanificador';
import type { IProcesoInfo } from './IProcesoInfo';
import { exigir, validarEnteroPositivo } from './validaciones';

const CPU_LIBRE: ResultadoTick = { proceso: null, termino: false, seBloqueo: false, cambioContexto: false };

export class PlanificadorRoundRobin implements IPlanificador {
  private quantum = 0;
  private colaListos: ProcesoPlanificable[] = [];
  private enEjecucion: ProcesoPlanificable | null = null;

  constructor(quantum: number) {
    this.establecerQuantum(quantum);
  }

  encolar(proceso: ProcesoPlanificable): void {
    exigir(!this.obtenerCola().includes(proceso), `P${proceso.obtenerPid()} ya está en la cola`);
    this.obtenerCola().push(proceso);
  }


  ejecutarTick(): ResultadoTick {
    const proceso = this.obtenerEnEjecucionInterno() ?? this.despacharSiguiente();
    return (proceso && this.ejecutar(proceso)) ?? CPU_LIBRE;
  }

  obtenerEnEjecucion(): IProcesoInfo | null { return this.obtenerEnEjecucionInterno(); }
  obtenerListos(): ReadonlyArray<IProcesoInfo> { return Object.freeze([...this.obtenerCola()]); }


  estado(): string {
    const enCpu = this.obtenerEnEjecucion();
    const cpu = (enCpu && `P${enCpu.obtenerPid()}`) ?? 'libre';
    const listos = this.obtenerCola().map((p) => `P${p.obtenerPid()}`).join(', ');
    return `Round Robin (Q=${this.obtenerQuantum()}) | CPU: ${cpu} | Listos: ${listos}`;
  }

  private ejecutar(proceso: ProcesoPlanificable): ResultadoTick {
    proceso.ejecutarTick();
    const termino = proceso.haFinalizado();
    const seBloqueo = !termino && proceso.debeBloquearse();
    const agotoQuantum = !termino && !seBloqueo && proceso.agotoQuantum(this.obtenerQuantum());
    const hayOtros = this.obtenerCola().length > 0;
    const expropiado = agotoQuantum && hayOtros;

    termino && proceso.terminar();
    seBloqueo && proceso.bloquear();
    expropiado && this.expropiar(proceso);
    agotoQuantum && !hayOtros && proceso.renovarQuantum(); 
    (termino || seBloqueo || expropiado) && this.establecerEnEjecucion(null);

    return { proceso, termino, seBloqueo, cambioContexto: seBloqueo || expropiado };
  }

  private despacharSiguiente(): ProcesoPlanificable | null {
    const siguiente = this.obtenerCola().shift() ?? null;
    siguiente?.despachar();
    this.establecerEnEjecucion(siguiente);
    return siguiente;
  }

  private expropiar(proceso: ProcesoPlanificable): void {
    proceso.expropiar();
    this.obtenerCola().push(proceso); 
  }

  private obtenerQuantum(): number { return this.quantum; }
  private obtenerCola(): ProcesoPlanificable[] { return this.colaListos; }
  private obtenerEnEjecucionInterno(): ProcesoPlanificable | null { return this.enEjecucion; }
  private establecerQuantum(quantum: number): void { validarEnteroPositivo(quantum, 'quantum'); this.quantum = quantum; }
  private establecerEnEjecucion(proceso: ProcesoPlanificable | null): void { this.enEjecucion = proceso; }
}