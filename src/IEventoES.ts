export interface IEventoES {
  obtenerTicksAntesDeBloquear(): number;
  obtenerDuracion(): number;
  estado(): string;
}