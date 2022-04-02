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

  createUser(data: any) {
    return this.http.post(this._URL + "/users", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getUsers() {
    return this.http.get(this._URL + "/users", { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getUserById(id: any) {
    return this.http.get(this._URL + "/users/" + id, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getAssignedMunicipal() {
    return this.http.get(this._URL + "/gerentes-municipio-asignado/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  addMunicipals(data: any) {
    return this.http.post(this._URL + "/mult-municipios-gerentes", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getMunicipalAdmin() {
    return this.http.get(this._URL + "/municipios-administrador/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getZoneGerente() {
    return this.http.get(this._URL + "/zonas-gerente/" + this.getId(), { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getDepartmentAdmin() {
    return this.http.get(this._URL + "/obtener-departamento-administrador", { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  createDepartmentGerente(data: any) {
    return this.http.post(this._URL + "/departamentos-gerentes", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  getMunicipalAssignedGerente(id: any) {
    return this.http.get(this._URL + "/get-municipios-gerente/" + id, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  updateMunicipal(data: any) {
    return this.http.put(this._URL + "/editar-municipios-gerente", data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
  }

  updateGerente(data: any,id:any) {
    return this.http.put(this._URL + "/users/"+id, data, { headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + this.getToken() } });
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
