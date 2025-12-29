import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalDataService } from '../localData/local-data.service';
import {
  User,
  PaginatedUsersResponse,
  RankingUser,
  GlobalRankingResponse,
  CityRankingResponse,
  StateRankingResponse,
  LocationsResponse,
  UserStatistics,
  UsersQueryParams,
  CityUsersQueryParams,
  StateUsersQueryParams,
  RankingQueryParams,
  CityRankingQueryParams,
  StateRankingQueryParams
} from './backoffice-admin.types';

@Injectable({
  providedIn: 'root'
})
export class BackofficeAdminService {
  private backofficeUrl = environment.backofficeApiURL || '';

  // State management with BehaviorSubjects
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private nextCursorSubject = new BehaviorSubject<string | undefined>(undefined);
  public nextCursor$ = this.nextCursorSubject.asObservable();

  private hasMoreSubject = new BehaviorSubject<boolean>(true);
  public hasMore$ = this.hasMoreSubject.asObservable();

  // Rankings state
  private globalRankingSubject = new BehaviorSubject<RankingUser[]>([]);
  public globalRanking$ = this.globalRankingSubject.asObservable();

  private cityRankingSubject = new BehaviorSubject<RankingUser[]>([]);
  public cityRanking$ = this.cityRankingSubject.asObservable();

  private stateRankingSubject = new BehaviorSubject<RankingUser[]>([]);
  public stateRanking$ = this.stateRankingSubject.asObservable();

  private globalCursorSubject = new BehaviorSubject<string | null>(null);
  public globalCursor$ = this.globalCursorSubject.asObservable();

  private cityCursorSubject = new BehaviorSubject<string | null>(null);
  public cityCursor$ = this.cityCursorSubject.asObservable();

  private stateCursorSubject = new BehaviorSubject<string | null>(null);
  public stateCursor$ = this.stateCursorSubject.asObservable();

  private hasMoreGlobalSubject = new BehaviorSubject<boolean>(false);
  public hasMoreGlobal$ = this.hasMoreGlobalSubject.asObservable();

  private hasMoreCitySubject = new BehaviorSubject<boolean>(false);
  public hasMoreCity$ = this.hasMoreCitySubject.asObservable();

  private hasMoreStateSubject = new BehaviorSubject<boolean>(false);
  public hasMoreState$ = this.hasMoreStateSubject.asObservable();

  // Locations state
  private locationsSubject = new BehaviorSubject<LocationsResponse | null>(null);
  public locations$ = this.locationsSubject.asObservable();

