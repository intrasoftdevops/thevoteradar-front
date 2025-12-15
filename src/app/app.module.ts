import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Core & Shared Modules (Nueva arquitectura evolutiva)
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from './layout/layout.module';

// ============================================
// COMPONENTES LEGACY (Se migrarán gradualmente a Feature Modules)
// ============================================

// Auth
import { LoginComponent } from './components/login/login.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';

// Admin Components
import { AdminHomeComponent } from './components/Admin/admin-home/admin-home.component';
import { MenuAdminComponent } from './components/Admin/menu-admin/menu-admin.component';
import { CrearGerenteComponent } from './components/Admin/crear-gerente/crear-gerente.component';
import { EditarGerenteComponent } from './components/Admin/editar-gerente/editar-gerente.component';
import { ConsultarGerenteComponent } from './components/Admin/consultar-gerente/consultar-gerente.component';
import { VerEquipoAdminComponent } from './components/Admin/ver-equipo-admin/ver-equipo-admin.component';
import { VerPuestoAdminComponent } from './components/Admin/ver-puesto-admin/ver-puesto-admin.component';
import { CrearSupervisorAdminComponent } from './components/Admin/crear-supervisor-admin/crear-supervisor-admin.component';
import { CrearCoordinadorAdminComponent } from './components/Admin/crear-coordinador-admin/crear-coordinador-admin.component';
import { CrearTestigoAdminComponent } from './components/Admin/crear-testigo-admin/crear-testigo-admin.component';
import { CambiarRolGerenteComponent } from './components/Admin/cambiar-rol-gerente/cambiar-rol-gerente.component';

// Admin - Surveys
import { SurveyDashboardComponent } from './components/Admin/surveys/survey-dashboard/survey-dashboard.component';
import { SurveyBuilderComponent } from './components/Admin/surveys/survey-builder/survey-builder.component';
import { RecipientsModalComponent } from './components/Admin/surveys/recipients-modal/recipients-modal.component';
import { SurveyAnalyticsComponent } from './components/Admin/surveys/survey-analytics/survey-analytics.component';
import { SurveyResponsesComponent } from './components/Admin/surveys/survey-responses/survey-responses.component';
import { VotoOpinionMuestraComponent } from './components/Admin/voto-opinion/muestra/voto-opinion-muestra.component';

// Admin - Backoffice
import { AdminDashboardPageComponent } from './components/Admin/backoffice/admin-dashboard-page/admin-dashboard-page.component';
import { AdminUsersManagementPageComponent } from './components/Admin/backoffice/admin-users-management-page/admin-users-management-page.component';
import { AdminRankingsPageComponent } from './components/Admin/backoffice/admin-rankings-page/admin-rankings-page.component';

// Admin - WhatsApp
import { WhatsAppTemplatesDashboardComponent } from './components/Admin/whatsapp/whatsapp-templates-dashboard/whatsapp-templates-dashboard.component';
import { SendTemplateModalComponent } from './components/Admin/whatsapp/send-template-modal/send-template-modal.component';

// Admin - Activación
import { ChallengesDashboardComponent } from './components/Admin/activacion/challenges-dashboard/challenges-dashboard.component';
import { CreateChallengeModalComponent } from './components/Admin/activacion/challenges-dashboard/create-challenge-modal/create-challenge-modal.component';
import { EditChallengeModalComponent } from './components/Admin/activacion/challenges-dashboard/edit-challenge-modal/edit-challenge-modal.component';
import { AssignChallengeModalComponent } from './components/Admin/activacion/challenges-dashboard/assign-challenge-modal/assign-challenge-modal.component';
import { ConfirmCompletionsModalComponent } from './components/Admin/activacion/challenges-dashboard/confirm-completions-modal/confirm-completions-modal.component';
import { AssignedUsersModalComponent } from './components/Admin/activacion/challenges-dashboard/assigned-users-modal/assigned-users-modal.component';

