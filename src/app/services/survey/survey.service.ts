import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalDataService } from '../localData/local-data.service';


export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions_count: number;
  created_at: string;
  is_draft?: boolean;
  status?: string;
  recipients_count?: number;
}

export type QuestionType = "text" | "multiple_choice" | "multiple_select" | "scale" | "candidate_vote";

export interface QuestionOptions {
  choices?: string[];
  min?: number;
  max?: number;
  min_label?: string;
  max_label?: string;
  candidates?: Array<{
    name: string;
    imageUrl?: string;
    partyName?: string;
    partyImageUrl?: string;
    vicePresidentName?: string;
    vicePresidentImageUrl?: string;
  }>;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOptions;
  // Builder v2
  order?: number;
  required?: boolean;
  is_demographic?: boolean;
}

export interface BuilderState {
  survey_id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  questions: Question[];
  layout_config: Record<string, any>;
  last_saved_at: string;
  version: number;
  is_draft: boolean;
  status?: 'draft' | 'active' | 'closed' | 'paused' | 'archived';
}

export interface RecipientImportItem {
  name?: string;
  phone?: string;
  email?: string;
}

export interface RespondentsQueryParams {
  limit?: number;
  offset?: number;
}

export interface Respondent {
  id: string;
  tenant_id: string;
  phone_number: string;
  opt_out: boolean;
  demographics: Record<string, any>;
  history: string[];
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  private surveyApiUrl = environment.surveyApiURL || '';
  private apiBaseUrl = this.surveyApiUrl ? `${this.surveyApiUrl}/api/v1` : '';

  constructor(
    private http: HttpClient,
    private localData: LocalDataService
  ) { }

  private getAuthHeaders(): HttpHeaders | null {
    const token = this.localData.getBackofficeToken();
    if (!token || token === 'undefined' || token === '') {
      return null;
    }
    
    // Obtener tenant_id del localStorage o del environment
    const tenantId = localStorage.getItem('tenant_id') || environment.defaultTenantId;
    
    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Agregar X-Tenant-ID si está disponible
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }
    
