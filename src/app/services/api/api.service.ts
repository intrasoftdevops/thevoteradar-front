import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalDataService } from '../localData/local-data.service';

/**
 * Interfaz para la respuesta del API de challenges
 * Según la documentación: GET /challenges/my-challenges
 * Retorna un array: [{ challenge_id, name, description, status, ... }]
 */
export interface ChallengeApiResponse {
  challenge_id: string;
  name: string;
  description: string;
  status: string;
  max_date: string;
  puntos: number;
  max_users: number;
  date_creation: string;
  creator_phone: string;
  max_limit?: number;
  reward_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Deprecado: Usar backofficeApiURL en su lugar
  // _URL = environment.apiURL;
  _URL = environment.backofficeApiURL || 'http://localhost:8002';

  constructor(private http: HttpClient, private localData: LocalDataService) { }

  /**
   * Obtiene los headers para peticiones a apiURL (voteradarback)
   * 
   * ✅ SOLUCIÓN IMPLEMENTADA:
   * Los administradores ahora tienen dos tokens:
   * 1. Token de backoffice (Firestore) - para peticiones a backofficeApiURL
   * 2. Token de voteradar-back (MySQL) - para peticiones a apiURL (voteradar-back)
   * 
   * Cuando un admin hace login, el sistema automáticamente:
   * - Verifica si existe en voteradar-back
   * - Si no existe, lo crea automáticamente
   * - Retorna ambos tokens en la respuesta del login
   * 
   * Este método usa el token de voteradar-back si está disponible (para admins),
   * o el token normal para otros usuarios.
   */
  getHeaders(): { [header: string]: string | string[] } {
    const headers: { [header: string]: string | string[] } = {
      'Accept': 'application/json'
    };
    
    // Prioridad 1: Usar token de voteradar-back si está disponible (para admins mapeados)
    const voteradarToken = this.localData.getVoteradarToken();
    if (voteradarToken && voteradarToken !== 'undefined' && voteradarToken !== '') {
      headers['Authorization'] = "Bearer " + voteradarToken;
      // Log temporal para debugging
      console.log('🔑 ApiService.getHeaders - Enviando voteradar_token (primeros 20 chars):', voteradarToken.substring(0, 20) + '...');
      return headers;
    }
    
    // Prioridad 2: Usar token normal (para usuarios regulares o si no hay token de voteradar)
    const token = this.localData.getToken();
    if (token && token !== 'undefined' && token !== '') {
      headers['Authorization'] = "Bearer " + token;
    }
    
    return headers;
  }

  /**
   * Obtiene los headers para peticiones a backofficeApiURL
   * Usa el token de backoffice en lugar del token de voteradar-back
   */
  getBackofficeHeaders(): { [header: string]: string | string[] } {
    const headers: { [header: string]: string | string[] } = {
      'Accept': 'application/json'
    };
    
    // Usar token de backoffice para endpoints de backoffice
    const backofficeToken = this.localData.getBackofficeToken();
    if (backofficeToken && backofficeToken !== 'undefined' && backofficeToken !== '') {
      headers['Authorization'] = "Bearer " + backofficeToken;
      return headers;
    }
    
    // Fallback: usar token normal si no hay token de backoffice
    const token = this.localData.getToken();
    if (token && token !== 'undefined' && token !== '') {
      headers['Authorization'] = "Bearer " + token;
    }
    
    return headers;
  }

  login(data: any) {
    return this.http.post(this._URL + "/login", data);
  }

  
  tenantLogin(data: any) {
    return this.http.post(this._URL + "/login", data);
  }

  requestOtp(data: any) {
    return this.http.post(this._URL + "/tenant/auth/request-otp", data);
  }

  verifyOtp(data: any) {
    return this.http.post(this._URL + "/tenant/auth/verify-otp", data);
  }