// Gerente Components
import { GerenteHomeComponent } from './components/Gerente/gerente-home/gerente-home.component';
import { MenuGerenteComponent } from './components/Gerente/menu-gerente/menu-gerente.component';
import { CrearSupervisorComponent } from './components/Gerente/crear-supervisor/crear-supervisor.component';
import { EditarSupervisorComponent } from './components/Gerente/editar-supervisor/editar-supervisor.component';
import { ConsultarSupervisorComponent } from './components/Gerente/consultar-supervisor/consultar-supervisor.component';
import { VerEquipoGerenteComponent } from './components/Gerente/ver-equipo-gerente/ver-equipo-gerente.component';
import { VerPuestoGerenteComponent } from './components/Gerente/ver-puesto-gerente/ver-puesto-gerente.component';
import { CrearCoordinadorGerenteComponent } from './components/Gerente/crear-coordinador-gerente/crear-coordinador-gerente.component';
import { CrearTestigoGerenteComponent } from './components/Gerente/crear-testigo-gerente/crear-testigo-gerente.component';

// Supervisor Components
import { SupervisorHomeComponent } from './components/Supervisor/supervisor-home/supervisor-home.component';
import { MenuSupervisorComponent } from './components/Supervisor/menu-supervisor/menu-supervisor.component';
import { CrearCoordinadorComponent } from './components/Supervisor/crear-coordinador/crear-coordinador.component';
import { EditarCoordinadorComponent } from './components/Supervisor/editar-coordinador/editar-coordinador.component';
import { ConsultarCoordinadorComponent } from './components/Supervisor/consultar-coordinador/consultar-coordinador.component';
import { VerEquipoSupervisorComponent } from './components/Supervisor/ver-equipo-supervisor/ver-equipo-supervisor.component';
import { VerPuestoSupervisorComponent } from './components/Supervisor/ver-puesto-supervisor/ver-puesto-supervisor.component';
import { CrearTestigoSupervisorComponent } from './components/Supervisor/crear-testigo-supervisor/crear-testigo-supervisor.component';

// Coordinador Components
import { CoordinadorHomeComponent } from './components/Coordinador/coordinador-home/coordinador-home.component';
import { MenuCoordinadorComponent } from './components/Coordinador/menu-coordinador/menu-coordinador.component';
import { CrearTestigoComponent } from './components/Coordinador/crear-testigo/crear-testigo.component';
import { EditarTestigoComponent } from './components/Coordinador/editar-testigo/editar-testigo.component';
import { ConsultarTestigoComponent } from './components/Coordinador/consultar-testigo/consultar-testigo.component';
import { VerEquipoCoordinadorComponent } from './components/Coordinador/ver-equipo-coordinador/ver-equipo-coordinador.component';
import { VerPuestoCoordinadorComponent } from './components/Coordinador/ver-puesto-coordinador/ver-puesto-coordinador.component';
import { ReporteVotosCoordinadorComponent } from './components/Coordinador/reporte-votos-coordinador/reporte-votos-coordinador.component';
import { ReporteIncidenciasCoordinadorComponent } from './components/Coordinador/reporte-incidencias-coordinador/reporte-incidencias-coordinador.component';

// Testigo Components
import { TestigoHomeComponent } from './components/Testigo/testigo-home/testigo-home.component';
import { MenuTestigoComponent } from './components/Testigo/menu-testigo/menu-testigo.component';
import { ReporteVotosTestigoComponent } from './components/Testigo/reporte-votos-testigo/reporte-votos-testigo.component';
import { ReporteIncidenciasComponent } from './components/Testigo/reporte-incidencias/reporte-incidencias.component';

// Impugnador Components
import { ImpugnadorHomeComponent } from './components/Impugnador/impugnador-home/impugnador-home.component';
import { MenuImpugnadorComponent } from './components/Impugnador/menu-impugnador/menu-impugnador.component';
import { ImpugnarComponent } from './components/Impugnador/impugnar/impugnar.component';

// Admin Impugnaciones Components
import { HomeComponent } from './components/AdministradorImpugnaciones/home/home.component';
import { ImpugnacionesComponent } from './components/AdministradorImpugnaciones/impugnaciones/impugnaciones.component';
import { MenuAdministradorImpugnacionesComponent } from './components/AdministradorImpugnaciones/menu-administrador-impugnaciones/menu-administrador-impugnaciones.component';

// Public Components
import { SurveyLandingComponent } from './components/public/survey-landing/survey-landing.component';
import { ShortLinkRedirectComponent } from './components/public/short-link-redirect/short-link-redirect.component';

// Other Components
import { EditarPerfilComponent } from './components/editarPerfil/editar-perfil.component';
import { ContactosComponent } from './components/contactos/contactos.component';

