import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { GerenteHomeComponent } from './components/Gerente/gerente-home/gerente-home.component';
import { AdminHomeComponent } from './components/Admin/admin-home/admin-home.component';
import { SupervisorHomeComponent } from './components/Supervisor/supervisor-home/supervisor-home.component';
import { CoordinadorHomeComponent } from './components/Coordinador/coordinador-home/coordinador-home.component';
import { TestigoHomeComponent } from './components/Testigo/testigo-home/testigo-home.component';
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
import { ConsultarSupervisorComponent } from './components/Gerente/consultar-supervisor/consultar-supervisor.component';
import { ReporteIncidenciasComponent } from './components/Testigo/reporte-incidencias/reporte-incidencias.component';
import { ConsultarCoordinadorComponent } from './components/Supervisor/consultar-coordinador/consultar-coordinador.component';
import { ConsultarTestigoComponent } from './components/Coordinador/consultar-testigo/consultar-testigo.component';
import { EditarPerfilComponent } from './components/editarPerfil/editar-perfil.component';
import { ReporteVotosCoordinadorComponent } from './components/Coordinador/reporte-votos-coordinador/reporte-votos-coordinador.component';
import { ReporteIncidenciasCoordinadorComponent } from './components/Coordinador/reporte-incidencias-coordinador/reporte-incidencias-coordinador.component';
import { ReporteVotosTestigoComponent } from './components/Testigo/reporte-votos-testigo/reporte-votos-testigo.component';
import { ImpugnarComponent } from './components/Impugnador/impugnar/impugnar.component';
import { MenuImpugnadorComponent } from './components/Impugnador/menu-impugnador/menu-impugnador.component';
import { ImpugnadorHomeComponent } from './components/Impugnador/impugnador-home/impugnador-home.component';
import { CrearSupervisorAdminComponent } from './components/Admin/crear-supervisor-admin/crear-supervisor-admin.component';
import { CrearCoordinadorAdminComponent } from './components/Admin/crear-coordinador-admin/crear-coordinador-admin.component';
import { CrearTestigoAdminComponent } from './components/Admin/crear-testigo-admin/crear-testigo-admin.component';
import { CrearCoordinadorGerenteComponent } from './components/Gerente/crear-coordinador-gerente/crear-coordinador-gerente.component';
import { CrearTestigoGerenteComponent } from './components/Gerente/crear-testigo-gerente/crear-testigo-gerente.component';
import { CrearTestigoSupervisorComponent } from './components/Supervisor/crear-testigo-supervisor/crear-testigo-supervisor.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'gerenteHome',
    component: GerenteHomeComponent
  },
  {
    path: 'adminHome',
    component: AdminHomeComponent
  },
  {
    path: 'supervisorHome',
    component: SupervisorHomeComponent
  },
  {
    path: 'coordinadorHome',
    component: CoordinadorHomeComponent
  },
  {
    path: 'testigoHome',
    component: TestigoHomeComponent
  },
  {
    path: 'crearGerente',
    component: CrearGerenteComponent
  },
  {
    path: 'crearSupervisor',
    component: CrearSupervisorComponent
  },
  {
    path: 'crearCoordinador',
    component: CrearCoordinadorComponent
  },
  {
    path: 'crearTestigo',
    component: CrearTestigoComponent
  },
  {
    path: 'editarGerente/:id',
    component: EditarGerenteComponent
  },
  {
    path: 'verEquipoAdmin',
    component: VerEquipoAdminComponent
  },
  {
    path: 'verEquipoGerente',
    component: VerEquipoGerenteComponent
  },
  {
    path: 'verEquipoSupervisor',
    component: VerEquipoSupervisorComponent
  },
  {
    path: 'verEquipoCoordinador',
    component: VerEquipoCoordinadorComponent
  },
  {
    path: 'verPuestoAdmin',
    component: VerPuestoAdminComponent
  },

  {
    path: 'verPuestoGerente',
    component: VerPuestoGerenteComponent
  },

  {
    path: 'verPuestoSupervisor',
    component: VerPuestoSupervisorComponent
  },
  {
    path: 'verPuestoCoordinador',
    component: VerPuestoCoordinadorComponent
  },
  {
    path: 'editarSupervisor/:id',
    component: EditarSupervisorComponent
  },
  {
    path: 'editarCoordinador/:id',
    component: EditarCoordinadorComponent
  },
  {
    path: 'editarTestigo/:id',
    component: EditarTestigoComponent
  },
  {
    path: 'consultarGerente',
    component: ConsultarGerenteComponent
  },
  {
    path: 'consultarSupervisor',
    component: ConsultarSupervisorComponent
  },
  {
    path: 'consultarCoordinador',
    component: ConsultarCoordinadorComponent
  },
  {
    path: 'consultarTestigo',
    component: ConsultarTestigoComponent
  },
  {
    path: 'reporteIncidencias',
    component: ReporteIncidenciasComponent
  },
  {
    path: 'editarPerfil',
    component: EditarPerfilComponent
  },
  {
    path: 'reporteIncidenciasCoordinador',
    component: ReporteIncidenciasCoordinadorComponent
  },
  {
    path: 'reporteVotosCoordinador',
    component: ReporteVotosCoordinadorComponent
  },
  {
    path: 'reporteVotosTestigo',
    component: ReporteVotosTestigoComponent
  },
  {
    path: 'impugnar',
    component: ImpugnarComponent
  },
  {
    path: 'impugnadorHome',
    component: ImpugnadorHomeComponent
  },
  {
    path: 'crearSupervisorAdmin',
    component: CrearSupervisorAdminComponent
  },
  {
    path: 'crearCoordinadorAdmin',
    component: CrearCoordinadorAdminComponent
  },
  {
    path: 'crearTestigoAdmin',
    component: CrearTestigoAdminComponent
  },
  {
    path: 'crearCoordinadorGerente',
    component: CrearCoordinadorGerenteComponent
  },
  {
    path: 'crearTestigoGerente',
    component: CrearTestigoGerenteComponent
  },
  {
    path: 'crearTestigoSupervisor',
    component: CrearTestigoSupervisorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
