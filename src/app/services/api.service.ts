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

  getAssignedZone() {
    return this.http.get(this._URL + "/supervisores-zona-asignada/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  logout() {
    var data: any;
    console.log({ 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() });
    return this.http.post(this._URL + "/logout", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  deleteCookies() {
    this.cookies.deleteAll();
  }

  setToken(token: any) {
    this.cookies.set("token", token);
  }

  getToken() {
    return this.cookies.get("token");
  }

  setRol(rol: any) {
    this.cookies.set("rol", rol);
  }

  getRol() {
    return this.cookies.get("rol");
  }

  setId(id: any) {
    this.cookies.set("id", id);
  }

  getId() {
    return this.cookies.get("id");
  }

}
