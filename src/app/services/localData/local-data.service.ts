import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  private getConfig() {
    try {
      return this.configService.getConfig();
    } catch {
      return {
        key1: environment.key1,
        key2: environment.key2,
        key3: environment.key3,
        key4: environment.key4
      };
    }
  }

  constructor(
    private router: Router,
    private configService: ConfigService
  ) { }

  deleteCookies() {
    localStorage.clear();
  }

  setToken(token: any) {
    const config = this.getConfig();
    const tokenEncrypt = CryptoJS.AES.encrypt(token, config.key1).toString();
    localStorage.setItem('keyA', tokenEncrypt);
  }

  getToken() {
    const config = this.getConfig();
    return CryptoJS.AES.decrypt(localStorage.getItem('keyA') ?? '', config.key1).toString(CryptoJS.enc.Utf8);
  }

  setRol(rol: any) {
    try {
      console.log('LocalDataService - setRol llamado con:', rol);
      const config = this.getConfig();
      const rolString = rol.toString();
      const rolEncrypt = CryptoJS.AES.encrypt(rolString, config.key2).toString();
      localStorage.setItem('keyB', rolEncrypt);
      console.log('LocalDataService - Rol guardado en localStorage keyB');
      
      const saved = localStorage.getItem('keyB');
      console.log('LocalDataService - Verificación: keyB existe?', !!saved);
      
    } catch (error) {
      console.error('LocalDataService - Error al guardar rol:', error);
    }
  }

  getRol() {
    try {
      const config = this.getConfig();
      const encrypted = localStorage.getItem('keyB');
      if (!encrypted) {
        return '';
      }
      const decrypted = CryptoJS.AES.decrypt(encrypted, config.key2).toString(CryptoJS.enc.Utf8);
      
      return decrypted && decrypted !== '0' ? decrypted : '';
    } catch (error) {
      console.error('Error al obtener rol:', error);
      return '';
    }
  }

  setId(id: any) {
    const config = this.getConfig();
    const idEncrypt = CryptoJS.AES.encrypt(id.toString(), config.key3).toString();
    localStorage.setItem('keyC', idEncrypt);
  }

  getId() {
    const config = this.getConfig();
    return CryptoJS.AES.decrypt(localStorage.getItem('keyC') ?? '', config.key3).toString(CryptoJS.enc.Utf8);
  }

  encryptIdUser(id: any){
    const config = this.getConfig();
    return CryptoJS.AES.encrypt(id.toString(), config.key4).toString();
  }

  decryptIdUser(id: any){
    const config = this.getConfig();
    return CryptoJS.AES.decrypt(id.toString()?? '', config.key4).toString(CryptoJS.enc.Utf8);
  }

  setBackofficeToken(token: string) {
    const config = this.getConfig();
    const tokenEncrypt = CryptoJS.AES.encrypt(token, config.key1).toString();
    localStorage.setItem('backoffice_token', tokenEncrypt);
    this.setToken(token);
  }

  getBackofficeToken(): string | null {
    try {
      const config = this.getConfig();
      const encrypted = localStorage.getItem('backoffice_token');
      if (!encrypted) {
        return this.getToken();
      }
      return CryptoJS.AES.decrypt(encrypted, config.key1).toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error al obtener token de backoffice:', error);
      return null;
    }
  }

  setBackofficeUser(userInfo: any) {
    const config = this.getConfig();
    const userEncrypt = CryptoJS.AES.encrypt(JSON.stringify(userInfo), config.key2).toString();
    localStorage.setItem('backoffice_user', userEncrypt);
  }

  getBackofficeUser(): any | null {
    try {
      const config = this.getConfig();
      const encrypted = localStorage.getItem('backoffice_user');
      if (!encrypted) return null;
      const decrypted = CryptoJS.AES.decrypt(encrypted, config.key2).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error al obtener usuario de backoffice:', error);
      return null;
    }
  }

  isBackofficeAuthenticated(): boolean {
    const token = this.getBackofficeToken();
    return token !== null && token !== '' && token !== 'undefined';
  }

}