@NgModule({
  declarations: [
    // Root Component
    AppComponent,
    
    // Auth (TODO: Migrar a AuthModule)
    LoginComponent,
    ForbiddenComponent,
    
    // Admin (TODO: Migrar a AdminModule con lazy loading)
    AdminHomeComponent,
    MenuAdminComponent,
    CrearGerenteComponent,
    EditarGerenteComponent,
    ConsultarGerenteComponent,
    VerEquipoAdminComponent,
    VerPuestoAdminComponent,
    CrearSupervisorAdminComponent,
    CrearCoordinadorAdminComponent,
    CrearTestigoAdminComponent,
    CambiarRolGerenteComponent,
    
    // Admin - Surveys (TODO: Migrar a SurveysModule con lazy loading)
    SurveyDashboardComponent,
    SurveyBuilderComponent,
    RecipientsModalComponent,
    SurveyAnalyticsComponent,
    SurveyResponsesComponent,
    VotoOpinionMuestraComponent,
    
    // Admin - Backoffice (TODO: Migrar a BackofficeModule con lazy loading)
    AdminDashboardPageComponent,
    AdminUsersManagementPageComponent,
    AdminRankingsPageComponent,
    
    // Admin - WhatsApp (TODO: Migrar a WhatsAppModule con lazy loading)
    WhatsAppTemplatesDashboardComponent,
    SendTemplateModalComponent,
    
    // Admin - Activación
    ChallengesDashboardComponent,
    CreateChallengeModalComponent,
    EditChallengeModalComponent,
    AssignChallengeModalComponent,
    ConfirmCompletionsModalComponent,
    AssignedUsersModalComponent,
    
    // Gerente (TODO: Migrar a GerenteModule con lazy loading)
    GerenteHomeComponent,
    MenuGerenteComponent,
    CrearSupervisorComponent,
    EditarSupervisorComponent,
    ConsultarSupervisorComponent,
    VerEquipoGerenteComponent,
    VerPuestoGerenteComponent,
    CrearCoordinadorGerenteComponent,
    CrearTestigoGerenteComponent,
    
    // Supervisor (TODO: Migrar a SupervisorModule con lazy loading)
    SupervisorHomeComponent,
    MenuSupervisorComponent,
    CrearCoordinadorComponent,
    EditarCoordinadorComponent,
    ConsultarCoordinadorComponent,
    VerEquipoSupervisorComponent,
    VerPuestoSupervisorComponent,
    CrearTestigoSupervisorComponent,
    
    // Coordinador (TODO: Migrar a CoordinadorModule con lazy loading)
    CoordinadorHomeComponent,
    MenuCoordinadorComponent,
    CrearTestigoComponent,
    EditarTestigoComponent,
    ConsultarTestigoComponent,
    VerEquipoCoordinadorComponent,
    VerPuestoCoordinadorComponent,
    ReporteVotosCoordinadorComponent,
    ReporteIncidenciasCoordinadorComponent,
    
    // Testigo (TODO: Migrar a TestigoModule con lazy loading)
    TestigoHomeComponent,
    MenuTestigoComponent,
    ReporteVotosTestigoComponent,
    ReporteIncidenciasComponent,
    
    // Impugnador (TODO: Migrar a ImpugnadorModule con lazy loading)
    ImpugnadorHomeComponent,
    MenuImpugnadorComponent,
    ImpugnarComponent,
    
    // Admin Impugnaciones (TODO: Migrar a ImpugnacionesModule con lazy loading)
    HomeComponent,
    ImpugnacionesComponent,
    MenuAdministradorImpugnacionesComponent,
    
    // Public (TODO: Migrar a PublicModule con lazy loading)
    SurveyLandingComponent,
    ShortLinkRedirectComponent,
    
    // Other (TODO: Migrar a SharedModule o ProfileModule)
    EditarPerfilComponent,
    ContactosComponent,
  ],
  imports: [
    // Angular Core
    BrowserModule,
    HammerModule,
    
    // Routing
    AppRoutingModule,
    
    // ============================================
    // NUEVA ARQUITECTURA EVOLUTIVA
    // ============================================
    CoreModule,   // Servicios singleton, guards, interceptors
    SharedModule, // Componentes reutilizables, módulos de terceros
    LayoutModule, // Layouts y componentes de navegación
  ],
  // Providers ahora están en CoreModule
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
