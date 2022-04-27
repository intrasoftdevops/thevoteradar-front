import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  constructor() { }

  deleteCookies() {
    localStorage.clear();
  }

  setToken(token: any) {
    const tokenEncrypt = CryptoJS.AES.encrypt(token, environment.key1).toString();
    localStorage.setItem('keyA', tokenEncrypt);
  }

  getToken() {
    return CryptoJS.AES.decrypt(localStorage.getItem('keyA') ?? '', environment.key1).toString(CryptoJS.enc.Utf8);
  }

  setRol(rol: any) {
    const rolEncrypt = CryptoJS.AES.encrypt(rol.toString(), environment.key2).toString();
    localStorage.setItem('keyB', rolEncrypt);
  }

  getRol() {
    return CryptoJS.AES.decrypt(localStorage.getItem('keyB') ?? '', environment.key2).toString(CryptoJS.enc.Utf8);
  }

  setId(id: any) {
    const idEncrypt = CryptoJS.AES.encrypt(id.toString(), environment.key3).toString();
    localStorage.setItem('keyC', idEncrypt);
  }

  getId() {
    return CryptoJS.AES.decrypt(localStorage.getItem('keyC') ?? '', environment.key3).toString(CryptoJS.enc.Utf8);
  }

}