    return new HttpHeaders(headers);
  }

  getSurveys(): Observable<Survey[]> {
    // Validar que la URL del API esté configurada
    if (!this.surveyApiUrl || !this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de encuestas no está configurado. Verifica environment.surveyApiURL'));
    }
    
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    
    const url = `${this.apiBaseUrl}/surveys`;
    
    return this.http.get<Survey[]>(url, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Respondents (Directorio central por tenant)
   * Endpoint: GET /api/v1/respondents
   */
  getRespondents(params: RespondentsQueryParams = {}): Observable<Respondent[] | any> {
    if (!this.surveyApiUrl || !this.apiBaseUrl) {
      return throwError(() => new Error('El servicio de encuestas no está configurado. Verifica environment.surveyApiURL'));
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }

    const limit = params.limit ?? 1000;
    const offset = params.offset ?? 0;
    const url = `${this.apiBaseUrl}/respondents?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;

    return this.http.get<Respondent[] | any>(url, { headers }).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  createSurveyDraft(title: string, description: string = ''): Observable<BuilderState> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    const body = {
      title,
      description,
      layout_config: {}
    };
    return this.http.post<BuilderState>(`${this.apiBaseUrl}/builder/draft`, body, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getBuilderState(surveyId: string): Observable<BuilderState> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.get<BuilderState>(`${this.apiBaseUrl}/builder/${surveyId}/state`, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  reorderQuestions(surveyId: string, questionIds: string[]): Observable<BuilderState> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    const body = {
      // Backend v2: el frontend solo envía la secuencia final de IDs
      question_ids: questionIds
    };
    return this.http.post<BuilderState>(`${this.apiBaseUrl}/builder/${surveyId}/reorder`, body, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  addQuestion(surveyId: string, questionType: QuestionType): Observable<BuilderState> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    const body: { type: string; text: string; options?: any; is_demographic?: boolean } = {
      type: questionType,
      text: `Nueva pregunta (${questionType})`,
      is_demographic: false
    };

    switch (questionType) {
      case 'multiple_choice':
      case 'multiple_select':
        body.options = { choices: ['Opción 1'] };
        break;
      case 'scale':
        body.options = {
          min: 1,
          max: 5,
          min_label: '',
          max_label: ''
        };
        break;
      case 'candidate_vote':
        body.options = {
          candidates: [
            { name: 'Candidato 1', imageUrl: '', partyName: '', partyImageUrl: '' },
            { name: 'Candidato 2', imageUrl: '', partyName: '', partyImageUrl: '' }
          ]
        };
        break;
    }

    return this.http.post<BuilderState>(`${this.apiBaseUrl}/builder/${surveyId}/questions`, body, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  updateQuestion(surveyId: string, questionId: string, questionData: Partial<Question>): Observable<BuilderState> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.put<BuilderState>(`${this.apiBaseUrl}/builder/${surveyId}/questions/${questionId}`, questionData, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  deleteQuestion(surveyId: string, questionId: string): Observable<BuilderState> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.delete<BuilderState>(`${this.apiBaseUrl}/builder/${surveyId}/questions/${questionId}`, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  updateSurveyDetails(surveyId: string, details: { title?: string; description?: string; is_draft?: boolean; status?: string }): Observable<BuilderState> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.put<BuilderState>(`${this.apiBaseUrl}/builder/${surveyId}/details`, details, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  updateSurvey(surveyId: string, data: Partial<{ title: string; description: string; status: 'draft' | 'active' | 'closed' | 'paused' | 'archived'; starts_at: string; ends_at: string }>): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.put(`${this.apiBaseUrl}/surveys/${surveyId}`, data, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  deleteSurvey(surveyId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.delete(`${this.apiBaseUrl}/surveys/${surveyId}`, { 
      headers,
      observe: 'response',
      responseType: 'json'
    })
      .pipe(
        catchError(error => {
          // Si es un error 405 (Method Not Allowed), dar un mensaje más claro
          if (error.status === 405) {
            return throwError(() => new Error('El método DELETE no está permitido. Verifica que el endpoint esté correctamente configurado.'));
          }
          return throwError(() => error);
        })
      );
  }

  uploadRecipients(surveyId: string, recipients: RecipientImportItem[]): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    
    
    
    const transformedRecipients = recipients
      .filter(r => r.phone || r.email) 
      .map(r => {
        const recipient: any = {};
        
        
        if (r.phone) {
          recipient.phone_number = r.phone;
        } else if (r.email) {
          
          
          recipient.phone_number = r.email; 
        }
        
        
        const metadata: any = {};
        if (r.name) metadata.name = r.name;
        if (r.email && r.phone) metadata.email = r.email; 
        
        if (Object.keys(metadata).length > 0) {
          recipient.metadata = metadata;
        }
        
        return recipient;
      })
      .filter(r => r.phone_number); 
    
    if (transformedRecipients.length === 0) {
      return throwError(() => new Error('No hay destinatarios válidos para importar. Se requiere al menos teléfono o email.'));
    }
    
    const body = {
      recipients: transformedRecipients
    };
    
    return this.http.post(`${this.apiBaseUrl}/surveys/${surveyId}/recipients`, body, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  createShortLink(longUrl: string, params?: { survey_id?: string; recipient_id?: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    const body = { long_url: longUrl, ...params };
    return this.http.post(`${this.apiBaseUrl}/redirector/shorten`, body, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getSurveyAnalytics(surveyId: string): Observable<SurveyAnalytics> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.get<SurveyAnalytics>(`${this.apiBaseUrl}/responses/survey/${surveyId}/summary`, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getSurveyResponses(surveyId: string): Observable<SurveyResponse[]> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.get<SurveyResponse[]>(`${this.apiBaseUrl}/responses/survey/${surveyId}/list`, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getSurveyRecipients(surveyId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No hay token de autenticación disponible'));
    }
    return this.http.get<any[]>(`${this.apiBaseUrl}/surveys/${surveyId}/recipients`, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  question_id: string;
  value: any;
  metadata_hash?: string;
  created_at: string;
}

export interface SurveyAnalytics {
  survey_id: string;
  total_respondents: number;
  per_question: Array<{
    question_id: string;
    text: string;
    type: string;
    counts: Record<string, number>;
  }>;
}

