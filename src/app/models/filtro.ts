export class Filtro {
    rol: any;
    cliente: any;
    departamento: any;
    municipio: any;
    zona_votacion: any;
    puesto_votacion: any;
    constructor(cliente: any, rol: any, departamento: any, municipio = [''], zona_votacion = [''], puesto_votacion = ['']) {
        this.cliente = cliente
        this.rol = rol
        this.departamento = this.generar_numero(departamento)
        this.municipio = this.generar_linea(municipio)
        this.zona_votacion = this.generar_linea(zona_votacion)
        this.puesto_votacion = this.generar_linea(puesto_votacion)
    }

    generar_filtro() {
        let aux = ''
        switch (this.rol) {
            case 1:
                aux = this.filtro_administrador()
                break;
            case 2:
                aux = this.filtro_gerente()
                break
            case 3:
                aux = this.filtro_supervisor()
                break
            case 4:
                aux = this.filtro_coordinador()
                break
            default:
                aux = ''
                break;
        }
        return aux;
    }

    filtro_administrador() {
        return `&filter=candidatos/id eq ${this.cliente} and roles/id eq ${this.rol} and departamentos_votacion/codigo_unico in (${this.departamento})`
    }
    filtro_gerente() {
        return `&filter=candidatos/id eq ${this.cliente} and roles/id eq ${this.rol} and departamentos_votacion/codigo_unico in (${this.departamento}) and municipios_votacion/codigo_unico in (${this.municipio})`
    }
    filtro_supervisor() {
        return `&filter=candidatos/id eq ${this.cliente} and roles/id eq ${this.rol} and departamentos_votacion/codigo_unico in (${this.departamento}) and municipios_votacion/codigo_unico in (${this.municipio}) and zonas_votacion/codigo_unico in (${this.zona_votacion})`
    }
    filtro_coordinador() {
        return `&filter=candidatos/id eq ${this.cliente} and roles/id eq ${this.rol} and departamentos_votacion/codigo_unico in (${this.departamento}) and municipios_votacion/codigo_unico in (${this.municipio}) and zonas_votacion/codigo_unico in (${this.zona_votacion}) and puestos_votacion/codigo_unico in (${this.puesto_votacion})`
    }

    generar_linea(elemento: any) {
        let aux = ``
        if (elemento.length == 1) { aux = `'${elemento[0]}'` }
        else {
            elemento.forEach((e: any, i: any) => {
                if (i == elemento.length - 1)
                    aux += `'${e}'`
                else
                    aux += `'${e}',`
            })
        }
        return aux
    }

    generar_numero(elemento: any) {
        let numberArray = [];
        for (var i = 0; i < elemento.length; i++) {
            numberArray.push(parseInt(elemento[i]));
        }
        return numberArray;
    }

}