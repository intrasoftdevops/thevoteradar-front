import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LocalDataService } from '../localData/local-data.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  _URL = environment.apiURL;

  constructor(private http: HttpClient, private localData: LocalDataService) { }

  getHeaders() {
    return { 'Accept': 'application/json', 'Authorization': "Bearer " + this.localData.getToken() };
  }

  login(data: any) {
    return this.http.post(this._URL + "/login", data);
  }

  createGerente(data: any) {
    return this.http.post(this._URL + "/crear-gerente6", data, { headers: this.getHeaders() });
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

  getUser() {
    return this.http.get(this._URL + "/users/" + this.localData.getId(), { headers: this.getHeaders() });
  }

  updateUser(data: any) {
    return this.http.put(this._URL + "/users/" + this.localData.getId(), data, { headers: this.getHeaders() });
  }

  getAssignedMunicipal() {
    return this.http.get(this._URL + "/gerentes-municipio-asignado/" + this.localData.getId(), { headers: this.getHeaders() });
  }

  getMunicipalAdmin() {
    return this.http.get(this._URL + "/municipios-administrador/" + this.localData.getId(), { headers: this.getHeaders() });
  }

  getZoneGerente() {
    return this.http.get(this._URL + "/zonas-gerente/" + this.localData.getId(), { headers: this.getHeaders() });
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
    return this.http.get(this._URL + "/supervisores-zona-asignada/" + this.localData.getId(), { headers: this.getHeaders() });
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
    return this.http.get(this._URL + "/puestos-supervisor/" + this.localData.getId(), { headers: this.getHeaders() });
  }

  createCoordinador(data: any) {
    return this.http.post(this._URL + "/crear-coordinador", data, { headers: this.getHeaders() });
  }

  getCoordinadores() {
    return this.http.get(this._URL + "/coordinadores-puesto-asignado/" + this.localData.getId(), { headers: this.getHeaders() });
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
    return this.http.get(this._URL + "/mesas-coordinador/" + this.localData.getId(), { headers: this.getHeaders() });
  }

  createTestigo(data: any) {
    return this.http.post(this._URL + "/crear-testigo", data, { headers: this.getHeaders() });
  }

  getTestigos() {
    return this.http.get(this._URL + "/testigos-mesa-asignada/" + this.localData.getId(), { headers: this.getHeaders() });
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

  getNecesitadosPuesto(data: any) {
    return this.http.post(this._URL + "/necesitados-por-puesto", data, { headers: this.getHeaders() });
  }

  getCategoriasIncidencias() {
    return this.http.get(this._URL + "/categorias-incidencias", { headers: this.getHeaders() })
  }

  getIncidenciasDeTestigo() {
    return this.http.get(this._URL + "/incidencias-testigo/" + this.localData.getId(), { headers: this.getHeaders() })
  }

  getIncidenciasDeCoordinador() {
    return this.http.get(this._URL + "/incidencias-coordinador", { headers: this.getHeaders() })
  }

  createIncidencias(data: any) {
    return this.http.post(this._URL + "/incidencias", data, { headers: this.getHeaders() });
  }

  replyIncidencia(id: any, data: any) {
    return this.http.put(this._URL + "/responder-incidencia/" + id, data, { headers: this.getHeaders() });
  }

  openIncidencias(id: any, data: any) {
    return this.http.put(this._URL + "/incidencias/" + id, data, { headers: this.getHeaders() });
  }

  createContacto(data: any) {
    return this.http.post(this._URL + "/contactos", data, { headers: this.getHeaders() });
  }

  deleteContacto(id: any) {
    return this.http.delete(this._URL + "/contactos/" + id, { headers: this.getHeaders() });
  }

  updateContacto(id: any, data: any) {
    return this.http.put(this._URL + "/contactos/" + id, data, { headers: this.getHeaders() });
  }

  getContactos() {
    return this.http.get(this._URL + "/contactos-usuario/" + this.localData.getId(), { headers: this.getHeaders() });
  }

  getVotosTestigo() {
    return this.http.get(this._URL + "/mesas-con-sin-reportar", { headers: this.getHeaders() });
  }

  getVotosCoordinador(data: any) {
    return this.http.post(this._URL + "/reportes-coordinador", data, { headers: this.getHeaders() });
  }

  getCandidatos() {
    return this.http.get(this._URL + "/candidato-e-intereses", { headers: this.getHeaders() });
  }

  createVotos(data: any) {
    return this.http.post(this._URL + "/reportes-mesa", data, { headers: this.getHeaders() });
  }

  getInteresesCandidato() {
    return this.http.get(this._URL + "/intereses-de-cliente", { headers: this.getHeaders() });
  }

  getImpugnaciones(data: any) {
    return this.http.post(this._URL + "/get-reportes-revisar", data, { headers: this.getHeaders() });
  }

  impugnar(id: any, data: any) {
    return this.http.put(this._URL + "/impugnar/" + id, data, { headers: this.getHeaders() });
  }

  noImpugnar(id: any, data: any) {
    return this.http.put(this._URL + "/no-impugnar/" + id, data, { headers: this.getHeaders() });
  }

  getCategoriaImpugnacion() {
    return this.http.get(this._URL + "/categorias-impugnacion", { headers: this.getHeaders() });
  }

  changeRole(id: any, data: any) {
    return this.http.post(this._URL + "/cambiar-usuario/" + id, data, { headers: this.getHeaders() });
  }

  getDataGraphics() {
    return this.http.get(this._URL + "/info-usuario", { headers: this.getHeaders() });
  }

  getMesasSinAsignar(data: any) {
    return this.http.post(this._URL + "/mesas-sin-asignar", data, { headers: this.getHeaders() });
  }

  getIdOnlineUser() {
    return this.http.get(this._URL + "/getId", { headers: this.getHeaders() });
  }

  logout() {
    var data: any;
    return this.http.post(this._URL + "/logout", data, { headers: this.getHeaders() });
  }

}
