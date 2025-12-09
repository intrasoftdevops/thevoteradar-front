import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, take, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalDataService } from '../localData/local-data.service';
import {
  WhatsAppTemplatePending,
  WhatsAppTemplatePendingCreate,
  WhatsAppTemplateStatusResponse,
  WhatsAppTemplatesByCreatorResponse,
  WhatsAppTemplateSummaryResponse,
  WhatsAppTemplateSendPendingRequest,
  WhatsAppTemplateSendPendingResponse,
  WhatsAppTemplateUpdateStatusRequest,
  WhatsAppTemplateUpdateStatusResponse,
  ReferralDetailsResponse
} from './whatsapp-templates.types';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppTemplatesService {
  private backofficeUrl = environment.backofficeApiURL || '';

  constructor(
    private http: HttpClient,
    private localData: LocalDataService
  ) { }

  private getAuthHeaders(): HttpHeaders | null {
    const token = this.localData.getBackofficeToken();
    if (!token) {
      return null;
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ============================================================================
  // TEMPLATES PENDIENTES (Flujo de Aprobación)
  // ============================================================================

  /**
   * Crear un template pendiente que será creado manualmente en WATI
   */
  createPendingTemplate(templateData: WhatsAppTemplatePendingCreate): Observable<WhatsAppTemplatePending> {
    const url = `${this.backofficeUrl}/whatsapp/templates/pending`;
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.post<WhatsAppTemplatePending>(url, templateData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al crear template:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener todos los templates pendientes (para administradores)
   */
  getAllPendingTemplates(): Observable<WhatsAppTemplatePending[]> {
    const url = `${this.backofficeUrl}/whatsapp/templates/pending`;
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.get<{ templates: WhatsAppTemplatePending[] }>(url, { headers })
      .pipe(
        take(1),
        map(response => response.templates),
        catchError(error => {
          console.error('Error al obtener templates pendientes:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener todos los templates creados por el usuario autenticado (desde Firestore)
   */
  getMyTemplates(): Observable<WhatsAppTemplatesByCreatorResponse> {
    const url = `${this.backofficeUrl}/whatsapp/templates/my-templates`;
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.get<WhatsAppTemplatesByCreatorResponse>(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al obtener mis templates:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener todos los templates disponibles en WATI
   */
  getWatiTemplates(): Observable<WhatsAppTemplatesByCreatorResponse> {
    const url = `${this.backofficeUrl}/whatsapp/templates/wati-templates`;
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.get<WhatsAppTemplatesByCreatorResponse>(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al obtener templates de WATI:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener el estado específico de un template creado por el usuario
   */
  getMyTemplateStatus(templateId: string): Observable<WhatsAppTemplateStatusResponse> {
    const url = `${this.backofficeUrl}/whatsapp/templates/my-templates/${templateId}/status`;
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.get<WhatsAppTemplateStatusResponse>(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al obtener estado del template:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener un resumen del estado de todos los templates del usuario
   */
  getMyTemplatesSummary(): Observable<WhatsAppTemplateSummaryResponse> {
    const url = `${this.backofficeUrl}/whatsapp/templates/my-templates/summary`;
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.get<WhatsAppTemplateSummaryResponse>(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al obtener resumen de templates:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Rechazar un template pendiente (para administradores)
   */
  rejectTemplate(templateId: string, rejectionReason?: string): Observable<WhatsAppTemplateUpdateStatusResponse> {
    let url = `${this.backofficeUrl}/whatsapp/templates/pending/${templateId}/status`;
    if (rejectionReason) {
      const params = new HttpParams().set('rejection_reason', rejectionReason);
      url += `?${params.toString()}`;
    }
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.put<WhatsAppTemplateUpdateStatusResponse>(url, { status: 'failed' }, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al rechazar template:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Enviar un template pendiente que ya fue creado en WATI
   */
  sendPendingTemplate(request: WhatsAppTemplateSendPendingRequest): Observable<WhatsAppTemplateSendPendingResponse> {
    const url = `${this.backofficeUrl}/whatsapp/templates/send-pending`;
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.post<WhatsAppTemplateSendPendingResponse>(url, request, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al enviar template:', error);
          return throwError(() => error);
        })
      );
  }

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  /**
   * Verificar si un template está listo para envío
   */
  isTemplateReadyForSending(template: WhatsAppTemplatePending): boolean {
    return template.status === 'created' && !!template.wati_template_id;
  }

  /**
   * Obtener el estado de un template de forma legible
   */
  getTemplateStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      pending: 'Pendiente de aprobación',
      created: 'Aprobado y listo',
      failed: 'Rechazado'
    };
    return statusLabels[status] || status;
  }

  /**
   * Formatear fecha para mostrar en la UI
   */
  formatTemplateDate(dateString: string): string {
    if (!dateString) {
      return 'Fecha no disponible';
    }
    
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ============================================================================
  // MÉTODOS PARA REFERIDOS
  // ============================================================================

  /**
   * Obtener referidos del usuario para selección de destinatarios
   */
  getUserReferrals(): Observable<ReferralDetailsResponse> {
    const url = `${this.backofficeUrl}/users/me/referrals/status/details`;
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación'));
    }
    return this.http.get<ReferralDetailsResponse>(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al obtener referidos:', error);
          return throwError(() => error);
        })
      );
  }
}
