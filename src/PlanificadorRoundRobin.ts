import type { ProcesoPlanificable } from './IPlanificador';
import type { IProcesoInfo } from './IProcesoInfo';
import { exigir, validarEnteroPositivo } from './validaciones';


export class PlanificadorRoundRobin {
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

  obtenerEnEjecucion(): IProcesoInfo | null { return this.obtenerEnEjecucionInterno(); }
  obtenerListos(): ReadonlyArray<IProcesoInfo> { return Object.freeze([...this.obtenerCola()]); }

  
  estado(): string {
    const enCpu = this.obtenerEnEjecucion();
    const cpu = (enCpu && `P${enCpu.obtenerPid()}`) ?? 'libre';
    const listos = this.obtenerCola().map((p) => `P${p.obtenerPid()}`).join(', ');
    return `Round Robin (Q=${this.obtenerQuantum()}) | CPU: ${cpu} | Listos: ${listos}`;
  }

  private obtenerQuantum(): number { return this.quantum; }
  private obtenerCola(): ProcesoPlanificable[] { return this.colaListos; }
  private obtenerEnEjecucionInterno(): ProcesoPlanificable | null { return this.enEjecucion; }
  private establecerQuantum(quantum: number): void { validarEnteroPositivo(quantum, 'quantum'); this.quantum = quantum; }
}