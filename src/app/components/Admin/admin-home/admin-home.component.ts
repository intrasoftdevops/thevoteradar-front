import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, retry, tap, finalize, delay } from 'rxjs/operators';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { SurveyService } from '../../../services/survey/survey.service';
import { ChallengeService } from '../../../core/services/challenge.service';
import { ApiService, ChallengeApiResponse } from '../../../services/api/api.service';
import { RankingUser, LocationsResponse } from '../../../services/backoffice-admin/backoffice-admin.types';

interface Leader {
  user_id: string;
  name: string;
  points: number;
  position: number;
  avatar?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'upcoming';
  participants: number;
  endDate?: string;
  puntos?: number;
  max_users?: number;
  date_creation?: string;
}

interface RecentSurvey {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  responsesCount: number;
}

interface DashboardStats {
  totalUsers: number;
  totalPoints: number;
  activeChallenges: number;
  totalSurveys: number;
}

interface CityData {
  city: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  
  // Estadísticas generales
  stats: DashboardStats = {
    totalUsers: 0,
    totalPoints: 0,
    activeChallenges: 0,
    totalSurveys: 0
  };
  statsLoading = false;

  // Líderes activos
  leaders: Leader[] = [];
  leadersLoading = false;
  leadersError: string | null = null;

  // Rankings completo
  globalRanking: RankingUser[] = [];
  cityRanking: RankingUser[] = [];
  stateRanking: RankingUser[] = [];
  locations: LocationsResponse | null = null;
  rankingLoading = false;
  rankingError: string | null = null;
  activeRankingTab: 'global' | 'city' | 'state' = 'global';
  selectedCity = '';
  selectedState = '';
  selectedUser: RankingUser | null = null;

  // Challenges/Retos
  challenges: Challenge[] = [];
  challengesLoading = false;
  challengesError: string | null = null;

  private subscriptions: Subscription[] = [];
  hasChallengesEndpoint = false;

  // Encuestas recientes
  recentSurveys: RecentSurvey[] = [];
  surveysLoading = false;
  surveysError: string | null = null;

  // Datos para el pie chart de ciudades
  cityChartData: CityData[] = [];
  cityChartColors = [
    '#FF6384', // Rosa
    '#36A2EB', // Azul
    '#FFCE56', // Amarillo
    '#4BC0C0', // Turquesa
    '#9966FF', // Púrpura
    '#FF9F40', // Naranja
    '#FF6384', // Rosa (repetir si hay más de 6 ciudades)
    '#C9CBCF'  // Gris
  ];

