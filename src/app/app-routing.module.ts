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
import { EditarSupervisorComponent } from './components/Gerente/editar-supervisor/editar-supervisor.component';

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
    path: 'editarSupervisor/:id',
    component: EditarSupervisorComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