  completeProfile(data: any) {
    return this.http.post(this._URL + "/tenant/auth/complete-profile", data);
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

  getUser() {
    // Usar el endpoint /users/me/ que devuelve el perfil del usuario autenticado
    return this.http.get(this._URL + "/users/me/", { headers: this.getHeaders() });
  }

  updateUser(data: any) {
    // Usar el endpoint /users/me/ para actualizar el perfil del usuario autenticado
    return this.http.put(this._URL + "/users/me/", data, { headers: this.getHeaders() });
  }

  getAssignedMunicipal() {
    // Usar voteradar_user_id si está disponible (usuario mapeado en MySQL)
    const voteradarUserId = this.localData.getVoteradarUserId();
    
    console.log('🔍 ApiService.getAssignedMunicipal - voteradarUserId:', voteradarUserId);
    
    if (voteradarUserId !== null && voteradarUserId !== undefined) {
      // Usuario tiene ID de voteradar-back guardado
      console.log('✅ ApiService.getAssignedMunicipal - Usando voteradar_user_id:', voteradarUserId);
      return this.http.get(this._URL + "/gerentes-municipio-asignado/" + voteradarUserId, { headers: this.getHeaders() });
    }
    
    console.warn('⚠️ ApiService.getAssignedMunicipal - NO hay voteradar_user_id, usando fallback');
    
    // Si no hay voteradar_user_id, intentar obtenerlo del endpoint /getId
    // Esto es un fallback para usuarios que hicieron login antes de que se implementara esta funcionalidad
    return this.getIdOnlineUser().pipe(
      switchMap((response: any) => {
        if (response && response.res && response.usuario) {
          // Guardar el ID obtenido para futuras peticiones
          this.localData.setVoteradarUserId(response.usuario);
          return this.http.get(this._URL + "/gerentes-municipio-asignado/" + response.usuario, { headers: this.getHeaders() });
        } else {
          // Si no se puede obtener el ID, usar el fallback (puede fallar si es email)
          const fallbackId = this.localData.getId();
          return this.http.get(this._URL + "/gerentes-municipio-asignado/" + fallbackId, { headers: this.getHeaders() });
        }
      }),
      catchError((error) => {
        // Si falla, intentar con el fallback
        const fallbackId = this.localData.getId();
        return this.http.get(this._URL + "/gerentes-municipio-asignado/" + fallbackId, { headers: this.getHeaders() });
      })
    );
  }

  getMunicipalAdmin() {
    // Usar voteradar_user_id si está disponible (usuario mapeado en MySQL)
    const adminId = this.localData.getVoteradarUserIdOrFallback();
    return this.http.get(this._URL + "/municipios-administrador/" + adminId, { headers: this.getHeaders() });
  }

  getZoneGerente() {
    // Usar voteradar_user_id si está disponible
    const gerenteId = this.localData.getVoteradarUserIdOrFallback();
    // Usar backofficeApiURL para zonas del gerente
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.get(backofficeUrl + "/admin/zonas-gerente/" + gerenteId, { headers: this.getBackofficeHeaders() });
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
    // Usar backofficeApiURL para zonas del supervisor
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.get(backofficeUrl + "/admin/get-zonas-supervisor", { headers: this.getBackofficeHeaders() });
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
    // Usar backofficeApiURL para puestos del coordinador
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.get(backofficeUrl + "/get-puestos-coordinador", { headers: this.getBackofficeHeaders() });
  }

  getTablesTestigo() {
    // Usar backofficeApiURL para mesas del coordinador
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    // El ID puede ser el email del usuario, que es lo que se está pasando
    return this.http.get(backofficeUrl + "/mesas-coordinador/" + this.localData.getId(), { headers: this.getBackofficeHeaders() });
  }

  createTestigo(data: any) {
    return this.http.post(this._URL + "/crear-testigo", data, { headers: this.getHeaders() });
  }

  getTestigos() {
    // Usar backofficeApiURL para testigos
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.get(backofficeUrl + "/testigos-mesa-asignada/" + this.localData.getId(), { headers: this.getBackofficeHeaders() });
  }

  getTestigo(id: any) {
    // Usar backofficeApiURL para testigo
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.get(backofficeUrl + "/get-testigo/" + id, { headers: this.getBackofficeHeaders() });
  }

  updateTestigo(id: any, data: any) {
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.put(backofficeUrl + "/editar-testigo/" + id, data, { headers: this.getBackofficeHeaders() });
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
    // Usar backofficeApiURL para reportes de votos
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.get(backofficeUrl + "/mesas-con-sin-reportar", { headers: this.getBackofficeHeaders() });
  }

  getVotosCoordinador(data: any) {
    // Usar backofficeApiURL para reportes de votos
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.post(backofficeUrl + "/reportes-coordinador", data, { headers: this.getBackofficeHeaders() });
  }

  getCandidatos() {
    // Usar backofficeApiURL para candidatos
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.get(backofficeUrl + "/candidato-e-intereses", { headers: this.getBackofficeHeaders() });
  }

  createVotos(data: any) {
    // Usar backofficeApiURL para crear reportes
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.post(backofficeUrl + "/reportes-mesa", data, { headers: this.getBackofficeHeaders() });
  }

  getInteresesCandidato() {
    return this.http.get(this._URL + "/intereses-de-cliente", { headers: this.getHeaders() });
  }

  getImpugnaciones(data: any) {
    return this.http.post(this._URL + "/get-reportes-revisar", data, { headers: this.getHeaders() });
  }

  getImpugnacionesRevisadas(data: any) {
    return this.http.post(this._URL + "/get-reportes-revisados", data, { headers: this.getHeaders() });
  }

  impugnar(id: any, data: any) {
    return this.http.put(this._URL + "/impugnar/" + id, data, { headers: this.getHeaders() });
  }

  noImpugnar(id: any, data: any) {
    return this.http.put(this._URL + "/no-impugnar/" + id, data, { headers: this.getHeaders() });
  }



  changeRole(id: any, data: any) {
    return this.http.post(this._URL + "/cambiar-usuario/" + id, data, { headers: this.getHeaders() });
  }

  getDataGraphics() {
    return this.http.get(this._URL + "/info-usuario", { headers: this.getHeaders() });
  }

  getMesasSinAsignar(data: any) {
    // Usar backofficeApiURL para mesas sin asignar
    const backofficeUrl = environment.backofficeApiURL || 'http://localhost:8000';
    return this.http.post(backofficeUrl + "/mesas-sin-asignar", data, { headers: this.getBackofficeHeaders() });
  }

  getIdOnlineUser() {
    return this.http.get(this._URL + "/getId", { headers: this.getHeaders() });
  }

  logout() {
    var data: any;
    return this.http.post(this._URL + "/logout", data, { headers: this.getHeaders() });
  }

  getCliente(){
    return this.http.get(this._URL + "/get-cliente", { headers: this.getHeaders() });
  }

  getCategoriaImpugnacion(){
    return this.http.get(this._URL + "/get-categoria-impugnacion", { headers: this.getHeaders() });
  }

  getCategoriasImpugnacion(){
    return this.http.get(this._URL + "/categorias-impugnacion", { headers: this.getHeaders() });
  }

  getReporteTransmision(id:any){
    return this.http.get(this._URL + "/get-reporte/" + id, { headers: this.getHeaders() });
  }

  /**
   * Obtiene los challenges creados por el usuario autenticado
   * Retorna un array de challenges según la documentación del API: []
   * Si no hay challenges, retorna un array vacío
   */
  getMyChallenges(): Observable<ChallengeApiResponse[]> {
    const backofficeUrl = environment.backofficeApiURL || '';
    return this.http.get<ChallengeApiResponse[]>(backofficeUrl + "/challenges/my-challenges", { headers: this.getBackofficeHeaders() });
  }

}
