import type { IBloqueMemoria } from './IBloqueMemoria';
import type { IEstrategiaAsignacion } from './IEstrategiaAsignacion';


export abstract class EstrategiaAjuste implements IEstrategiaAsignacion {
  abstract obtenerNombre(): string;

  seleccionarBloque(bloques: ReadonlyArray<IBloqueMemoria>, tamanio: number): IBloqueMemoria | undefined {
    return [...bloques]
      .filter((bloque) => bloque.estaLibre() && bloque.obtenerTamanio() >= tamanio) 
      .sort((a, b) => a.obtenerInicio() - b.obtenerInicio()) 
      .sort((a, b) => this.comparar(a, b))
      .at(0); 
  }

  
  protected abstract comparar(a: IBloqueMemoria, b: IBloqueMemoria): number;
}