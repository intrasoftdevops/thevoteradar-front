export class Filtro {
    rol: any;
    cliente: any;
    departamento: any;
    municipio: string;
    zona_votacion: string;
    puesto_votacion: string;
    constructor(cliente:any,rol:any,departamento:any,municipio='',zona_votacion='',puesto_votacion=''){
        this.cliente=cliente
        this.rol=rol
        this.departamento=departamento
        this.municipio=municipio
        this.zona_votacion=zona_votacion
        this.puesto_votacion=puesto_votacion
      }
  }