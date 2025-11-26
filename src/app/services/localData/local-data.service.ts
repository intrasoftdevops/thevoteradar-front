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
    try {
      console.log('LocalDataService - setRol llamado con:', rol);
      const rolString = rol.toString();
      const rolEncrypt = CryptoJS.AES.encrypt(rolString, environment.key2).toString();
      localStorage.setItem('keyB', rolEncrypt);
      console.log('LocalDataService - Rol guardado en localStorage keyB');
      // Verificar que se guardó correctamente
      const saved = localStorage.getItem('keyB');
      console.log('LocalDataService - Verificación: keyB existe?', !!saved);
      // NO navegar aquí - el componente que llama a setRol debe manejar la navegación
    } catch (error) {
      console.error('LocalDataService - Error al guardar rol:', error);
    }
  }

  getRol() {
    try {
      const encrypted = localStorage.getItem('keyB');
      if (!encrypted) {
        return '';
      }
      const decrypted = CryptoJS.AES.decrypt(encrypted, environment.key2).toString(CryptoJS.enc.Utf8);
      // Si el resultado está vacío o es "0", retornar cadena vacía
      return decrypted && decrypted !== '0' ? decrypted : '';
    } catch (error) {
      console.error('Error al obtener rol:', error);
      return '';
    }
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

  setBackofficeToken(token: string) {
    const tokenEncrypt = CryptoJS.AES.encrypt(token, environment.key1).toString();
    localStorage.setItem('backoffice_token', tokenEncrypt);
    this.setToken(token);
  }

  getBackofficeToken(): string | null {
    try {
      const encrypted = localStorage.getItem('backoffice_token');
      if (!encrypted) {
        return this.getToken();
      }
      return CryptoJS.AES.decrypt(encrypted, environment.key1).toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error al obtener token de backoffice:', error);
      return null;
    }
  }

  setBackofficeUser(userInfo: any) {
    const userEncrypt = CryptoJS.AES.encrypt(JSON.stringify(userInfo), environment.key2).toString();
    localStorage.setItem('backoffice_user', userEncrypt);
  }

  getBackofficeUser(): any | null {
    try {
      const encrypted = localStorage.getItem('backoffice_user');
      if (!encrypted) return null;
      const decrypted = CryptoJS.AES.decrypt(encrypted, environment.key2).toString(CryptoJS.enc.Utf8);
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
