import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  _URL = "http://54.219.225.56/api";

  constructor(private http: HttpClient, private cookies: CookieService) {
  }

  login(data: any) {
    return this.http.post(this._URL + "/login", data);
  }

  createGerente(data: any) {
    return this.http.post(this._URL + "/crear-gerente", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getGerente(id: any) {
    return this.http.get(this._URL + "/get-gerente/" + id, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  updateGerente(id: any, data: any) {
    return this.http.put(this._URL + "/editar-gerente/" + id, data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getUsers() {
    return this.http.get(this._URL + "/users", { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getAssignedMunicipal() {
    return this.http.get(this._URL + "/gerentes-municipio-asignado/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getMunicipalAdmin() {
    return this.http.get(this._URL + "/municipios-administrador/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getZoneGerente() {
    return this.http.get(this._URL + "/zonas-gerente/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getDepartmentAdmin() {
    return this.http.get(this._URL + "/get-departamentos-administrador", { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  createSupervisor(data: any) {
    return this.http.post(this._URL + "/crear-supervisor", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getMunicipalGerente() {
    return this.http.get(this._URL + "/get-municipios-gerente", { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getSupervisores() {
    return this.http.get(this._URL + "/supervisores-zona-asignada/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getSupervisor(id: any) {
    return this.http.get(this._URL + "/get-supervisor/" + id, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  updateSupervisor(id: any, data: any) {
    return this.http.put(this._URL + "/editar-supervisor/" + id, data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getZonesSupervisor() {
    return this.http.get(this._URL + "/get-zonas-supervisor", { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getStationsCoordinador() {
    return this.http.get(this._URL + "/puestos-supervisor/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  createCoordinador(data: any) {
    return this.http.post(this._URL + "/crear-coordinador", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getCoordinadores() {
    return this.http.get(this._URL + "/coordinadores-puesto-asignado/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getCoordinador(id: any) {
    return this.http.get(this._URL + "/get-coordinador/" + id, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  updateCoordinador(id: any, data: any) {
    return this.http.put(this._URL + "/editar-coordinador/" + id, data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  logout() {
    var data: any;
    console.log({ 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() });
    return this.http.post(this._URL + "/logout", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  deleteCookies() {
    localStorage.clear();
    //this.cookies.deleteAll();
  }

  setToken(token: any) {
    localStorage.setItem('token', token);
    //this.cookies.set("token", token);
  }

  getToken() {
    return localStorage.getItem('token');
    //return this.cookies.get("token");
  }

  setRol(rol: any) {
    localStorage.setItem('rol', rol);
    //this.cookies.set("rol", rol);
  }

  getRol() {
    return localStorage.getItem('rol');
    //return this.cookies.get("rol");
  }

  setId(id: any) {
    localStorage.setItem('id', id);
    //this.cookies.set("id", id);
  }

  getId() {
    return localStorage.getItem('id');
    //return this.cookies.get("id");
  }

}
