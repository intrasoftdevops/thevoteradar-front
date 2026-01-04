import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Public & Auth
import { LoginComponent } from './components/login/login.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { EditarPerfilComponent } from './components/editarPerfil/editar-perfil.component';

// Admin Components
import { AdminHomeComponent } from './components/Admin/admin-home/admin-home.component';
import { CrearGerenteComponent } from './components/Admin/crear-gerente/crear-gerente.component';
import { EditarGerenteComponent } from './components/Admin/editar-gerente/editar-gerente.component';
import { VerEquipoAdminComponent } from './components/Admin/ver-equipo-admin/ver-equipo-admin.component';
import { VerPuestoAdminComponent } from './components/Admin/ver-puesto-admin/ver-puesto-admin.component';
import { ConsultarGerenteComponent } from './components/Admin/consultar-gerente/consultar-gerente.component';
import { CrearSupervisorAdminComponent } from './components/Admin/crear-supervisor-admin/crear-supervisor-admin.component';
import { CrearCoordinadorAdminComponent } from './components/Admin/crear-coordinador-admin/crear-coordinador-admin.component';
import { CrearTestigoAdminComponent } from './components/Admin/crear-testigo-admin/crear-testigo-admin.component';
import { CambiarRolGerenteComponent } from './components/Admin/cambiar-rol-gerente/cambiar-rol-gerente.component';

// Admin Backoffice
import { AdminDashboardPageComponent } from './components/Admin/backoffice/admin-dashboard-page/admin-dashboard-page.component';
import { AdminUsersManagementPageComponent } from './components/Admin/backoffice/admin-users-management-page/admin-users-management-page.component';
import { AdminRankingsPageComponent } from './components/Admin/backoffice/admin-rankings-page/admin-rankings-page.component';

// Admin Surveys
import { SurveyDashboardComponent } from './components/Admin/surveys/survey-dashboard/survey-dashboard.component';
import { SurveyBuilderComponent } from './components/Admin/surveys/survey-builder/survey-builder.component';
import { SurveyAnalyticsComponent } from './components/Admin/surveys/survey-analytics/survey-analytics.component';
import { SurveyResponsesComponent } from './components/Admin/surveys/survey-responses/survey-responses.component';
import { VotoOpinionMuestraComponent } from './components/Admin/voto-opinion/muestra/voto-opinion-muestra.component';

// Admin WhatsApp
import { WhatsAppTemplatesDashboardComponent } from './components/Admin/whatsapp/whatsapp-templates-dashboard/whatsapp-templates-dashboard.component';

// Admin Activación
import { ChallengesDashboardComponent } from './components/Admin/activacion/challenges-dashboard/challenges-dashboard.component';

// Gerente Components
import { GerenteHomeComponent } from './components/Gerente/gerente-home/gerente-home.component';
import { CrearSupervisorComponent } from './components/Gerente/crear-supervisor/crear-supervisor.component';
import { VerEquipoGerenteComponent } from './components/Gerente/ver-equipo-gerente/ver-equipo-gerente.component';
import { VerPuestoGerenteComponent } from './components/Gerente/ver-puesto-gerente/ver-puesto-gerente.component';
import { EditarSupervisorComponent } from './components/Gerente/editar-supervisor/editar-supervisor.component';
import { ConsultarSupervisorComponent } from './components/Gerente/consultar-supervisor/consultar-supervisor.component';
import { CrearCoordinadorGerenteComponent } from './components/Gerente/crear-coordinador-gerente/crear-coordinador-gerente.component';
import { CrearTestigoGerenteComponent } from './components/Gerente/crear-testigo-gerente/crear-testigo-gerente.component';

// Supervisor Components
import { SupervisorHomeComponent } from './components/Supervisor/supervisor-home/supervisor-home.component';
import { CrearCoordinadorComponent } from './components/Supervisor/crear-coordinador/crear-coordinador.component';
import { VerEquipoSupervisorComponent } from './components/Supervisor/ver-equipo-supervisor/ver-equipo-supervisor.component';
import { VerPuestoSupervisorComponent } from './components/Supervisor/ver-puesto-supervisor/ver-puesto-supervisor.component';
import { EditarCoordinadorComponent } from './components/Supervisor/editar-coordinador/editar-coordinador.component';
import { ConsultarCoordinadorComponent } from './components/Supervisor/consultar-coordinador/consultar-coordinador.component';
import { CrearTestigoSupervisorComponent } from './components/Supervisor/crear-testigo-supervisor/crear-testigo-supervisor.component';

