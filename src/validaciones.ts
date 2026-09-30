export function validarEnteroPositivo(valor: number, nombre: string): void {
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new RangeError(`${nombre} debe ser un entero positivo (recibido: ${valor})`);
  }
}
