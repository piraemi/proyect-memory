export interface IProcesoES {
  debeBloquearse(): boolean;
  bloquear(): void;
  avanzarBloqueo(): void;
  esperaTerminada(): boolean;
  desbloquear(): void;
}