// Coordinador Components
import { CoordinadorHomeComponent } from './components/Coordinador/coordinador-home/coordinador-home.component';
import { CrearTestigoComponent } from './components/Coordinador/crear-testigo/crear-testigo.component';
import { VerEquipoCoordinadorComponent } from './components/Coordinador/ver-equipo-coordinador/ver-equipo-coordinador.component';
import { VerPuestoCoordinadorComponent } from './components/Coordinador/ver-puesto-coordinador/ver-puesto-coordinador.component';
import { EditarTestigoComponent } from './components/Coordinador/editar-testigo/editar-testigo.component';
import { ConsultarTestigoComponent } from './components/Coordinador/consultar-testigo/consultar-testigo.component';
import { ReporteVotosCoordinadorComponent } from './components/Coordinador/reporte-votos-coordinador/reporte-votos-coordinador.component';
import { ReporteIncidenciasCoordinadorComponent } from './components/Coordinador/reporte-incidencias-coordinador/reporte-incidencias-coordinador.component';
import { ReporteVotosAdminComponent } from './components/Admin/dia-electoral/reporte-votos-admin/reporte-votos-admin.component';

// Testigo Components
import { TestigoHomeComponent } from './components/Testigo/testigo-home/testigo-home.component';
import { ReporteIncidenciasComponent } from './components/Testigo/reporte-incidencias/reporte-incidencias.component';
import { ReporteVotosTestigoComponent } from './components/Testigo/reporte-votos-testigo/reporte-votos-testigo.component';

// Impugnador Components
import { ImpugnarComponent } from './components/Impugnador/impugnar/impugnar.component';
import { ImpugnadorHomeComponent } from './components/Impugnador/impugnador-home/impugnador-home.component';
import { ImpugnacionesComponent } from './components/AdministradorImpugnaciones/impugnaciones/impugnaciones.component';
import { MenuAdministradorImpugnacionesComponent } from './components/AdministradorImpugnaciones/menu-administrador-impugnaciones/menu-administrador-impugnaciones.component';

// Public
import { SurveyLandingComponent } from './components/public/survey-landing/survey-landing.component';
import { ShortLinkRedirectComponent } from './components/public/short-link-redirect/short-link-redirect.component';

// Layout
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

// Guards
import { AuthGuard } from './guards/AuthGuard/auth.guard';
import { LogoutGuard } from './guards/LogoutGuard/logout.guard';
import { ShortCodeGuard } from './guards/ShortCodeGuard/short-code.guard';

