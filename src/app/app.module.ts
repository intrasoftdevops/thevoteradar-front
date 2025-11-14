import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AdminHomeComponent } from './components/Admin/admin-home/admin-home.component';
import { GerenteHomeComponent } from './components/Gerente/gerente-home/gerente-home.component';
import { SupervisorHomeComponent } from './components/Supervisor/supervisor-home/supervisor-home.component';
import { CoordinadorHomeComponent } from './components/Coordinador/coordinador-home/coordinador-home.component';
import { TestigoHomeComponent } from './components/Testigo/testigo-home/testigo-home.component';
import { MenuAdminComponent } from './components/Admin/menu-admin/menu-admin.component';
import { MenuGerenteComponent } from './components/Gerente/menu-gerente/menu-gerente.component';
import { MenuSupervisorComponent } from './components/Supervisor/menu-supervisor/menu-supervisor.component';
import { MenuCoordinadorComponent } from './components/Coordinador/menu-coordinador/menu-coordinador.component';
import { MenuTestigoComponent } from './components/Testigo/menu-testigo/menu-testigo.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrearGerenteComponent } from './components/Admin/crear-gerente/crear-gerente.component';
import { CrearSupervisorComponent } from './components/Gerente/crear-supervisor/crear-supervisor.component';
import { CrearCoordinadorComponent } from './components/Supervisor/crear-coordinador/crear-coordinador.component';
import { CrearTestigoComponent } from './components/Coordinador/crear-testigo/crear-testigo.component';
import { EditarGerenteComponent } from './components/Admin/editar-gerente/editar-gerente.component';
import { VerEquipoAdminComponent } from './components/Admin/ver-equipo-admin/ver-equipo-admin.component';
import { VerEquipoGerenteComponent } from './components/Gerente/ver-equipo-gerente/ver-equipo-gerente.component';
import { VerEquipoSupervisorComponent } from './components/Supervisor/ver-equipo-supervisor/ver-equipo-supervisor.component';
import { VerEquipoCoordinadorComponent } from './components/Coordinador/ver-equipo-coordinador/ver-equipo-coordinador.component';
import { VerPuestoAdminComponent } from './components/Admin/ver-puesto-admin/ver-puesto-admin.component';
import { VerPuestoGerenteComponent } from './components/Gerente/ver-puesto-gerente/ver-puesto-gerente.component';
import { VerPuestoSupervisorComponent } from './components/Supervisor/ver-puesto-supervisor/ver-puesto-supervisor.component';
import { VerPuestoCoordinadorComponent } from './components/Coordinador/ver-puesto-coordinador/ver-puesto-coordinador.component';
import { EditarSupervisorComponent } from './components/Gerente/editar-supervisor/editar-supervisor.component';
import { EditarCoordinadorComponent } from './components/Supervisor/editar-coordinador/editar-coordinador.component';
import { EditarTestigoComponent } from './components/Coordinador/editar-testigo/editar-testigo.component';
import { ConsultarGerenteComponent } from './components/Admin/consultar-gerente/consultar-gerente.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ConsultarSupervisorComponent } from './components/Gerente/consultar-supervisor/consultar-supervisor.component';
import { ReporteIncidenciasComponent } from './components/Testigo/reporte-incidencias/reporte-incidencias.component';
import { ConsultarCoordinadorComponent } from './components/Supervisor/consultar-coordinador/consultar-coordinador.component';
import { FooterComponent } from './components/footer/footer.component';
import { ConsultarTestigoComponent } from './components/Coordinador/consultar-testigo/consultar-testigo.component';
import { EditarPerfilComponent } from './components/editarPerfil/editar-perfil.component';
import { ReporteIncidenciasCoordinadorComponent } from './components/Coordinador/reporte-incidencias-coordinador/reporte-incidencias-coordinador.component';
import { ReporteVotosCoordinadorComponent } from './components/Coordinador/reporte-votos-coordinador/reporte-votos-coordinador.component';
import { LightboxModule } from 'ngx-lightbox';
import { ContactosComponent } from './components/contactos/contactos.component';
import { ReporteVotosTestigoComponent } from './components/Testigo/reporte-votos-testigo/reporte-votos-testigo.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ImpugnarComponent } from './components/Impugnador/impugnar/impugnar.component';
import { MenuImpugnadorComponent } from './components/Impugnador/menu-impugnador/menu-impugnador.component';
import { ImpugnadorHomeComponent } from './components/Impugnador/impugnador-home/impugnador-home.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LoaderService } from './services/loader/loader.service';
import { LoaderInterceptor } from './interceptors/loader-interceptor.service';
import { CrearSupervisorAdminComponent } from './components/Admin/crear-supervisor-admin/crear-supervisor-admin.component';
import { CrearCoordinadorAdminComponent } from './components/Admin/crear-coordinador-admin/crear-coordinador-admin.component';
import { CrearTestigoAdminComponent } from './components/Admin/crear-testigo-admin/crear-testigo-admin.component';
import { CrearCoordinadorGerenteComponent } from './components/Gerente/crear-coordinador-gerente/crear-coordinador-gerente.component';
import { CrearTestigoGerenteComponent } from './components/Gerente/crear-testigo-gerente/crear-testigo-gerente.component';
import { CrearTestigoSupervisorComponent } from './components/Supervisor/crear-testigo-supervisor/crear-testigo-supervisor.component';
import { DropdownMenuUsersComponent } from './components/dropdown-menu-users/dropdown-menu-users.component';
import { DataTablesModule } from 'angular-datatables';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CambiarRolGerenteComponent } from './components/Admin/cambiar-rol-gerente/cambiar-rol-gerente.component';
import { AuthGuard } from './guards/AuthGuard/auth.guard';
import { LogoutGuard } from './guards/LogoutGuard/logout.guard';
import { ImpugnacionesComponent } from './components/AdministradorImpugnaciones/impugnaciones/impugnaciones.component';
import { HomeComponent } from './components/AdministradorImpugnaciones/home/home.component';
import { MenuAdministradorImpugnacionesComponent } from './components/AdministradorImpugnaciones/menu-administrador-impugnaciones/menu-administrador-impugnaciones.component';
import { ThemeSelectorComponent } from './components/shared/theme-selector/theme-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminHomeComponent,
    GerenteHomeComponent,
    SupervisorHomeComponent,
    CoordinadorHomeComponent,
    TestigoHomeComponent,
    MenuAdminComponent,
    MenuGerenteComponent,
    MenuSupervisorComponent,
    MenuCoordinadorComponent,
    MenuTestigoComponent,
    MenuTestigoComponent,
    MenuAdministradorImpugnacionesComponent,
    CrearGerenteComponent,
    CrearSupervisorComponent,
    CrearCoordinadorComponent,
    CrearTestigoComponent,
    EditarGerenteComponent,
    VerEquipoAdminComponent,
    VerEquipoGerenteComponent,
    VerEquipoSupervisorComponent,
    VerEquipoCoordinadorComponent,
    VerPuestoAdminComponent,
    VerPuestoGerenteComponent,
    VerPuestoSupervisorComponent,
    VerPuestoCoordinadorComponent,
    EditarSupervisorComponent,
    EditarCoordinadorComponent,
    EditarTestigoComponent,
    ConsultarGerenteComponent,
    ConsultarSupervisorComponent,
    ReporteIncidenciasComponent,
    ConsultarCoordinadorComponent,
    FooterComponent,
    ConsultarTestigoComponent,
    EditarPerfilComponent,
    ReporteIncidenciasCoordinadorComponent,
    ReporteVotosCoordinadorComponent,
    ContactosComponent,
    ReporteVotosTestigoComponent,
    ImpugnarComponent,
    MenuImpugnadorComponent,
    ImpugnadorHomeComponent,
    LoadingComponent,
    CrearSupervisorAdminComponent,
    CrearCoordinadorAdminComponent,
    CrearTestigoAdminComponent,
    CrearCoordinadorGerenteComponent,
    CrearTestigoGerenteComponent,
    CrearTestigoSupervisorComponent,
    DropdownMenuUsersComponent,
    ForbiddenComponent,
    CambiarRolGerenteComponent,
    ImpugnacionesComponent,
    HomeComponent,
    MenuAdministradorImpugnacionesComponent,
    ThemeSelectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    HammerModule, // <-- For Angular 9
    LightboxModule,
    NgxDropzoneModule,
    DataTablesModule,
    NgxPermissionsModule.forRoot(),
    NgbModule
  ],
  providers: [
    AuthGuard,
    LogoutGuard,
    LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
