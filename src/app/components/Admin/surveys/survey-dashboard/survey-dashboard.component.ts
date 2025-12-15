import { Component, HostListener, OnInit } from '@angular/core';
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
  openActionsFor: string | null = null;

  // Controles de listado
  statusFilter: 'all' | 'draft' | 'published' | 'closed' = 'all';
  sortOrder: 'desc' | 'asc' = 'desc'; // por fecha de creación

  /**
   * Normaliza el estado para que lo que se muestra (badge) coincida con lo que se filtra.
   * El backend a veces envía status vacío/undefined o valores no estándar.
   */
  private normalizeStatus(s: Survey): 'draft' | 'published' | 'closed' {
    const raw = (s.status || '').toString().trim().toLowerCase();

    // Si el backend marca explícitamente is_draft, respétalo.
    if (s.is_draft) return 'draft';

    // Si viene vacío, históricamente lo tratamos como borrador en UI.
    if (!raw) return 'draft';

    // Draft equivalents
    if (raw === 'draft' || raw === 'borrador' || raw === 'created' || raw === 'new' || raw === 'pending') return 'draft';
    // Published equivalents (ojo: backend legacy puede usar 'active')
    if (raw === 'published' || raw === 'publicada' || raw === 'active' || raw === 'activa' || raw === 'open' || raw === 'opened') return 'published';
    // Closed equivalents (ojo: 'inactive' se oculta y NO debe mapearse a closed)
    if (raw === 'closed' || raw === 'cerrada' || raw === 'close') return 'closed';

    // Fallback: mantener consistencia con UI (si no reconocemos, se ve como borrador)
    return 'draft';
  }

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

  setStatusFilter(value: 'all' | 'draft' | 'published' | 'closed'): void {
    this.statusFilter = value;
    this.closeActionsMenu();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.closeActionsMenu();
  }

  getDisplayedSurveys(): Survey[] {
    const normalizedFilter = this.statusFilter;

    const filtered = (this.surveys || [])
      // Reglas de negocio: NO mostrar 'inactive' ni 'archived'
      .filter((s) => {
        const raw = (s.status || '').toString().trim().toLowerCase();
        return raw !== 'inactive' && raw !== 'archived' && raw !== 'archivada';
      })
      .filter((s) => {
      if (normalizedFilter === 'all') return true;

      return this.normalizeStatus(s) === normalizedFilter;
    });

    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return this.sortOrder === 'desc' ? (dateB - dateA) : (dateA - dateB);
    });

    return sorted;
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
        this.router.navigate(['/panel/encuestas/crear', newSurvey.survey_id]);
      },
      error: (error) => {
        console.error('Error al crear encuesta:', error);
        this.createError = error.error?.detail || error.message || 'Error al crear la encuesta';
        this.creatingSurvey = false;
      }
    });
  }

  editSurvey(surveyId: string): void {
    this.router.navigate(['/panel/encuestas/crear', surveyId]);
  }

  openRecipientsModal(survey: Survey): void {
    this.selectedSurveyForRecipients = survey;
    this.showRecipientsModal = true;
  }

  closeRecipientsModal(): void {
    this.showRecipientsModal = false;
    this.selectedSurveyForRecipients = null;
  }

  toggleActionsMenu(surveyId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.openActionsFor = this.openActionsFor === surveyId ? null : surveyId;
  }

  closeActionsMenu(): void {
    this.openActionsFor = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    // Cierra el menú de acciones si el usuario hace click fuera
    this.openActionsFor = null;
  }

  getStatusBadgeClass(status: string | undefined): string {
    const raw = (status || '').toString().trim().toLowerCase();
    const normalized =
      (raw === 'published' || raw === 'publicada' || raw === 'active' || raw === 'activa' || raw === 'open' || raw === 'opened') ? 'published' :
      (raw === 'closed' || raw === 'cerrada' || raw === 'close' || raw === 'inactive') ? 'closed' :
      'draft';

    switch (normalized) {
      case 'published':
        return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800';
      case 'closed':
        return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800';
      default:
        return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800';
    }
  }

  getStatusText(status: string | undefined): string {
    const raw = (status || '').toString().trim().toLowerCase();
    const normalized =
      (raw === 'published' || raw === 'publicada' || raw === 'active' || raw === 'activa' || raw === 'open' || raw === 'opened') ? 'published' :
      (raw === 'closed' || raw === 'cerrada' || raw === 'close' || raw === 'inactive') ? 'closed' :
      'draft';

    switch (normalized) {
      case 'published':
        return 'Publicada';
      case 'closed':
        return 'Cerrada';
      default:
        return 'Borrador';
    }
  }

  viewAnalytics(surveyId: string): void {
    this.router.navigate(['/panel/encuestas/analytics', surveyId]);
  }

  viewResponses(surveyId: string): void {
    this.router.navigate(['/panel/encuestas/respuestas', surveyId]);
  }
}


