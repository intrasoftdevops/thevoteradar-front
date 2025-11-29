import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Survey, SurveyService } from '../../../../services/survey/survey.service';

@Component({
  selector: 'app-survey-dashboard',
  templateUrl: './survey-dashboard.component.html',
  styleUrls: ['./survey-dashboard.component.scss']
})
export class SurveyDashboardComponent implements OnInit {
  surveys: Survey[] = [];
  loading = false;
  error: string | null = null;
  showCreateModal = false;
  creatingSurvey = false;
  createError: string | null = null;
  showRecipientsModal = false;
  selectedSurveyForRecipients: Survey | null = null;

  constructor(
    private surveyService: SurveyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.loading = true;
    this.error = null;

    this.surveyService.getSurveys().subscribe({
      next: (data) => {
        this.surveys = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar encuestas:', error);
        if (error.status === 401 || error.status === 403) {
          this.error = 'No tienes permisos para ver las encuestas o tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (error.message && error.message.includes('token')) {
          this.error = 'No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.';
        } else {
          this.error = 'No fue posible cargar las encuestas. Verifica que el servicio de encuestas esté corriendo.';
        }
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.createError = null;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createError = null;
  }

  createSurvey(title: string): void {
    if (!title.trim()) {
      this.createError = 'El título es requerido';
      return;
    }

    this.creatingSurvey = true;
    this.createError = null;

    this.surveyService.createSurveyDraft(title.trim()).subscribe({
      next: (newSurvey) => {
        this.creatingSurvey = false;
        this.closeCreateModal();
        this.router.navigate(['/admin/surveys/builder', newSurvey.survey_id]);
      },
      error: (error) => {
        console.error('Error al crear encuesta:', error);
        this.createError = error.error?.detail || error.message || 'Error al crear la encuesta';
        this.creatingSurvey = false;
      }
    });
  }

  editSurvey(surveyId: string): void {
    this.router.navigate(['/admin/surveys/builder', surveyId]);
  }

  openRecipientsModal(survey: Survey): void {
    this.selectedSurveyForRecipients = survey;
    this.showRecipientsModal = true;
  }

  closeRecipientsModal(): void {
    this.showRecipientsModal = false;
    this.selectedSurveyForRecipients = null;
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'closed':
        return 'badge bg-secondary';
      case 'draft':
      default:
        return 'badge bg-warning text-dark';
    }
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'closed':
        return 'Cerrada';
      case 'draft':
      default:
        return 'Borrador';
    }
  }

  viewAnalytics(surveyId: string): void {
    this.router.navigate(['/admin/surveys/analytics', surveyId]);
  }

  viewResponses(surveyId: string): void {
    this.router.navigate(['/admin/surveys/responses', surveyId]);
  }
}


