import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevDataService {

  constructor() { }

  isDevelopmentMode(): boolean {
    return environment.development;
  }

  getDepartments() {
    return [
      { codigo_unico: '05', nombre: 'Antioquia' },
      { codigo_unico: '08', nombre: 'Atlántico' },
      { codigo_unico: '11', nombre: 'Bogotá D.C.' },
      { codigo_unico: '15', nombre: 'Boyacá' },
      { codigo_unico: '17', nombre: 'Caldas' }
    ];
  }

  getMunicipals() {
    return [
      { codigo_unico: '05001', nombre: 'Medellín', codigo_departamento_votacion: '05' },
      { codigo_unico: '08001', nombre: 'Barranquilla', codigo_departamento_votacion: '08' },
      { codigo_unico: '11001', nombre: 'Bogotá', codigo_departamento_votacion: '11' },
      { codigo_unico: '15001', nombre: 'Tunja', codigo_departamento_votacion: '15' },
      { codigo_unico: '17001', nombre: 'Manizales', codigo_departamento_votacion: '17' }
    ];
  }

  getZones() {
    return [
      { codigo_unico: '05001001', nombre: 'Zona Centro' },
      { codigo_unico: '05001002', nombre: 'Zona Norte' },
      { codigo_unico: '05001003', nombre: 'Zona Sur' },
      { codigo_unico: '08001001', nombre: 'Zona Centro' },
      { codigo_unico: '08001002', nombre: 'Zona Norte' }
    ];
  }

  getStations() {
    return [
      { codigo_unico: '05001001001', nombre: 'Puesto Centro 1' },
      { codigo_unico: '05001001002', nombre: 'Puesto Centro 2' },
      { codigo_unico: '05001001003', nombre: 'Puesto Norte 1' },
      { codigo_unico: '08001001001', nombre: 'Puesto Centro 1' },
      { codigo_unico: '08001001002', nombre: 'Puesto Norte 1' }
    ];
  }

  getIncidentCategories() {
    return [
      { id: 1, nombre: 'Problemas de conectividad' },
      { id: 2, nombre: 'Fallas en equipos' },
      { id: 3, nombre: 'Problemas de acceso' },
      { id: 4, nombre: 'Interrupciones de servicio' },
      { id: 5, nombre: 'Otros' }
    ];
  }

  getAssignedTables() {
    return [
      { codigo_mesa: 'M001', nombre: 'Mesa 1 - Centro' },
      { codigo_mesa: 'M002', nombre: 'Mesa 2 - Norte' },
      { codigo_mesa: 'M003', nombre: 'Mesa 3 - Sur' },
      { codigo_mesa: 'M004', nombre: 'Mesa 4 - Este' },
      { codigo_mesa: 'M005', nombre: 'Mesa 5 - Oeste' }
    ];
  }

  getCandidates() {
    return [
      { id: 1, nombre: 'Candidato A', partido: 'Partido X' },
      { id: 2, nombre: 'Candidato B', partido: 'Partido Y' },
      { id: 3, nombre: 'Candidato C', partido: 'Partido Z' },
      { id: 4, nombre: 'Candidato D', partido: 'Partido W' }
    ];
  }

  getIncidents() {
    return [
      {
        id: 1,
        categoria: 'Problemas de conectividad',
        descripcion: 'No hay internet en la mesa',
        codigo_mesa: 'M001',
        fecha: '2024-01-15',
        estado: 'Pendiente',
        archivos: []
      },
      {
        id: 2,
        categoria: 'Fallas en equipos',
        descripcion: 'La computadora no enciende',
        codigo_mesa: 'M002',
        fecha: '2024-01-14',
        estado: 'Resuelto',
        archivos: []
      },
      {
        id: 3,
        categoria: 'Problemas de acceso',
        descripcion: 'No se puede acceder al sistema',
        codigo_mesa: 'M003',
        fecha: '2024-01-13',
        estado: 'En proceso',
        archivos: []
      }
    ];
  }

  getVotes() {
    return [
      {
        id: 1,
        candidato: 'Candidato A',
        partido: 'Partido X',
        votos: 150,
        codigo_mesa: 'M001',
        fecha: '2024-01-15'
      },
      {
        id: 2,
        candidato: 'Candidato B',
        partido: 'Partido Y',
        votos: 120,
        codigo_mesa: 'M001',
        fecha: '2024-01-15'
      },
      {
        id: 3,
        candidato: 'Candidato C',
        partido: 'Partido Z',
        votos: 80,
        codigo_mesa: 'M001',
        fecha: '2024-01-15'
      }
    ];
  }

  getTeamStatistics() {
    return {
      gerentes: {
        gerentes_con_municipio: 8,
        gerentes_sin_municipio: 2,
        cantidad_gerentes_necesitados: 10
      },
      supervisores: {
        supervisores_con_zona: 15,
        supervisores_sin_zona: 5,
        cantidad_supervisores_necesitados: 20
      },
      coordinadores: {
        coordinadores_con_puesto: 25,
        coordinadores_sin_puesto: 5,
        cantidad_coordinadores_necesitados: 30
      },
      testigos: {
        testigos_con_mesa: 45,
        testigos_sin_mesa: 5,
        cantidad_testigos_necesitados: 50
      }
    };
  }

  getUsers() {
    return [
      { id: 1, nombre: 'Juan Pérez', rol: 'Gerente', departamento: 'Antioquia' },
      { id: 2, nombre: 'María García', rol: 'Supervisor', zona: 'Centro' },
      { id: 3, nombre: 'Carlos López', rol: 'Coordinador', puesto: 'Puesto Centro 1' },
      { id: 4, nombre: 'Ana Rodríguez', rol: 'Testigo', mesa: 'M001' }
    ];
  }
}
