export function exigir(condicion: boolean, mensaje: string): void {
  condicion || lanzarError(mensaje);
}

function lanzarError(mensaje: string): never {
  throw new RangeError(mensaje);
}


export function validarEnteroPositivo(valor: number, nombre: string): void {
  exigir(Number.isInteger(valor) && valor > 0, `${nombre} debe ser un entero positivo (recibido: ${valor})`);
}
