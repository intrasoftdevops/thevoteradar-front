import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  _URL = "http://54.219.225.56/api";

  constructor(private http: HttpClient) {
  }

  login(data: any) {
    return this.http.post(this._URL + "/login", data);
  }

  createGerente(data: any) {
    return this.http.post(this._URL + "/crear-gerente", data, { headers: this.getHeaders() });
  }

  getGerente(id: any) {
    return this.http.get(this._URL + "/get-gerente/" + id, { headers: this.getHeaders() });
  }

  updateGerente(id: any, data: any) {
    return this.http.put(this._URL + "/editar-gerente/" + id, data, { headers: this.getHeaders() });
  }

  getUsers() {
    return this.http.get(this._URL + "/users", { headers: this.getHeaders() });
  }

  getAssignedMunicipal() {
    return this.http.get(this._URL + "/gerentes-municipio-asignado/" + this.getId(), { headers: this.getHeaders() });
  }

  getMunicipalAdmin() {
    return this.http.get(this._URL + "/municipios-administrador/" + this.getId(), { headers: this.getHeaders() });
  }

  getZoneGerente() {
    return this.http.get(this._URL + "/zonas-gerente/" + this.getId(), { headers: this.getHeaders() });
  }

  getDepartmentAdmin() {
    return this.http.get(this._URL + "/get-departamentos-administrador", { headers: this.getHeaders() });
  }

  createSupervisor(data: any) {
    return this.http.post(this._URL + "/crear-supervisor", data, { headers: this.getHeaders() });
  }

  getMunicipalGerente() {
    return this.http.get(this._URL + "/get-municipios-gerente", { headers: this.getHeaders() });
  }

  getSupervisores() {
    return this.http.get(this._URL + "/supervisores-zona-asignada/" + this.getId(), { headers: this.getHeaders() });
  }

  getSupervisor(id: any) {
    return this.http.get(this._URL + "/get-supervisor/" + id, { headers: this.getHeaders() });
  }

  updateSupervisor(id: any, data: any) {
    return this.http.put(this._URL + "/editar-supervisor/" + id, data, { headers: this.getHeaders() });
  }

  getZonesSupervisor() {
    return this.http.get(this._URL + "/get-zonas-supervisor", { headers: this.getHeaders() });
  }

  getStationsCoordinador() {
    return this.http.get(this._URL + "/puestos-supervisor/" + this.getId(), { headers: this.getHeaders() });
  }

  createCoordinador(data: any) {
    return this.http.post(this._URL + "/crear-coordinador", data, { headers: this.getHeaders() });
  }

  getCoordinadores() {
    return this.http.get(this._URL + "/coordinadores-puesto-asignado/" + this.getId(), { headers: this.getHeaders() });
  }

  getCoordinador(id: any) {
    return this.http.get(this._URL + "/get-coordinador/" + id, { headers: this.getHeaders() });
  }

  updateCoordinador(id: any, data: any) {
    return this.http.put(this._URL + "/editar-coordinador/" + id, data, { headers: this.getHeaders() });
  }

  getStationsTestigo() {
    return this.http.get(this._URL + "/get-puestos-coordinador/", { headers: this.getHeaders() });
  }

  getTablesTestigo() {
    return this.http.get(this._URL + "/mesas-coordinador/" + this.getId(), { headers: this.getHeaders() });
  }

  createTestigo(data: any) {
    return this.http.post(this._URL + "/crear-testigo", data, { headers: this.getHeaders() });
  }

  getTestigos() {
    return this.http.get(this._URL + "/testigos-mesa-asignada/" + this.getId(), { headers: this.getHeaders() });
  }

  getTestigo(id: any) {
    return this.http.get(this._URL + "/get-testigo/" + id, { headers: this.getHeaders() });
  }

  updateTestigo(id: any, data: any) {
    return this.http.put(this._URL + "/editar-testigo/" + id, data, { headers: this.getHeaders() });
  }

  getZonasyGerentes(data: any) {
    return this.http.post(this._URL + "/get_zonas_y_gerentes_municipio", data, { headers: this.getHeaders() });
  }

  getPuestosySupervisores(data: any) {
    return this.http.post(this._URL + "/get_puestos_y_supervisores_zona", data, { headers: this.getHeaders() });
  }

  getMesasyCoordinadores(data: any) {
    return this.http.post(this._URL + "/get_mesas_y_coordinadores_puesto", data, { headers: this.getHeaders() });
  }

  getTestigoMesa(data: any) {
    return this.http.post(this._URL + "/get_testigos_mesa", data, { headers: this.getHeaders() });
  }

  getNecesitadosDepartamento(data: any) {
    return this.http.post(this._URL + "/necesitados-por-departamento", data, { headers: this.getHeaders() });
  }

  getNecesitadosMunicipio(data: any) {
    return this.http.post(this._URL + "/necesitados-por-municipio", data, { headers: this.getHeaders() });
  }

  getNecesitadosZona(data: any) {
    return this.http.post(this._URL + "/necesitados-por-zona", data, { headers: this.getHeaders() });
  }

  getCategoriasIncidencias() {
    return this.http.get(this._URL + "/categorias-incidencias", { headers: this.getHeaders()})
  }


  getIncidenciasDeTestigo(data: any) {
    return this.http.get(this._URL + "/incidencias-testigo/" + data, { headers: this.getHeaders()})
  }

  logout() {
    var data: any;
    console.log(this.getHeaders());
    return this.http.post(this._URL + "/logout", data, { headers: this.getHeaders() });
  }

  deleteCookies() {
    localStorage.clear();
  }

  getHeaders() {
    return { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() };
  }

  setToken(token: any) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setRol(rol: any) {
    localStorage.setItem('rol', rol);
  }

  getRol() {
    return localStorage.getItem('rol');
  }

  setId(id: any) {
    localStorage.setItem('id', id);
  }

  getId() {
    return localStorage.getItem('id');
  }

}