const routes: Routes = [
  // ============================================
  // RUTAS PÚBLICAS
  // ============================================
  {
    path: '',
    component: LoginComponent,
    canActivate: [LogoutGuard]
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  {
    path: 'survey/:surveyId',
    component: SurveyLandingComponent
  },

  // ============================================
  // ============================================
  // ADMIN - INICIO (Ruta principal simplificada)
  // ============================================
  {
    path: 'inicio',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { rol: [1] },
    children: [
      { path: '', component: AdminHomeComponent, pathMatch: 'full' }
    ]
  },

  // ADMIN - NUEVO LAYOUT CON SIDEBAR
  // ============================================
  {
    path: 'panel',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { rol: [1] },
    children: [
      // Redirección por defecto
      { path: '', redirectTo: '/inicio', pathMatch: 'full' },
      
      // Inicio
      { path: 'inicio', component: AdminHomeComponent },
      
      // === ESTRUCTURA ===
      { path: 'estructura', component: AdminRankingsPageComponent },
      { path: 'estructura/rankings', component: AdminRankingsPageComponent },
      { path: 'estructura/usuarios', component: AdminUsersManagementPageComponent },
      { path: 'estructura/dashboard', component: AdminDashboardPageComponent },
      { path: 'estructura/equipo', component: VerEquipoAdminComponent },
      { path: 'estructura/estadisticas', component: VerPuestoAdminComponent },
      
      // Gestión de usuarios por rol
      { path: 'usuarios/gerentes', component: ConsultarGerenteComponent },
      { path: 'usuarios/gerente/crear', component: CrearGerenteComponent },
      { path: 'usuarios/gerente/editar/:id', component: EditarGerenteComponent },
      { path: 'usuarios/gerente/cambiar-rol/:id', component: CambiarRolGerenteComponent },
      { path: 'usuarios/supervisores', component: ConsultarSupervisorComponent },
      { path: 'usuarios/supervisor/crear', component: CrearSupervisorAdminComponent },
      { path: 'usuarios/supervisor/editar/:id', component: EditarSupervisorComponent },
      { path: 'usuarios/coordinadores', component: ConsultarCoordinadorComponent },
      { path: 'usuarios/coordinador/crear', component: CrearCoordinadorAdminComponent },
      { path: 'usuarios/coordinador/editar/:id', component: EditarCoordinadorComponent },
      { path: 'usuarios/testigos', component: ConsultarTestigoComponent },
      { path: 'usuarios/testigo/crear', component: CrearTestigoAdminComponent },
      { path: 'usuarios/testigo/editar/:id', component: EditarTestigoComponent },
      
      // === ACTIVACIÓN ===
      { path: 'activacion', redirectTo: 'activacion/challenges', pathMatch: 'full' },
      { path: 'activacion/challenges', component: ChallengesDashboardComponent },
      { path: 'activacion/whatsapp', component: WhatsAppTemplatesDashboardComponent },
      
      // === INTENCIÓN DE VOTO ===
      { path: 'encuestas', component: SurveyDashboardComponent },
      { path: 'encuestas/crear/:surveyId', component: SurveyBuilderComponent },
      { path: 'encuestas/analytics/:surveyId', component: SurveyAnalyticsComponent },
      { path: 'encuestas/respuestas/:surveyId', component: SurveyResponsesComponent },

      // === VOTO DE OPINIÓN ===
      { path: 'voto-opinion/muestra', component: VotoOpinionMuestraComponent },
      
      // === DÍA ELECTORAL ===
      { path: 'dia-electoral', redirectTo: 'dia-electoral/reportes', pathMatch: 'full' },
      { path: 'dia-electoral/reportes', component: ReporteVotosAdminComponent },
      
      // === CONFIGURACIÓN ===
      { path: 'configuracion', redirectTo: 'configuracion/perfil', pathMatch: 'full' },
      { path: 'configuracion/perfil', component: EditarPerfilComponent },
    ]
  },

  // ============================================
  // REDIRECTS DE RUTAS LEGACY A NUEVO PANEL
  // ============================================
  { path: 'adminHome', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'admin/surveys', redirectTo: 'panel/encuestas', pathMatch: 'full' },
  { path: 'admin/backoffice/dashboard', redirectTo: 'panel/estructura/dashboard', pathMatch: 'full' },
  { path: 'admin/backoffice/users', redirectTo: 'panel/estructura/usuarios', pathMatch: 'full' },
  { path: 'admin/backoffice/rankings', redirectTo: 'panel/estructura', pathMatch: 'full' },
  { path: 'admin/whatsapp/templates', redirectTo: 'panel/activacion/whatsapp', pathMatch: 'full' },
  { path: 'panel/configuracion/whatsapp', redirectTo: 'panel/activacion/whatsapp', pathMatch: 'full' },
  { path: 'crearGerente', redirectTo: 'panel/usuarios/gerente/crear', pathMatch: 'full' },
  { path: 'consultarGerente', redirectTo: 'panel/usuarios/gerentes', pathMatch: 'full' },
  { path: 'crearSupervisorAdmin', redirectTo: 'panel/usuarios/supervisor/crear', pathMatch: 'full' },
  { path: 'crearCoordinadorAdmin', redirectTo: 'panel/usuarios/coordinador/crear', pathMatch: 'full' },
  { path: 'crearTestigoAdmin', redirectTo: 'panel/usuarios/testigo/crear', pathMatch: 'full' },
  { path: 'consultarEquipoAdmin', redirectTo: 'panel/estructura/equipo', pathMatch: 'full' },
  { path: 'estadisticasEquipoAdmin', redirectTo: 'panel/estructura/estadisticas', pathMatch: 'full' },
  { path: 'editarPerfil', redirectTo: 'panel/configuracion/perfil', pathMatch: 'full' },

  // ============================================
  // LAYOUT PRINCIPAL PARA ROLES (MainLayout)
  // Aplicado a TESTIGO y COORDINADOR
  // ============================================
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // TESTIGO
      { path: 'testigoHome', component: TestigoHomeComponent, data: { rol: [5] } },
      { path: 'reporteIncidencias', component: ReporteIncidenciasComponent, data: { rol: [5] } },
      { path: 'reporteVotosTestigo', component: ReporteVotosTestigoComponent, data: { rol: [5] } },
      
      // COORDINADOR
      { path: 'coordinadorHome', component: CoordinadorHomeComponent, data: { rol: [4] } },
      { path: 'crearTestigo', component: CrearTestigoComponent, data: { rol: [4] } },
      { path: 'consultarEquipoCoordinador', component: VerEquipoCoordinadorComponent, data: { rol: [4] } },
      { path: 'estadisticasEquipoCoordinador', component: VerPuestoCoordinadorComponent, data: { rol: [4] } },
      { path: 'editarTestigo/:id', component: EditarTestigoComponent, data: { rol: [4] } },
      { path: 'consultarTestigo', component: ConsultarTestigoComponent, data: { rol: [1, 2, 3, 4] } },
      { path: 'reporteVotosCoordinador', component: ReporteVotosCoordinadorComponent, data: { rol: [4] } },
      { path: 'reporteIncidenciasCoordinador', component: ReporteIncidenciasCoordinadorComponent, data: { rol: [4] } },
      
      // SUPERVISOR
      { path: 'supervisorHome', component: SupervisorHomeComponent, data: { rol: [3] } },
      { path: 'crearCoordinador', component: CrearCoordinadorComponent, data: { rol: [3] } },
      { path: 'consultarEquipoSupervisor', component: VerEquipoSupervisorComponent, data: { rol: [3] } },
      { path: 'estadisticasEquipoSupervisor', component: VerPuestoSupervisorComponent, data: { rol: [3] } },
      { path: 'editarCoordinador/:id', component: EditarCoordinadorComponent, data: { rol: [3] } },
      { path: 'consultarCoordinador', component: ConsultarCoordinadorComponent, data: { rol: [1, 2, 3] } },
      { path: 'crearTestigoSupervisor', component: CrearTestigoSupervisorComponent, data: { rol: [3] } },
      
      // GERENTE
      { path: 'gerenteHome', component: GerenteHomeComponent, data: { rol: [2] } },
      { path: 'crearSupervisor', component: CrearSupervisorComponent, data: { rol: [2] } },
      { path: 'consultarEquipoGerente', component: VerEquipoGerenteComponent, data: { rol: [2] } },
      { path: 'estadisticasEquipoGerente', component: VerPuestoGerenteComponent, data: { rol: [2] } },
      { path: 'editarSupervisor/:id', component: EditarSupervisorComponent, data: { rol: [2] } },
      { path: 'consultarSupervisor', component: ConsultarSupervisorComponent, data: { rol: [1, 2] } },
      { path: 'crearCoordinadorGerente', component: CrearCoordinadorGerenteComponent, data: { rol: [2] } },
      { path: 'crearTestigoGerente', component: CrearTestigoGerenteComponent, data: { rol: [2] } },
      
      // ADMIN_IMPUGNACIONES
      { path: 'menu-admin-impugnaciones', component: MenuAdministradorImpugnacionesComponent, data: { rol: [7] } },
      { path: 'administrar-impugnaciones', component: ImpugnacionesComponent, data: { rol: [7] } },
      
      // IMPUGNADOR
      { path: 'impugnadorHome', component: ImpugnadorHomeComponent, data: { rol: [8] } },
      { path: 'impugnar', component: ImpugnarComponent, data: { rol: [8] } },
    ]
  },

  // ============================================
  // GERENTE - MOVIDO A MainLayoutComponent (arriba)
  // ============================================

  // ============================================
  // SUPERVISOR - MOVIDO A MainLayoutComponent (arriba)
  // ============================================

  // ============================================
  // COORDINADOR - MOVIDO A MainLayoutComponent (arriba)
  // ============================================

  // ============================================
  // IMPUGNADOR y ADMIN_IMPUGNACIONES - MOVIDOS A MainLayoutComponent (arriba)
  // ============================================

  // ============================================
  // WILDCARDS
  // ============================================
  {
    path: ':shortCode',
    component: ShortLinkRedirectComponent,
    canActivate: [ShortCodeGuard],
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
