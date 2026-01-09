import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalDataService } from '../../services/localData/local-data.service';

/**
 * Interfaz para la respuesta del API de challenges
 * Basada en la documentación: GET /challenges/my-challenges
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

/**
 * Interfaz para crear un nuevo challenge
 */
export interface CreateChallengeRequest {
  name: string;
  description: string;
  max_limit: number;
  reward_id?: string;
  max_users: number;
  max_date: string;
  puntos: number;
}

/**
 * Interfaz para actualizar un challenge
 */
export interface UpdateChallengeRequest {
  name?: string;
  description?: string;
  max_limit?: number;
  reward_id?: string;
  max_users?: number;
  max_date?: string;
  puntos?: number;
  status?: 'active' | 'completed' | 'upcoming' | 'cancelled';
}

/**
 * Interfaz para la respuesta de creación/actualización
 */
export interface ChallengeResponse {
  challenge_id: string;
  message?: string;
}

/**
 * Interfaz para asignar challenge a árbol completo de referidos
 * Se asigna al usuario autenticado y todo su árbol de referidos
 */
export interface AssignToTreeRequest {
  challenge_id: string;
}

/**
 * Interfaz para asignar challenge a referidos directos
 * Se asigna al usuario autenticado y solo sus referidos directos (no todo el árbol)
 */
export interface AssignToDirectRequest {
  challenge_id: string;
}

/**
 * Interfaz para asignar challenge a un usuario específico por teléfono
 */
export interface AssignToUserRequest {
  challenge_id: string;
  phone: string;
}

/**
 * Interfaz para challenges categorizados
 */
export interface CategorizedChallengesResponse {
  active?: ChallengeApiResponse[];
  completed?: ChallengeApiResponse[];
  upcoming?: ChallengeApiResponse[];
  cancelled?: ChallengeApiResponse[];
}

/**
 * Interfaz para usuario asignado a challenge
 */
export interface AssignedUser {
  user_id: string;
  name?: string;
  phone?: string;
  status?: string;
  completion_date?: string;
  // ¿Qué más campos tiene?
}

/**
 * Interfaz para confirmar completaciones (retos presenciales, asistencia, etc.)
 */
export interface ConfirmCompletionsRequest {
  challenge_id: string;
  phones: string[]; // Array de teléfonos de usuarios que completaron
}

/**
 * ChallengeService - Servicio para gestionar challenges/retos
 * 
 * Endpoints disponibles:
 * - GET /challenges/my-challenges - Obtiene los challenges del usuario autenticado
 * - GET /challenges/:id - Obtiene un challenge específico
 * - POST /challenges - Crea un nuevo challenge
 * - PUT /challenges/:id - Actualiza un challenge
 * - DELETE /challenges/:id - Elimina un challenge
 * - GET /challenges - Obtiene todos los challenges (admin)
 * 
 * Características:
 * - Manejo de errores con logging detallado
 * - Headers de autenticación automáticos
 * - Soporte para multi-tenancy (vía interceptors)
 */
@Injectable({
  providedIn: 'root'
})
export class ChallengeService {

  private apiBaseUrl = environment.backofficeApiURL || '';

  constructor(
    private http: HttpClient,
    private localData: LocalDataService
  ) { }

