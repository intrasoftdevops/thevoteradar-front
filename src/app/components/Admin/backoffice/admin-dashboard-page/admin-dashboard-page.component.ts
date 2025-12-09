import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackofficeAdminService } from '../../../../services/backoffice-admin/backoffice-admin.service';
import { UserStatistics } from '../../../../services/backoffice-admin/backoffice-admin.types';

@Component({
  selector: 'app-admin-dashboard-page',
  templateUrl: './admin-dashboard-page.component.html',
  styleUrls: ['./admin-dashboard-page.component.scss']
})
export class AdminDashboardPageComponent implements OnInit, OnDestroy {
  statistics: UserStatistics | null = null;
  loading = false;
  error: string | null = null;
  topStates: [string, number][] = [];
  topCities: [string, number][] = [];

  private subscriptions: Subscription[] = [];

  constructor(private adminService: BackofficeAdminService) { }

  ngOnInit(): void {
    // Subscribe to statistics
    const statsSub = this.adminService.statistics$.subscribe(stats => {
      this.statistics = stats;
      if (stats) {
        this.calculateTopStates();
        this.calculateTopCities();
      }
    });

    // Subscribe to loading
    const loadingSub = this.adminService.loading$.subscribe(loading => {
      this.loading = loading;
    });

    // Subscribe to error
    const errorSub = this.adminService.error$.subscribe(error => {
      this.error = error;
    });

    this.subscriptions.push(statsSub, loadingSub, errorSub);

    // Fetch statistics
    this.adminService.fetchStatistics();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

