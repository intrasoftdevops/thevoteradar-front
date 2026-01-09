import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Survey, SurveyService } from '../../../../services/survey/survey.service';
import Swal from 'sweetalert2';

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

  deleteSurvey(surveyId: string, surveyTitle: string): void {
    Swal.fire({
      title: '<div style="display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;"><div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-triangle-exclamation" style="font-size: 32px; color: white;"></i></div></div><h2 style="color: #1f2937; font-size: 1.5rem; font-weight: 700; margin: 0;">¿Eliminar encuesta?</h2>',
      html: `
        <div style="text-align: left; color: #4b5563;">
          <p style="font-size: 1rem; margin-bottom: 1.5rem; line-height: 1.6;">
            ¿Estás seguro de que deseas eliminar la encuesta 
            <strong style="color: #1f2937;">"${surveyTitle}"</strong>?
          </p>
          
          <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border-left: 4px solid #ef4444; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);">
            <div style="display: flex; align-items: center; margin-bottom: 0.75rem;">
              <i class="fa-solid fa-triangle-exclamation" style="color: #dc2626; font-size: 1.25rem; margin-right: 0.5rem;"></i>
              <p style="font-size: 0.875rem; font-weight: 700; color: #991b1b; margin: 0;">
                Advertencia importante
              </p>
            </div>
            <p style="font-size: 0.875rem; color: #7f1d1d; margin-bottom: 0.75rem; line-height: 1.6;">
              Al eliminar esta encuesta, <strong style="color: #991b1b;">no podrás acceder a ella ni a sus datos nuevamente</strong>. 
              Esto incluye:
            </p>
            <ul style="font-size: 0.875rem; color: #7f1d1d; margin: 0; padding-left: 1.5rem; line-height: 1.8;">
              <li>Las preguntas de la encuesta</li>
              <li>Las respuestas recibidas</li>
              <li>Los datos de destinatarios</li>
              <li>Los análisis y estadísticas</li>
            </ul>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 0.75rem 1rem; text-align: center;">
            <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">
              <i class="fa-solid fa-lock" style="margin-right: 0.5rem; color: #9ca3af;"></i>
              <strong style="color: #374151;">Esta acción no se puede deshacer.</strong>
            </p>
          </div>
        </div>
      `,
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-trash me-2"></i>Sí, eliminar permanentemente',
      cancelButtonText: '<i class="fa-solid fa-times me-2"></i>Cancelar',
      reverseButtons: true,
      width: '580px',
      padding: '2rem',
      customClass: {
        popup: 'swal2-popup-custom',
        htmlContainer: 'swal2-html-container-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
        actions: 'swal2-actions-custom'
      },
      buttonsStyling: false,
      confirmButtonColor: undefined,
      cancelButtonColor: undefined
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.performDelete(surveyId);
      }
    });
  }

  private performDelete(surveyId: string): void {
    this.loading = true;
    this.closeActionsMenu();

    this.surveyService.deleteSurvey(surveyId).subscribe({
      next: () => {
        this.loading = false;
        // Recargar la lista de encuestas
        this.loadSurveys();
        
        // Mostrar mensaje de éxito
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La encuesta ha sido eliminada correctamente.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.loading = false;
        
        // Mensaje de error más específico
        let errorMessage = 'No se pudo eliminar la encuesta. Por favor, intenta nuevamente.';
        
        if (error.status === 405) {
          errorMessage = 'El método de eliminación no está permitido. Por favor, contacta al administrador.';
        } else if (error.status === 404) {
          errorMessage = 'La encuesta no fue encontrada o ya ha sido eliminada.';
        } else if (error.status === 403 || error.status === 401) {
          errorMessage = 'No tienes permisos para eliminar esta encuesta.';
        } else if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Mostrar mensaje de error
        Swal.fire({
          title: '<div style="display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;"><div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #dc2626); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark" style="font-size: 32px; color: white;"></i></div></div><h2 style="color: #1f2937; font-size: 1.5rem; font-weight: 700; margin: 0;">Error</h2>',
          html: `<p style="color: #4b5563; font-size: 1rem; margin: 0;">${errorMessage}</p>`,
          icon: undefined,
          confirmButtonText: '<i class="fa-solid fa-check me-2"></i>Entendido',
          confirmButtonColor: undefined,
          customClass: {
            popup: 'swal2-popup-custom',
            confirmButton: 'swal2-confirm-custom',
            actions: 'swal2-actions-custom'
          },
          buttonsStyling: false,
          width: '500px'
        });
      }
    });
  }
}