  // Statistics state
  private statisticsSubject = new BehaviorSubject<UserStatistics | null>(null);
  public statistics$ = this.statisticsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private localData: LocalDataService
  ) { }

  private getHeaders(): HttpHeaders {
    // Usar el token de backoffice si está disponible, sino el token regular
    const token = this.localData.getBackofficeToken() || this.localData.getToken() || localStorage.getItem('access_token');
    // Para peticiones protegidas: solo se envía el token
    // El tenant_id viene dentro del token JWT, no se necesita X-Tenant-ID
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    const errorMessage = error.error?.detail || error.message || 'Error desconocido';
    this.errorSubject.next(errorMessage);
    console.error('Error:', error);
    return throwError(() => error);
  }

  // Users API methods
  getAllUsers(params: UsersQueryParams = {}): Observable<PaginatedUsersResponse> {
    let httpParams = new HttpParams();
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }

    return this.http.get<PaginatedUsersResponse>(
      `${this.backofficeUrl}/super-admin/users`,
      { headers: this.getHeaders(), params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getUsersByCity(params: CityUsersQueryParams): Observable<PaginatedUsersResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('city', params.city);
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }

    return this.http.get<PaginatedUsersResponse>(
      `${this.backofficeUrl}/super-admin/users/by-city`,
      { headers: this.getHeaders(), params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getUsersByState(params: StateUsersQueryParams): Observable<PaginatedUsersResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('state', params.state);
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }

    return this.http.get<PaginatedUsersResponse>(
      `${this.backofficeUrl}/super-admin/users/by-state`,
      { headers: this.getHeaders(), params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Rankings API methods
  getGlobalRanking(params: RankingQueryParams = {}): Observable<GlobalRankingResponse> {
    let httpParams = new HttpParams();
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }

    return this.http.get<GlobalRankingResponse>(
      `${this.backofficeUrl}/leaderboard/cursor/global`,
      { headers: this.getHeaders(), params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getCityRanking(params: CityRankingQueryParams): Observable<CityRankingResponse> {
    let httpParams = new HttpParams();
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }

    return this.http.get<CityRankingResponse>(
      `${this.backofficeUrl}/leaderboard/cursor/city/${encodeURIComponent(params.city)}`,
      { headers: this.getHeaders(), params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getStateRanking(params: StateRankingQueryParams): Observable<StateRankingResponse> {
    let httpParams = new HttpParams();
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }

    return this.http.get<StateRankingResponse>(
      `${this.backofficeUrl}/leaderboard/cursor/state/${encodeURIComponent(params.state)}`,
      { headers: this.getHeaders(), params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Locations API method
  getLocations(): Observable<LocationsResponse> {
    return this.http.get<LocationsResponse>(
      `${this.backofficeUrl}/super-admin/lists/locations`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Statistics API method
  getUserStatistics(): Observable<UserStatistics> {
    return this.http.get<UserStatistics>(
      `${this.backofficeUrl}/super-admin/statistics/users`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Statistics API method (SILENT)
   * No toca `loading$`/`error$` globales para evitar conflictos cuando se embebe el dashboard
   * junto con otras vistas (ej: Estructura > Usuarios).
   */
  getUserStatisticsSilent(): Observable<UserStatistics> {
    return this.http.get<UserStatistics>(
      `${this.backofficeUrl}/super-admin/statistics/users`,
      { headers: this.getHeaders() }
    );
  }

  // State management methods for users
  fetchUsers(params: UsersQueryParams = {}, reset: boolean = true): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.getAllUsers(params).pipe(take(1)).subscribe({
      next: (response) => {
        if (reset) {
          this.usersSubject.next(response.users);
        } else {
          const currentUsers = this.usersSubject.value;
          this.usersSubject.next([...currentUsers, ...response.users]);
        }
        this.nextCursorSubject.next(response.next_page_cursor);
        this.hasMoreSubject.next(!!response.next_page_cursor);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.loadingSubject.next(false);
      }
    });
  }

  loadMoreUsers(): void {
    const cursor = this.nextCursorSubject.value;
    const loading = this.loadingSubject.value;
    if (cursor && !loading) {
      this.fetchUsers({ cursor }, false);
    }
  }

  refreshUsers(): void {
    this.fetchUsers({}, true);
  }

  // State management methods for rankings
  fetchGlobalRanking(params: RankingQueryParams = {}, reset: boolean = true): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.getGlobalRanking(params).pipe(take(1)).subscribe({
      next: (response) => {
        if (reset) {
          this.globalRankingSubject.next(response.leaderboard);
        } else {
          const currentRanking = this.globalRankingSubject.value;
          this.globalRankingSubject.next([...currentRanking, ...response.leaderboard]);
        }
        this.globalCursorSubject.next(response.pagination.next_cursor || null);
        this.hasMoreGlobalSubject.next(response.pagination.has_next_page);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.loadingSubject.next(false);
      }
    });
  }

  fetchCityRanking(params: CityRankingQueryParams, reset: boolean = true): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.getCityRanking(params).pipe(take(1)).subscribe({
      next: (response) => {
        if (reset) {
          this.cityRankingSubject.next(response.leaderboard);
        } else {
          const currentRanking = this.cityRankingSubject.value;
          this.cityRankingSubject.next([...currentRanking, ...response.leaderboard]);
        }
        this.cityCursorSubject.next(response.pagination.next_cursor || null);
        this.hasMoreCitySubject.next(response.pagination.has_next_page);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.loadingSubject.next(false);
      }
    });
  }

  fetchStateRanking(params: StateRankingQueryParams, reset: boolean = true): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.getStateRanking(params).pipe(take(1)).subscribe({
      next: (response) => {
        if (reset) {
          this.stateRankingSubject.next(response.leaderboard);
        } else {
          const currentRanking = this.stateRankingSubject.value;
          this.stateRankingSubject.next([...currentRanking, ...response.leaderboard]);
        }
        this.stateCursorSubject.next(response.pagination.next_cursor || null);
        this.hasMoreStateSubject.next(response.pagination.has_next_page);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.loadingSubject.next(false);
      }
    });
  }

  loadMoreGlobalRanking(): void {
    const cursor = this.globalCursorSubject.value;
    const loading = this.loadingSubject.value;
    if (cursor && !loading) {
      this.fetchGlobalRanking({ cursor }, false);
    }
  }

  loadMoreCityRanking(city: string): void {
    const cursor = this.cityCursorSubject.value;
    const loading = this.loadingSubject.value;
    if (cursor && !loading) {
      this.fetchCityRanking({ city, cursor }, false);
    }
  }

  loadMoreStateRanking(state: string): void {
    const cursor = this.stateCursorSubject.value;
    const loading = this.loadingSubject.value;
    if (cursor && !loading) {
      this.fetchStateRanking({ state, cursor }, false);
    }
  }

  // State management methods for locations
  fetchLocations(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.getLocations().pipe(take(1)).subscribe({
      next: (response) => {
        this.locationsSubject.next(response);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.loadingSubject.next(false);
      }
    });
  }

  // State management methods for statistics
  fetchStatistics(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.getUserStatistics().pipe(take(1)).subscribe({
      next: (response) => {
        this.statisticsSubject.next(response);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.loadingSubject.next(false);
      }
    });
  }

  // Getters for current state values
  get users(): User[] {
    return this.usersSubject.value;
  }

  get loading(): boolean {
    return this.loadingSubject.value;
  }

  get error(): string | null {
    return this.errorSubject.value;
  }

  get hasMore(): boolean {
    return this.hasMoreSubject.value;
  }

  get globalRanking(): RankingUser[] {
    return this.globalRankingSubject.value;
  }

  get cityRanking(): RankingUser[] {
    return this.cityRankingSubject.value;
  }

  get stateRanking(): RankingUser[] {
    return this.stateRankingSubject.value;
  }

  get hasMoreGlobal(): boolean {
    return this.hasMoreGlobalSubject.value;
  }

  get hasMoreCity(): boolean {
    return this.hasMoreCitySubject.value;
  }

  get hasMoreState(): boolean {
    return this.hasMoreStateSubject.value;
  }

  get locations(): LocationsResponse | null {
    return this.locationsSubject.value;
  }

  get statistics(): UserStatistics | null {
    return this.statisticsSubject.value;
  }

  // ==========================================
  // ADMIN METHODS - Migrated from voteradar-back
  // ==========================================

  /**
   * Crea un nuevo gerente
   * POST /admin/crear-gerente
   */
  createGerente(data: {
    nombres: string;
    apellidos: string;
    genero_id?: number;
    tipo_documento_id?: number;
    numero_documento: string;
    telefono: string;
    email: string;
    departamento?: string | null;
    municipios?: string[] | null;
    cliente_id?: number;
  }): Observable<any> {
    return this.http.post(
      `${this.backofficeUrl}/admin/crear-gerente`,
      data,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createSupervisor(data: {
    nombres: string;
    apellidos: string;
    genero_id?: number;
    tipo_documento_id?: number;
    numero_documento: string;
    telefono: string;
    email: string;
    municipio?: string | null;
    zonas?: string[] | null;
    cliente_id?: number;
  }): Observable<any> {
    return this.http.post(
      `${this.backofficeUrl}/admin/crear-supervisor`,
      data,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createCoordinador(data: {
    nombres: string;
    apellidos: string;
    genero_id?: number;
    tipo_documento_id?: number;
    numero_documento: string;
    telefono: string;
    email: string;
    zona?: string | null;
    puestos?: string[] | null;
    cliente_id?: number;
  }): Observable<any> {
    return this.http.post(
      `${this.backofficeUrl}/admin/crear-coordinador`,
      data,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createTestigo(data: {
    nombres: string;
    apellidos: string;
    genero_id?: number;
    tipo_documento_id?: number;
    numero_documento: string;
    telefono: string;
    email: string;
    puesto?: string | null;
    mesas?: string[] | null;
    cliente_id?: number;
  }): Observable<any> {
    return this.http.post(
      `${this.backofficeUrl}/admin/crear-testigo`,
      data,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene las zonas de votación de un municipio
   * GET /admin/zonas?codigo_municipio=<codigo>
   */
  getZonasPorMunicipio(codigoMunicipio: string): Observable<any> {
    return this.http.get(
      `${this.backofficeUrl}/admin/zonas?codigo_municipio=${codigoMunicipio}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los puestos de votación de una zona
   * GET /admin/puestos?codigo_zona=<codigo>
   */
  getPuestosPorZona(codigoZona: string): Observable<any> {
    return this.http.get(
      `${this.backofficeUrl}/admin/puestos?codigo_zona=${codigoZona}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene las mesas de votación de un puesto
   * GET /admin/mesas?codigo_puesto=<codigo>
   */
  getMesasPorPuesto(codigoPuesto: string): Observable<any> {
    return this.http.get(
      `${this.backofficeUrl}/admin/mesas?codigo_puesto=${codigoPuesto}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene un gerente por ID
   * GET /admin/get-gerente/{id}
   */
  getGerente(id: string | number): Observable<any> {
    return this.http.get(
      `${this.backofficeUrl}/admin/get-gerente/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualiza un gerente
   * PUT /admin/editar-gerente/{id}
   */
  updateGerente(id: string | number, data: any): Observable<any> {
    return this.http.put(
      `${this.backofficeUrl}/admin/editar-gerente/${id}`,
      data,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los departamentos del administrador actual
   * GET /admin/departamentos
   */
  getDepartamentosAdmin(): Observable<any> {
    return this.http.get(
      `${this.backofficeUrl}/admin/departamentos`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los municipios del administrador actual
   * GET /admin/municipios?codigo_departamento={codigo}
   * @param codigoDepartamento Código del departamento para filtrar municipios (opcional)
   */
  getMunicipiosAdmin(codigoDepartamento?: string): Observable<any> {
    let url = `${this.backofficeUrl}/admin/municipios`;
    if (codigoDepartamento) {
      url += `?codigo_departamento=${encodeURIComponent(codigoDepartamento)}`;
    }
    return this.http.get(
      url,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene el equipo completo del administrador (jerarquía completa)
   * GET /admin/equipo
   */
  getEquipoAdmin(): Observable<any> {
    return this.http.get(
      `${this.backofficeUrl}/admin/equipo`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los gerentes con y sin municipio asignado
   * GET /admin/gerentes-municipio-asignado
   */
  getGerentesMunicipioAsignado(): Observable<any> {
    return this.http.get(
      `${this.backofficeUrl}/admin/gerentes-municipio-asignado`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Lista todos los gerentes
   * GET /admin/gerentes
   */
  getGerentes(): Observable<any> {
    return this.http.get(
      `${this.backofficeUrl}/admin/gerentes`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}

