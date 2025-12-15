import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChallengeService, ChallengeApiResponse } from '@core/services/challenge.service';

/**
 * ChallengesDashboardComponent - Dashboard principal de challenges/retos
 * 
 * Funcionalidades:
 * - Listar todos los challenges del usuario
 * - Crear nuevos challenges
 * - Editar challenges existentes
 * - Asignar challenges (tree, direct, user)
 * - Ver usuarios asignados
 * - Confirmar completaciones
 */
@Component({
  selector: 'app-challenges-dashboard',
  templateUrl: './challenges-dashboard.component.html',
  styleUrls: ['./challenges-dashboard.component.scss']
})
export class ChallengesDashboardComponent implements OnInit {
  
  challenges: ChallengeApiResponse[] = [];
  filteredChallenges: ChallengeApiResponse[] = [];
  challengesLoading = false;
  challengesError: string | null = null;
  
  // Filtros
  statusFilter: 'all' | 'active' | 'completed' | 'upcoming' | 'cancelled' = 'all';
  searchQuery: string = '';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;
  
  // Modales
  showCreateModal = false;
  showEditModal = false;
  showAssignModal = false;
  showConfirmModal = false;
  showAssignedUsersModal = false;
  
  selectedChallenge: ChallengeApiResponse | null = null;

  constructor(
    private challengeService: ChallengeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  /**
   * Carga los challenges del usuario autenticado
   */
  loadChallenges(): void {
    this.challengesLoading = true;
    this.challengesError = null;

    this.challengeService.getMyChallenges().subscribe({
      next: (challenges) => {
        console.log('✅ ChallengesDashboard - Challenges cargados:', challenges);
        this.challenges = challenges;
        this.applyFilters();
        this.challengesLoading = false;
      },
      error: (error) => {
        console.error('❌ ChallengesDashboard - Error al cargar challenges:', {
          error,
          status: error?.status,
          message: error?.message,
          errorBody: error?.error
        });

        let errorMessage = 'No se pudieron cargar los challenges';
        if (error?.status === 0 || error?.status === undefined) {
          errorMessage = 'El servicio de challenges no está disponible. Verifica que el backend esté corriendo.';
        } else if (error?.status === 401 || error?.status === 403) {
          errorMessage = 'No tienes permisos para ver los challenges.';
        } else {
          errorMessage = `No se pudieron cargar los challenges (Error: ${error?.status || 'desconocido'})`;
        }
        
        this.challengesError = errorMessage;
        this.challengesLoading = false;
      }
    });
  }

  /**
   * Aplica los filtros y búsqueda a la lista de challenges
   */
  applyFilters(): void {
    let filtered = [...this.challenges];

    // Filtro por status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(challenge => challenge.status === this.statusFilter);
    }

    // Filtro por búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(challenge => 
        challenge.name.toLowerCase().includes(query) ||
        (challenge.description && challenge.description.toLowerCase().includes(query))
      );
    }

    this.filteredChallenges = filtered;
    this.updatePagination();
  }

  /**
   * Actualiza la paginación
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredChallenges.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  /**
   * Obtiene los challenges para la página actual
   */
  getPaginatedChallenges(): ChallengeApiResponse[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredChallenges.slice(startIndex, endIndex);
  }

  /**
   * Cambia de página
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll al inicio de la lista
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Obtiene los números de página para mostrar
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5; // Mostrar máximo 5 números de página
    
    if (this.totalPages <= maxPages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  /**
   * Maneja el cambio en la búsqueda
   */
  onSearchChange(): void {
    this.currentPage = 1; // Reset a la primera página
    this.applyFilters();
  }

  /**
   * Cambia el filtro de status
   */
  changeStatusFilter(status: 'all' | 'active' | 'completed' | 'upcoming' | 'cancelled'): void {
    this.statusFilter = status;
    this.currentPage = 1; // Reset a la primera página
    this.applyFilters();
  }

  /**
   * Abre el modal para ver usuarios asignados
   */
  openAssignedUsersModal(challenge: ChallengeApiResponse): void {
    // Asegurar que solo haya 1 modal abierto a la vez
    this.closeModals();
    this.selectedChallenge = challenge;
    this.showAssignedUsersModal = true;
  }

  /**
   * Abre el modal para crear un nuevo challenge
   */
  openCreateModal(): void {
    // Asegurar que solo haya 1 modal abierto a la vez
    this.closeModals();
    this.showCreateModal = true;
  }

  /**
   * Abre el modal para editar un challenge
   */
  openEditModal(challenge: ChallengeApiResponse): void {
    // Asegurar que solo haya 1 modal abierto a la vez
    this.closeModals();
    this.selectedChallenge = challenge;
    this.showEditModal = true;
  }

  /**
   * Abre el modal para asignar un challenge
   */
  openAssignModal(challenge: ChallengeApiResponse): void {
    // Asegurar que solo haya 1 modal abierto a la vez
    this.closeModals();
    this.selectedChallenge = challenge;
    this.showAssignModal = true;
  }

  /**
   * Abre el modal para confirmar completaciones
   */
  openConfirmModal(challenge: ChallengeApiResponse): void {
    // Asegurar que solo haya 1 modal abierto a la vez
    this.closeModals();
    this.selectedChallenge = challenge;
    this.showConfirmModal = true;
  }

  /**
   * Cierra todos los modales
   */
  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showAssignModal = false;
    this.showConfirmModal = false;
    this.showAssignedUsersModal = false;
    this.selectedChallenge = null;
  }

  /**
   * Obtiene estadísticas de challenges
   */
  getStatistics(): { total: number; active: number; completed: number; upcoming: number } {
    return {
      total: this.challenges.length,
      active: this.challenges.filter(c => c.status === 'active').length,
      completed: this.challenges.filter(c => c.status === 'completed').length,
      upcoming: this.challenges.filter(c => c.status === 'upcoming').length
    };
  }

  /**
   * Obtiene el índice de inicio para la paginación
   */
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  /**
   * Obtiene el índice de fin para la paginación
   */
  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredChallenges.length);
  }

  /**
   * Maneja el evento cuando se crea un challenge exitosamente
   */
  onChallengeCreated(): void {
    this.closeModals();
    this.loadChallenges();
  }

  /**
   * Maneja el evento cuando se actualiza un challenge exitosamente
   */
  onChallengeUpdated(): void {
    this.closeModals();
    this.loadChallenges();
  }

  /**
   * Obtiene el badge class según el status del challenge
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'completed':
        return 'badge bg-secondary';
      case 'upcoming':
        return 'badge bg-info';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  /**
   * Obtiene el texto del status en español
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'upcoming':
        return 'Próximamente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

