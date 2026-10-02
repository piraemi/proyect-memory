import type { IAsignadorMemoria } from './IAsignadorMemoria';
import type { IConsultaMemoria } from './IConsultaMemoria';
import type { IEventoES } from './IEventoES';
import type { IGestorES } from './IGestorES';
import type { IPlanificador } from './IPlanificador';
import type { IProcesoInfo } from './IProcesoInfo';
import { Proceso } from './Proceso';
import { exigir } from './validaciones';

type Memoria = IAsignadorMemoria & IConsultaMemoria;

export class Simulador {
  private tick = 0;
  private procesos: Proceso[] = [];
  private memoria!: Memoria;
  private planificador!: IPlanificador;
  private gestorES!: IGestorES;

  constructor(memoria: Memoria, planificador: IPlanificador, gestorES: IGestorES) {
    this.establecerMemoria(memoria);
    this.establecerPlanificador(planificador);
    this.establecerGestorES(gestorES);
  }

  registrarProceso(pid: number, memoria: number, cpu: number, eventoES: IEventoES | null = null): void {
    exigir(this.buscar(pid) === undefined, `ya existe un proceso con pid ${pid}`);
    exigir(memoria <= this.obtenerMemoria().obtenerMemoriaTotal(), `P${pid} pide más memoria que la total`);
    this.obtenerListaProcesos().push(new Proceso(pid, memoria, cpu, eventoES));
  }

  obtenerTick(): number { return this.tick; }
  obtenerProcesos(): ReadonlyArray<IProcesoInfo> { return Object.freeze([...this.obtenerListaProcesos()]); }

  estado(): string {
    const procesos = this.obtenerListaProcesos().map((p) => p.estado());
    const partes = [`Tick ${this.obtenerTick()}`, this.obtenerPlanificador().estado(), this.obtenerGestorES().estado()];
    return [...partes, ...procesos, this.obtenerMemoria().estado()].join('\n');
  }

  private buscar(pid: number): Proceso | undefined { return this.obtenerListaProcesos().find((p) => p.obtenerPid() === pid); }
  private obtenerListaProcesos(): Proceso[] { return this.procesos; }
  private obtenerMemoria(): Memoria { return this.memoria; }
  private obtenerPlanificador(): IPlanificador { return this.planificador; }
  private obtenerGestorES(): IGestorES { return this.gestorES; }
  private establecerMemoria(memoria: Memoria): void { this.memoria = memoria; }
  private establecerPlanificador(planificador: IPlanificador): void { this.planificador = planificador; }
  private establecerGestorES(gestorES: IGestorES): void { this.gestorES = gestorES; }
}