import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackofficeAdminService } from '../../../../services/backoffice-admin/backoffice-admin.service';
import { UserStatistics } from '../../../../services/backoffice-admin/backoffice-admin.types';

@Component({
  selector: 'app-admin-dashboard-page',
  templateUrl: './admin-dashboard-page.component.html',
  styleUrls: ['./admin-dashboard-page.component.scss']
})
export class AdminDashboardPageComponent implements OnInit, OnDestroy {
  /**
   * compact=true: pensado para embebirse dentro de otra pantalla (ej: Estructura > Usuarios)
   * sin el hero/full background y sin pisar estados globales de loading/error.
   */
  @Input() compact = false;

  statistics: UserStatistics | null = null;
  loading = false;
  error: string | null = null;
  topStates: [string, number][] = [];
  topCities: [string, number][] = [];

  private subscriptions: Subscription[] = [];

  constructor(private adminService: BackofficeAdminService) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadStatistics(): void {
    this.loading = true;
    this.error = null;

    const sub = this.adminService.getUserStatisticsSilent().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.calculateTopStates();
        this.calculateTopCities();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ AdminDashboardPage - Error cargando estadísticas:', err);
        this.loading = false;
        this.error = err?.error?.detail || 'No se pudieron cargar las estadísticas';
        this.statistics = null;
        this.topStates = [];
        this.topCities = [];
      }
    });

    this.subscriptions.push(sub);
  }

  private calculateTopStates(): void {
    if (this.statistics?.users_by_state) {
      this.topStates = Object.entries(this.statistics.users_by_state)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    }
  }

  private calculateTopCities(): void {
    if (this.statistics?.users_by_city) {
      this.topCities = Object.entries(this.statistics.users_by_city)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    }
  }

  getPercentage(count: number): number {
    if (!this.statistics?.total_users) return 0;
    return Math.max((count / this.statistics.total_users) * 100, 5);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES');
  }

  getStatesCount(): number {
    return this.statistics?.users_by_state ? Object.keys(this.statistics.users_by_state).length : 0;
  }

  getCitiesCount(): number {
    return this.statistics?.users_by_city ? Object.keys(this.statistics.users_by_city).length : 0;
  }

  getBackgroundPatternStyle(): string {
    const svgPattern = 'data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%230032FD\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E';
    return `url("${svgPattern}")`;
  }
}

