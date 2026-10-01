import type { IEventoES } from './IEventoES';
import { validarEnteroPositivo } from './validaciones';
export class EventoES implements IEventoES {
  private ticksAntesDeBloquear = 0;
  private duracion = 0;

  constructor(ticksAntesDeBloquear: number, duracion: number) {
    this.establecerTicksAntesDeBloquear(ticksAntesDeBloquear);
    this.establecerDuracion(duracion);
  }

  obtenerTicksAntesDeBloquear(): number { return this.ticksAntesDeBloquear; }
  obtenerDuracion(): number { return this.duracion; }


  estado(): string {
    return `E/S después de ${this.obtenerTicksAntesDeBloquear()} ticks, dura ${this.obtenerDuracion()}`;
  }

  private establecerTicksAntesDeBloquear(ticks: number): void {
    validarEnteroPositivo(ticks, 'ticksAntesDeBloquear');
    this.ticksAntesDeBloquear = ticks;
  }

  private establecerDuracion(duracion: number): void {
    validarEnteroPositivo(duracion, 'duracion');
    this.duracion = duracion;
  }
}