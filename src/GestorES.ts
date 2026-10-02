import { EstadoProceso } from './EstadoProceso';
import type { IGestorES, ProcesoBloqueable } from './IGestorES';
import type { IProcesoInfo } from './IProcesoInfo';
import { exigir } from './validaciones';


export class GestorES implements IGestorES {
  private bloqueados: ProcesoBloqueable[] = [];

  agregar(proceso: ProcesoBloqueable): void {
    exigir(proceso.obtenerEstado() === EstadoProceso.BLOQUEADO, `P${proceso.obtenerPid()} no está bloqueado`);
    exigir(!this.obtenerLista().includes(proceso), `P${proceso.obtenerPid()} ya está esperando E/S`);
    this.obtenerLista().push(proceso);
  }

  avanzarTick(): ProcesoBloqueable[] {
    this.obtenerLista().forEach((proceso) => proceso.avanzarBloqueo());
    const listos = this.obtenerLista().filter((proceso) => proceso.esperaTerminada());
    listos.forEach((proceso) => proceso.desbloquear());
    this.establecerLista(this.obtenerLista().filter((proceso) => !listos.includes(proceso)));
    return listos;
  }

  obtenerBloqueados(): ReadonlyArray<IProcesoInfo> { return Object.freeze([...this.obtenerLista()]); }

  estado(): string {
    return `Bloqueados: ${this.obtenerLista().map((p) => `P${p.obtenerPid()}`).join(', ')}`;
  }

  private obtenerLista(): ProcesoBloqueable[] { return this.bloqueados; }
  private establecerLista(lista: ProcesoBloqueable[]): void { this.bloqueados = lista; }
}