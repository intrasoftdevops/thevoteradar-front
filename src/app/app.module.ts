import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrearGerenteComponent } from './components/Admin/crear-gerente/crear-gerente.component';
import { CrearSupervisorComponent } from './components/Gerente/crear-supervisor/crear-supervisor.component';
import { CrearCoordinadorComponent } from './components/Supervisor/crear-coordinador/crear-coordinador.component';
import { CrearTestigoComponent } from './components/Coordinador/crear-testigo/crear-testigo.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
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
import { ConsultarIncidenciasComponent } from './components/Coordinador/consultar-incidencias/consultar-incidencias.component';
import { ReporteIncidenciasComponent } from './components/Testigo/reporte-incidencias/reporte-incidencias.component';
import { ConsultarCoordinadorComponent } from './components/Supervisor/consultar-coordinador/consultar-coordinador.component';
import { FooterComponent } from './components/footer/footer.component';
import { ConsultarTestigoComponent } from './components/Coordinador/consultar-testigo/consultar-testigo.component';
import { EditarPerfilComponent } from './components/editar-perfil/editar-perfil.component';

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
    ConsultarIncidenciasComponent,
    ReporteIncidenciasComponent,
    ConsultarCoordinadorComponent,
    FooterComponent,
    ConsultarTestigoComponent,
    EditarPerfilComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
