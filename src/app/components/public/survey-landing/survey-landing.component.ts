import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'multiple_select' | 'scale' | 'candidate_vote';
  order: number;
  required: boolean;
  options?: {
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
  };
}

interface SurveyResponse {
  question_id: string;
  value: any;
}

@Component({
  selector: 'app-survey-landing',
  templateUrl: './survey-landing.component.html',
  styleUrls: ['./survey-landing.component.scss']
})
export class SurveyLandingComponent implements OnInit {
  surveyId: string | null = null;
  token: string | null = null;
  surveyTitle: string = '';
  surveyDescription: string = '';
  questions: Question[] = [];
  responses: Map<string, any> = new Map();
  loading = false;
  submitting = false;
  error: string | null = null;
  success = false;
  deviceFingerprint: string = '';

  private apiBaseUrl = `${environment.surveyApiURL || ''}/api/v1`;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.surveyId) {
      this.error = 'ID de encuesta no válido';
      return;
    }

    this.generateDeviceFingerprint();
    this.loadSurvey();
    this.checkIfAlreadyVoted();
  }

  generateDeviceFingerprint(): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
      this.deviceFingerprint = canvas.toDataURL();
    } else {
      this.deviceFingerprint = `fp_${Date.now()}_${Math.random()}`;
    }
  }

  loadSurvey(): void {
    if (!this.surveyId) return;

    this.loading = true;
    this.error = null;

    this.http.get<{ survey_id: string; title: string; description?: string; questions: Question[] }>(`${this.apiBaseUrl}/responses/survey/${this.surveyId}`).subscribe({
      next: (data) => {
        this.surveyTitle = data.title;
        this.surveyDescription = data.description || '';
        this.questions = (data.questions || []).sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'No fue posible cargar la encuesta. Verifica que el enlace sea correcto.';
        this.loading = false;
      }
    });
  }

  checkIfAlreadyVoted(): void {
    if (!this.surveyId) return;

    const params: any = {};
    if (this.token) params.token = this.token;
    if (this.deviceFingerprint) params.device_fingerprint = this.deviceFingerprint;

    const queryString = new URLSearchParams(params).toString();
    this.http.get<{ has_voted: boolean; can_vote: boolean }>(`${this.apiBaseUrl}/responses/survey/${this.surveyId}/check?${queryString}`).subscribe({
      next: (data) => {
        if (data.has_voted) {
          this.error = 'Ya has respondido esta encuesta.';
          this.loading = false;
        }
      },
      error: (error) => {
      }
    });
  }

  updateResponse(questionId: string, value: any): void {
    this.responses.set(questionId, value);
  }

  getResponse(questionId: string): any {
    return this.responses.get(questionId);
  }

  submitSurvey(): void {
    if (!this.surveyId) return;

    const responseArray: SurveyResponse[] = [];
    let hasErrors = false;

    for (const question of this.questions) {
      const value = this.responses.get(question.id);
      if (question.required && (value === undefined || value === null || value === '')) {
        this.error = `La pregunta "${question.text}" es requerida.`;
        hasErrors = true;
        break;
      }
      if (value !== undefined && value !== null && value !== '') {
        responseArray.push({
          question_id: question.id,
          value: this.formatResponseValue(question, value)
        });
      }
    }

    if (hasErrors) return;

    if (responseArray.length === 0) {
      this.error = 'Debes responder al menos una pregunta.';
      return;
    }

    this.submitting = true;
    this.error = null;

    const payload: any = {
      survey_id: this.surveyId,
      responses: responseArray
    };

    if (this.token) {
      payload.token = this.token;
    }
    if (this.deviceFingerprint) {
      payload.device_fingerprint = this.deviceFingerprint;
    }

    this.http.post(`${this.apiBaseUrl}/responses/survey/${this.surveyId}/submit`, payload).subscribe({
      next: () => {
        this.success = true;
        this.submitting = false;
      },
      error: (error) => {
        if (error.status === 409) {
          this.error = 'Ya has respondido esta encuesta anteriormente.';
        } else {
          this.error = error.error?.detail || error.message || 'Error al enviar las respuestas. Por favor, intenta nuevamente.';
        }
        this.submitting = false;
      }
    });
  }

  formatResponseValue(question: Question, value: any): any {
    switch (question.type) {
      case 'multiple_choice':
        return { choice: value };
      case 'multiple_select':
        return { selected: Array.isArray(value) ? value : [value] };
      case 'scale':
        return { value: Number(value) };
      case 'candidate_vote':
        return { candidate_id: value };
      default:
        return value;
    }
  }

  toggleMultipleSelect(questionId: string, choice: string): void {
    const current = this.getResponse(questionId) || [];
    const selected = Array.isArray(current) ? [...current] : [];
    const index = selected.indexOf(choice);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(choice);
    }
    this.updateResponse(questionId, selected);
  }

  getScaleRange(question: Question): number[] {
    const min = question.options?.min || 1;
    const max = question.options?.max || 5;
    const range: number[] = [];
    for (let i = min; i <= max; i++) {
      range.push(i);
    }
    return range;
  }

  clearResponses(): void {
    this.responses.clear();
  }
}

