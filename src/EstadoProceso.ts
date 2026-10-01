export enum EstadoProceso {
  NUEVO = 'NUEVO',
  ESPERANDO_MEMORIA = 'ESPERANDO_MEMORIA',
  LISTO = 'LISTO',
  EJECUTANDO = 'EJECUTANDO',
  BLOQUEADO = 'BLOQUEADO',
  TERMINADO = 'TERMINADO',
}


const TRANSICIONES: Record<EstadoProceso, EstadoProceso[]> = {
  NUEVO: [EstadoProceso.ESPERANDO_MEMORIA, EstadoProceso.LISTO],
  ESPERANDO_MEMORIA: [EstadoProceso.ESPERANDO_MEMORIA, EstadoProceso.LISTO],
  LISTO: [EstadoProceso.EJECUTANDO],
  EJECUTANDO: [EstadoProceso.LISTO, EstadoProceso.BLOQUEADO, EstadoProceso.TERMINADO],
  BLOQUEADO: [EstadoProceso.LISTO],
  TERMINADO: [],
};


export function puedeCambiar(desde: EstadoProceso, hacia: EstadoProceso): boolean {
  return TRANSICIONES[desde].includes(hacia);
}
