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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