  constructor(
    private router: Router,
    private backofficeService: BackofficeAdminService,
    private surveyService: SurveyService,
    private apiService: ApiService,
    private challengeService: ChallengeService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Regla Home: solo mostrar encuestas activas/publicadas en "Últimas 3 encuestas"
   * Backend legacy puede enviar "active" (equivale a published).
   */
  private isSurveyActiveOrPublished(survey: any): boolean {
    const raw = (survey?.status || '').toString().trim().toLowerCase();
    if (raw === 'inactive' || raw === 'archived' || raw === 'archivada') return false;
    if (survey?.is_draft) return false;
    return raw === 'published' || raw === 'publicada' || raw === 'active' || raw === 'activa' || raw === 'open' || raw === 'opened';
  }

  ngOnInit(): void {
    // Cargar todos los datos de manera paralela pero con retry logic
    this.loadAllDataWithRetry();
  }

  /**
   * Carga todos los datos con retry logic para mayor estabilidad
   */
  loadAllDataWithRetry(): void {
    
    // Preparar todas las peticiones con retry y manejo de errores individual
    const stats$ = this.backofficeService.getUserStatistics().pipe(
      retry(2), // Reintentar 2 veces si falla
      tap((statistics) => {
        this.stats.totalUsers = statistics.total_users;
        if (statistics.users_by_city) {
          this.processCityChartData(statistics.users_by_city);
        }
      }),
      catchError((err) => {
        console.error('❌ AdminHome - Error al cargar estadísticas:', err);
        this.stats.totalUsers = 0;
        this.cityChartData = [];
        return of(null); // Retornar observable vacío para no romper forkJoin
      })
    );

    const leaders$ = this.backofficeService.getGlobalRanking({ limit: 5 }).pipe(
      retry(2),
      tap((response) => {
        this.leaders = (response.leaderboard || []).slice(0, 5).map((user) => ({
          user_id: user.phone || '',
          name: `${user.name || ''} ${user.lastname || ''}`.trim() || 'Usuario',
          points: user.points || 0,
          position: user.rank || 0,
          avatar: undefined
        }));
      }),
      catchError((err) => {
        console.error('❌ AdminHome - Error al cargar líderes:', err);
        this.leaders = [];
        this.leadersError = 'No se pudieron cargar los líderes';
        return of(null);
      })
    );

    const challenges$ = this.apiService.getMyChallenges().pipe(
      retry(2),
      tap((response: ChallengeApiResponse[]) => {
        const activeChallenges = response.filter((c) => c.status === 'active');
        this.challenges = activeChallenges
          .sort((a, b) => {
            const dateA = new Date(a.date_creation || 0).getTime();
            const dateB = new Date(b.date_creation || 0).getTime();
            return dateB - dateA;
          })
          .map((challenge) => ({
            id: challenge.challenge_id,
            title: challenge.name,
            description: challenge.description || '',
            status: challenge.status as 'active' | 'completed' | 'upcoming',
            participants: challenge.max_users || 0,
            endDate: challenge.max_date,
            puntos: challenge.puntos,
            max_users: challenge.max_users,
            date_creation: challenge.date_creation
          }))
          .slice(0, 3);
        this.stats.activeChallenges = activeChallenges.length;
        this.hasChallengesEndpoint = true;
      }),
      catchError((err) => {
        console.error('❌ AdminHome - Error al cargar challenges:', err);
        this.challenges = [];
        this.challengesError = 'No se pudieron cargar los challenges';
        this.stats.activeChallenges = 0;
        return of(null);
      })
    );

    const surveys$ = this.surveyService.getSurveys().pipe(
      retry(2),
      tap((surveys) => {
        const activeSurveys = (surveys || []).filter(s => this.isSurveyActiveOrPublished(s));

        this.recentSurveys = activeSurveys
          .sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 3)
          .map(survey => ({
            id: survey.id || '',
            title: survey.title || 'Sin título',
            description: survey.description,
            createdAt: survey.created_at || '',
            responsesCount: survey.recipients_count || 0
          }));
        this.stats.totalSurveys = surveys.length;
      }),
      catchError((err) => {
        // Solo loguear errores que no sean 401 (esperados si el usuario no tiene permisos)
        if (err.status !== 401) {
          console.error('❌ AdminHome - Error al cargar encuestas:', err);
        }
        this.recentSurveys = [];
        this.surveysError = 'No se pudieron cargar las encuestas';
        return of(null);
      })
    );

    const ranking$ = this.backofficeService.getGlobalRanking({ limit: 100 }).pipe(
      retry(2),
      tap((response) => {
        this.stats.totalPoints = (response.leaderboard || []).reduce((sum, user) => sum + user.points, 0);
      }),
      catchError((err) => {
        console.error('❌ AdminHome - Error al cargar ranking:', err);
        this.stats.totalPoints = 0;
        return of(null);
      })
    );

    // Ejecutar todas las peticiones en paralelo con forkJoin
    // forkJoin espera a que todas terminen (o fallen) antes de completar
    this.statsLoading = true;
    this.leadersLoading = true;
    this.challengesLoading = true;
    this.surveysLoading = true;

    const allData$ = forkJoin({
      stats: stats$,
      leaders: leaders$,
      challenges: challenges$,
      surveys: surveys$,
      ranking: ranking$
    }).pipe(
      finalize(() => {
        // Esto se ejecuta SIEMPRE al final, sin importar si fue éxito o error
        this.statsLoading = false;
        this.leadersLoading = false;
        this.challengesLoading = false;
        this.surveysLoading = false;
        this.cdr.detectChanges();
      })
    );

    const sub = allData$.subscribe({
      next: (results) => {
        this.loadRankings(); // Cargar rankings interactivos después
      },
      error: (err) => {
        console.error('❌ AdminHome - Error general en carga de datos:', err);
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  /**
   * Procesar datos de ciudades para el pie chart
   */
  processCityChartData(usersByCity: Record<string, number>): void {
    // Validar que el objeto no esté vacío
    if (!usersByCity || Object.keys(usersByCity).length === 0) {
      this.cityChartData = [];
      return;
    }
    
    // Filtrar N/A y entradas inválidas
    const entries = Object.entries(usersByCity)
      .filter(([city, count]) => city && city !== 'N/A' && count > 0);
    
    if (entries.length === 0) {
      this.cityChartData = [];
      return;
    }
    
    // Ordenar por cantidad (mayor a menor) y tomar top 6
    const top6 = entries
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
    
    // Calcular el total SOLO de las top 6 ciudades para que los porcentajes sumen 100%
    const top6Total = top6.reduce((sum, [, count]) => sum + count, 0);
    
    if (top6Total === 0) {
      this.cityChartData = [];
      return;
    }
    
    // Recalcular porcentajes basándose solo en las top 6
    this.cityChartData = top6.map(([city, count], index) => ({
      city,
      count,
      percentage: (count / top6Total) * 100,
      color: this.cityChartColors[index % this.cityChartColors.length]
    }));
  }

  /**
   * Generar el gradiente cónico para el pie chart
   */
  getPieChartGradient(): string {
    if (this.cityChartData.length === 0) {
      return 'conic-gradient(#e0e0e0 0deg 360deg)';
    }

    let gradientStops: string[] = [];
    let currentAngle = 0;

    // Calcular la suma total de porcentajes para normalizar
    const totalPercentage = this.cityChartData.reduce((sum, data) => sum + data.percentage, 0);
    
    // Si los porcentajes no suman exactamente 100%, normalizar
    const normalizationFactor = totalPercentage > 0 ? 100 / totalPercentage : 1;

    this.cityChartData.forEach((data, index) => {
      // Normalizar el porcentaje para asegurar que sume 100%
      const normalizedPercentage = data.percentage * normalizationFactor;
      const angle = (normalizedPercentage / 100) * 360;
      const nextAngle = currentAngle + angle;
      
      // Para el último elemento, asegurar que llegue exactamente a 360deg
      const finalAngle = index === this.cityChartData.length - 1 ? 360 : nextAngle;
      
      gradientStops.push(`${data.color} ${currentAngle}deg ${finalAngle}deg`);
      currentAngle = finalAngle;
    });

    return `conic-gradient(${gradientStops.join(', ')})`;
  }

  /**
   * Cargar rankings completos
   */
  loadRankings(): void {
    this.rankingLoading = true;

    // Suscribirse a los observables del servicio
    const globalSub = this.backofficeService.globalRanking$.subscribe(ranking => {
      this.globalRanking = ranking.slice(0, 10); // Solo los top 10 para el home
      this.rankingLoading = false;
    });

    const citySub = this.backofficeService.cityRanking$.subscribe(ranking => {
      this.cityRanking = ranking.slice(0, 10);
    });

    const stateSub = this.backofficeService.stateRanking$.subscribe(ranking => {
      this.stateRanking = ranking.slice(0, 10);
    });

    const locationsSub = this.backofficeService.locations$.subscribe(locations => {
      this.locations = locations;
    });

    const errorSub = this.backofficeService.error$.subscribe(error => {
      this.rankingError = error;
      if (error) {
        this.rankingLoading = false;
      }
    });

    this.subscriptions.push(globalSub, citySub, stateSub, locationsSub, errorSub);

    // Cargar ubicaciones y ranking global
    this.backofficeService.fetchLocations();
    this.backofficeService.fetchGlobalRanking({ limit: 10 });
  }


  /**
   * Navegar a rankings
   */
  goToRankings(): void {
    this.router.navigate(['/panel/estructura']);
  }

  /**
   * Navegar a challenges
   */
  goToChallenges(): void {
    this.router.navigate(['/panel/activacion']);
  }

  /**
   * Navegar a encuestas
   */
  goToSurveys(): void {
    this.router.navigate(['/panel/encuestas']);
  }

  /**
   * Navegar a crear encuesta
   */
  createSurvey(): void {
    this.router.navigate(['/panel/encuestas/crear/new']);
  }

  /**
   * Ver detalles de encuesta
   */
  viewSurvey(surveyId: string): void {
    this.router.navigate(['/panel/encuestas/analytics', surveyId]);
  }

  // ========================================
  // MÉTODOS PARA RANKINGS
  // ========================================

  /**
   * Obtener el ranking actual según el tab activo
   */
  getCurrentRanking(): RankingUser[] {
    switch (this.activeRankingTab) {
      case 'city':
        return this.cityRanking;
      case 'state':
        return this.stateRanking;
      default:
        return this.globalRanking;
    }
  }

  /**
   * Cambiar el tab activo del ranking
   */
  setActiveRankingTab(tab: 'global' | 'city' | 'state'): void {
    this.activeRankingTab = tab;
    if (tab === 'global') {
      this.backofficeService.fetchGlobalRanking({ limit: 10 }, true);
    }
  }

  /**
   * Cargar ranking por ciudad
   */
  handleCityRanking(): void {
    if (this.selectedCity) {
      this.backofficeService.fetchCityRanking({ city: this.selectedCity, limit: 10 }, true);
      this.activeRankingTab = 'city';
    }
  }

  /**
   * Cargar ranking por estado
   */
  handleStateRanking(): void {
    if (this.selectedState) {
      this.backofficeService.fetchStateRanking({ state: this.selectedState, limit: 10 }, true);
      this.activeRankingTab = 'state';
    }
  }

  /**
   * Limpiar filtros de ranking
   */
  handleClearRankingFilters(): void {
    this.selectedCity = '';
    this.selectedState = '';
    this.activeRankingTab = 'global';
    this.backofficeService.fetchGlobalRanking({ limit: 10 }, true);
  }

  /**
   * Obtener color de posición para el ranking
   */
  getPositionColor(rank: number): string {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return '';
  }

  /**
   * Obtener estilo de posición para el ranking
   */
  getPositionStyle(rank: number): any {
    if (rank > 3) {
      return {
        'background-color': 'rgba(var(--color-primary-rgb), 0.1)',
        'color': 'var(--color-primary)',
        'border-color': 'rgba(var(--color-primary-rgb), 0.3)'
      };
    }
    return {};
  }

  /**
   * Convertir texto a Title Case
   */
  toTitleCase(text: string | null | undefined): string {
    if (!text) return '';
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Abrir detalles de usuario
   */
  openUserDetails(user: RankingUser): void {
    this.selectedUser = user;
  }

  /**
   * Cerrar detalles de usuario
   */
  closeUserDetails(): void {
    this.selectedUser = null;
  }

  /**
   * Contactar por WhatsApp
   */
  handleWhatsAppContact(phone: string | null): void {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  /**
   * Obtener título del ranking actual
   */
  getRankingTitle(): string {
    switch (this.activeRankingTab) {
      case 'city':
        return `Ranking - ${this.selectedCity}`;
      case 'state':
        return `Ranking - ${this.selectedState}`;
      default:
        return 'Ranking Global';
    }
  }
}
