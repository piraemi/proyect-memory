import { EstadoProceso } from './EstadoProceso';
import { GestorES } from './GestorES';
import { GestorMemoriaContigua } from './GestorMemoriaContigua';
import type { IAsignadorMemoria } from './IAsignadorMemoria';
import type { IConfiguracion } from './IConfiguracion';
import type { IConsultaMemoria } from './IConsultaMemoria';
import type { IEventoES } from './IEventoES';
import type { IGestorES } from './IGestorES';
import type { IMetricas } from './IMetricas';
import type { IPlanificador } from './IPlanificador';
import type { IProcesoInfo } from './IProcesoInfo';
import type { IConsultaSimulador, ISimulador } from './ISimulador';
import { MetricasSimulacion } from './MetricasSimulacion';
import { PlanificadorRoundRobin } from './PlanificadorRoundRobin';
import { Proceso } from './Proceso';
import { exigir } from './validaciones';

type Memoria = IAsignadorMemoria & IConsultaMemoria;

export class Simulador implements ISimulador, IConsultaSimulador {
  private tick = 0;
  private ticksCpuOcupada = 0;
  private cambiosContexto = 0;
  private procesos: Proceso[] = [];
  private historialCpu: (number | null)[] = [];
  private memoria!: Memoria;
  private planificador!: IPlanificador;
  private gestorES!: IGestorES;

  constructor(memoria: Memoria, planificador: IPlanificador, gestorES: IGestorES) {
    this.establecerMemoria(memoria);
    this.establecerPlanificador(planificador);
    this.establecerGestorES(gestorES);
  }

  static crear(config: IConfiguracion): Simulador {
    const memoria = new GestorMemoriaContigua(config.obtenerMemoriaTotal(), config.obtenerEstrategia());
    return new Simulador(memoria, new PlanificadorRoundRobin(config.obtenerQuantum()), new GestorES());
  }

  registrarProceso(pid: number, memoria: number, cpu: number, eventoES: IEventoES | null = null): void {
    exigir(this.buscar(pid) === undefined, `ya existe un proceso con pid ${pid}`);
    exigir(memoria <= this.obtenerMemoria().obtenerMemoriaTotal(), `P${pid} pide más memoria que la total`);
    this.obtenerListaProcesos().push(new Proceso(pid, memoria, cpu, eventoES));
  }

  avanzarTick(): void {
    this.faseAdmision();
    this.faseBloqueados();
    this.faseCpu();
    this.establecerTick(this.obtenerTick() + 1);
  }

  obtenerTick(): number { return this.tick; }
  obtenerProcesos(): ReadonlyArray<IProcesoInfo> { return Object.freeze([...this.obtenerListaProcesos()]); }
  obtenerHistorialCpu(): ReadonlyArray<number | null> { return Object.freeze([...this.obtenerHistorial()]); }
  obtenerMetricas(): IMetricas {
    return new MetricasSimulacion(this.obtenerMemoria(), this.obtenerTicksCpuOcupada(), this.obtenerTick(), this.obtenerCambiosContexto());
  }

  estado(): string {
    const procesos = this.obtenerListaProcesos().map((p) => p.estado());
    const partes = [`Tick ${this.obtenerTick()}`, this.obtenerPlanificador().estado(), this.obtenerGestorES().estado()];
    return [...partes, ...procesos, this.obtenerMemoria().estado(), this.obtenerMetricas().estado()].join('\n');
  }

  private faseAdmision(): void {
    this.pendientesDeMemoria().forEach((proceso) => {
      const entro = this.obtenerMemoria().asignar(proceso.obtenerPid(), proceso.obtenerMemoriaRequerida());
      entro && proceso.admitir();
      entro && this.obtenerPlanificador().encolar(proceso);
      entro || proceso.esperarMemoria();
    });
  }

  private faseBloqueados(): void {
    this.obtenerGestorES().avanzarTick()
      .forEach((p) => this.obtenerPlanificador().encolar(this.buscar(p.obtenerPid())!));
  }

  private faseCpu(): void {
    const resultado = this.obtenerPlanificador().ejecutarTick();
    resultado.termino && this.obtenerMemoria().liberar(resultado.proceso!.obtenerPid());
    resultado.seBloqueo && this.obtenerGestorES().agregar(resultado.proceso!);
    this.obtenerHistorial().push(resultado.proceso?.obtenerPid() ?? null);
    this.establecerTicksCpuOcupada(this.obtenerTicksCpuOcupada() + Number(resultado.proceso !== null));
    this.establecerCambiosContexto(this.obtenerCambiosContexto() + Number(resultado.cambioContexto));
  }

  private pendientesDeMemoria(): Proceso[] {
    const esperando = [EstadoProceso.NUEVO, EstadoProceso.ESPERANDO_MEMORIA];
    return this.obtenerListaProcesos().filter((p) => esperando.includes(p.obtenerEstado()));
  }

  private buscar(pid: number): Proceso | undefined { return this.obtenerListaProcesos().find((p) => p.obtenerPid() === pid); }
  private obtenerListaProcesos(): Proceso[] { return this.procesos; }
  private obtenerHistorial(): (number | null)[] { return this.historialCpu; }
  private obtenerTicksCpuOcupada(): number { return this.ticksCpuOcupada; }
  private obtenerCambiosContexto(): number { return this.cambiosContexto; }
  private obtenerMemoria(): Memoria { return this.memoria; }
  private obtenerPlanificador(): IPlanificador { return this.planificador; }
  private obtenerGestorES(): IGestorES { return this.gestorES; }
  private establecerTick(tick: number): void { this.tick = tick; }
  private establecerTicksCpuOcupada(ticks: number): void { this.ticksCpuOcupada = ticks; }
  private establecerCambiosContexto(cantidad: number): void { this.cambiosContexto = cantidad; }
  private establecerMemoria(memoria: Memoria): void { this.memoria = memoria; }
  private establecerPlanificador(planificador: IPlanificador): void { this.planificador = planificador; }
  private establecerGestorES(gestorES: IGestorES): void { this.gestorES = gestorES; }
}