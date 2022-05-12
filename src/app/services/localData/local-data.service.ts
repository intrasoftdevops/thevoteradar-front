import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  constructor(private router: Router) { }

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
    this.router.navigateByUrl('/');
  }

  getRol() {
    return CryptoJS.AES.decrypt(localStorage.getItem('keyB') ?? "0", environment.key2).toString(CryptoJS.enc.Utf8);
  }

  setId(id: any) {
    const idEncrypt = CryptoJS.AES.encrypt(id.toString(), environment.key3).toString();
    localStorage.setItem('keyC', idEncrypt);
  }

  getId() {
    return CryptoJS.AES.decrypt(localStorage.getItem('keyC') ?? '', environment.key3).toString(CryptoJS.enc.Utf8);
  }

  encryptIdUser(id: any){
    return CryptoJS.AES.encrypt(id.toString(), environment.key4).toString();
  }

  decryptIdUser(id: any){
    return CryptoJS.AES.decrypt(id.toString()?? '', environment.key4).toString(CryptoJS.enc.Utf8);
  }

}
