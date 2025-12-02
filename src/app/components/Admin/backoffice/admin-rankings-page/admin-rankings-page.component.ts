import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackofficeAdminService } from '../../../../services/backoffice-admin/backoffice-admin.service';
import { RankingUser, LocationsResponse } from '../../../../services/backoffice-admin/backoffice-admin.types';

type ActiveTab = 'global' | 'city' | 'state';

@Component({
  selector: 'app-admin-rankings-page',
  templateUrl: './admin-rankings-page.component.html',
  styleUrls: ['./admin-rankings-page.component.scss']
})
export class AdminRankingsPageComponent implements OnInit, OnDestroy {
  globalRanking: RankingUser[] = [];
  cityRanking: RankingUser[] = [];
  stateRanking: RankingUser[] = [];
  locations: LocationsResponse | null = null;
  loading = false;
  error: string | null = null;
  
  hasMoreGlobal = false;
  hasMoreCity = false;
  hasMoreState = false;
  
  activeTab: ActiveTab = 'global';
  selectedCity = '';
  selectedState = '';
  selectedUser: RankingUser | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private adminService: BackofficeAdminService) { }

  ngOnInit(): void {
    // Subscribe to rankings
    const globalSub = this.adminService.globalRanking$.subscribe(ranking => {
      this.globalRanking = ranking;
    });

    const citySub = this.adminService.cityRanking$.subscribe(ranking => {
      this.cityRanking = ranking;
    });

    const stateSub = this.adminService.stateRanking$.subscribe(ranking => {
      this.stateRanking = ranking;
    });

    // Subscribe to loading
    const loadingSub = this.adminService.loading$.subscribe(loading => {
      this.loading = loading;
    });

    // Subscribe to error
    const errorSub = this.adminService.error$.subscribe(error => {
      this.error = error;
    });

    // Subscribe to hasMore flags
    const hasMoreGlobalSub = this.adminService.hasMoreGlobal$.subscribe(hasMore => {
      this.hasMoreGlobal = hasMore;
    });

    const hasMoreCitySub = this.adminService.hasMoreCity$.subscribe(hasMore => {
      this.hasMoreCity = hasMore;
    });

    const hasMoreStateSub = this.adminService.hasMoreState$.subscribe(hasMore => {
      this.hasMoreState = hasMore;
    });

    // Subscribe to locations
    const locationsSub = this.adminService.locations$.subscribe(locations => {
      this.locations = locations;
    });

    this.subscriptions.push(
      globalSub, citySub, stateSub, loadingSub, errorSub,
      hasMoreGlobalSub, hasMoreCitySub, hasMoreStateSub, locationsSub
    );

    // Fetch initial data
    this.adminService.fetchLocations();
    this.adminService.fetchGlobalRanking({ limit: 50 });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  handleCityRanking(): void {
    if (this.selectedCity) {
      this.adminService.fetchCityRanking({ city: this.selectedCity, limit: 50 }, true);
      this.activeTab = 'city';
    }
  }

  handleStateRanking(): void {
    if (this.selectedState) {
      this.adminService.fetchStateRanking({ state: this.selectedState, limit: 50 }, true);
      this.activeTab = 'state';
    }
  }

  handleClearFilters(): void {
    this.selectedCity = '';
    this.selectedState = '';
    this.activeTab = 'global';
    this.adminService.fetchGlobalRanking({ limit: 50 }, true);
  }

  handleWhatsAppContact(phone: string | null): void {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  loadMoreGlobal(): void {
    this.adminService.loadMoreGlobalRanking();
  }

  loadMoreCity(): void {
    if (this.selectedCity) {
      this.adminService.loadMoreCityRanking(this.selectedCity);
    }
  }

  loadMoreState(): void {
    if (this.selectedState) {
      this.adminService.loadMoreStateRanking(this.selectedState);
    }
  }

  getCurrentRanking(): RankingUser[] {
    switch (this.activeTab) {
      case 'city':
        return this.cityRanking;
      case 'state':
        return this.stateRanking;
      default:
        return this.globalRanking;
    }
  }

  getCurrentHasMore(): boolean {
    switch (this.activeTab) {
      case 'city':
        return this.hasMoreCity;
      case 'state':
        return this.hasMoreState;
      default:
        return this.hasMoreGlobal;
    }
  }

  getCurrentLoadMore(): () => void {
    switch (this.activeTab) {
      case 'city':
        return () => this.loadMoreCity();
      case 'state':
        return () => this.loadMoreState();
      default:
        return () => this.loadMoreGlobal();
    }
  }

  getRankingTitle(): string {
    switch (this.activeTab) {
      case 'city':
        return `Ranking - ${this.selectedCity}`;
      case 'state':
        return `Ranking - ${this.selectedState}`;
      default:
        return 'Ranking Global';
    }
  }

  getPositionColor(rank: number): string {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }

  toTitleCase(text: string | null | undefined): string {
    if (!text) return '';
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  openUserDetails(user: RankingUser): void {
    this.selectedUser = user;
  }

  closeUserDetails(): void {
    this.selectedUser = null;
  }

  setActiveTab(tab: ActiveTab): void {
    this.activeTab = tab;
    if (tab === 'global') {
      this.adminService.fetchGlobalRanking({ limit: 50 }, true);
    }
  }
}