  /**
   * Obtiene los headers de autenticación
   */
  private getAuthHeaders(): HttpHeaders | null {
    const token = this.localData.getToken();
    if (!token || token === 'undefined' || token === '') {
      return null;
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  /**
   * Obtiene los challenges creados por el usuario autenticado
   * @returns Observable con array de challenges
   */
  getMyChallenges(): Observable<ChallengeApiResponse[]> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado. Verifica environment.apiURL'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/my-challenges`;
    

    return this.http.get<ChallengeApiResponse[]>(url, { headers })
      .pipe(
        catchError(error => {
         
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene un challenge específico por ID
   * @param challengeId ID del challenge
   * @returns Observable con el challenge
   */
  getChallengeById(challengeId: string): Observable<ChallengeApiResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/${challengeId}`;

    return this.http.get<ChallengeApiResponse>(url, { headers })
      .pipe(
        catchError(error => {
        
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene todos los challenges (requiere permisos de admin)
   * @param filters Filtros opcionales (status, fecha, etc.)
   * @returns Observable con array de challenges
   */
  getAllChallenges(filters?: { status?: string; limit?: number; offset?: number }): Observable<ChallengeApiResponse[]> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    let url = `${this.apiBaseUrl}/challenges`;
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset) {
      params.append('offset', filters.offset.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }


    return this.http.get<ChallengeApiResponse[]>(url, { headers })
      .pipe(
        catchError(error => {
       
          return throwError(() => error);
        })
      );
  }

  /**
   * Crea un nuevo challenge
   * @param challengeData Datos del challenge a crear
   * @returns Observable con la respuesta del servidor
   */
  createChallenge(challengeData: CreateChallengeRequest): Observable<ChallengeResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges`;

    return this.http.post<ChallengeResponse>(url, challengeData, { headers })
      .pipe(
        catchError(error => {
       
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualiza un challenge existente
   * @param challengeId ID del challenge a actualizar
   * @param challengeData Datos a actualizar
   * @returns Observable con la respuesta del servidor
   */
  updateChallenge(challengeId: string, challengeData: UpdateChallengeRequest): Observable<ChallengeResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/${challengeId}`;

    return this.http.put<ChallengeResponse>(url, challengeData, { headers })
      .pipe(
        catchError(error => {
       
          return throwError(() => error);
        })
      );
  }

  /**
   * Elimina un challenge
   * @param challengeId ID del challenge a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteChallenge(challengeId: string): Observable<{ message: string }> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/${challengeId}`;

    return this.http.delete<{ message: string }>(url, { headers })
      .pipe(
        catchError(error => {
     
          return throwError(() => error);
        })
      );
  }

  /**
   * Cambia el estado de un challenge (usa PATCH según la documentación)
   * @param challengeId ID del challenge
   * @param status Nuevo estado
   * @returns Observable con la respuesta del servidor
   */
  updateChallengeStatus(challengeId: string, status: 'active' | 'completed' | 'upcoming' | 'cancelled'): Observable<ChallengeResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/${challengeId}/status`;

    return this.http.patch<ChallengeResponse>(url, { status }, { headers })
      .pipe(
        catchError(error => {
         
          return throwError(() => error);
        })
      );
  }

  /**
   * Asigna un challenge a todo el árbol de referidos de un usuario
   * @param request Datos de asignación
   * @returns Observable con la respuesta del servidor
   */
  assignToTree(request: AssignToTreeRequest): Observable<ChallengeResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/assign-to-tree`;

    return this.http.post<ChallengeResponse>(url, request, { headers })
      .pipe(
        catchError(error => {
       
          return throwError(() => error);
        })
      );
  }

  /**
   * Asigna un challenge a los referidos directos de un usuario
   * @param request Datos de asignación
   * @returns Observable con la respuesta del servidor
   */
  assignToDirect(request: AssignToDirectRequest): Observable<ChallengeResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/assign-to-direct`;

    return this.http.post<ChallengeResponse>(url, request, { headers })
      .pipe(
        catchError(error => {
       
          return throwError(() => error);
        })
      );
  }

  /**
   * Asigna un challenge a un usuario específico
   * @param request Datos de asignación
   * @returns Observable con la respuesta del servidor
   */
  assignToUser(request: AssignToUserRequest): Observable<ChallengeResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/assign-to-user`;

    return this.http.post<ChallengeResponse>(url, request, { headers })
      .pipe(
        catchError(error => {
      
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene los challenges del usuario autenticado categorizados por estado
   * @returns Observable con challenges categorizados
   */
  getMyChallengesCategorized(): Observable<CategorizedChallengesResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/my-challenges/categorized`;

    return this.http.get<CategorizedChallengesResponse>(url, { headers })
      .pipe(
        catchError(error => {
         
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene los usuarios asignados a un challenge
   * @param challengeId ID del challenge
   * @returns Observable con array de usuarios asignados
   */
  getAssignedUsers(challengeId: string): Observable<AssignedUser[]> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/${challengeId}/assigned-users`;

    return this.http.get<AssignedUser[]>(url, { headers })
      .pipe(
        catchError(error => {
       
          return throwError(() => error);
        })
      );
  }

  /**
   * Confirma las completaciones de un challenge
   * @param request Datos de confirmación
   * @returns Observable con la respuesta del servidor
   */
  confirmCompletions(request: ConfirmCompletionsRequest): Observable<ChallengeResponse> {
    if (!this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de challenges no está configurado'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const url = `${this.apiBaseUrl}/challenges/confirm-completions`;

    return this.http.post<ChallengeResponse>(url, request, { headers })
      .pipe(
        catchError(error => {
       
          return throwError(() => error);
        })
      );
  }
}

