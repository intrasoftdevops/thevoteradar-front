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
import { ImpugnadorHomeComponent } from './components/Impugnador/impugnador-home/impugnador-home.component';
import { CrearSupervisorAdminComponent } from './components/Admin/crear-supervisor-admin/crear-supervisor-admin.component';
import { CrearCoordinadorAdminComponent } from './components/Admin/crear-coordinador-admin/crear-coordinador-admin.component';
import { CrearTestigoAdminComponent } from './components/Admin/crear-testigo-admin/crear-testigo-admin.component';
import { CrearCoordinadorGerenteComponent } from './components/Gerente/crear-coordinador-gerente/crear-coordinador-gerente.component';
import { CrearTestigoGerenteComponent } from './components/Gerente/crear-testigo-gerente/crear-testigo-gerente.component';
import { CrearTestigoSupervisorComponent } from './components/Supervisor/crear-testigo-supervisor/crear-testigo-supervisor.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { CambiarRolGerenteComponent } from './components/Admin/cambiar-rol-gerente/cambiar-rol-gerente.component';
import { AuthGuard } from './guards/AuthGuard/auth.guard';
import { LogoutGuard } from './guards/LogoutGuard/logout.guard';

const routes: Routes = [
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
    path: 'adminHome',
    component: AdminHomeComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'gerenteHome',
    component: GerenteHomeComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [2]
    }
  },
  {
    path: 'supervisorHome',
    component: SupervisorHomeComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [3]
    }
  },
  {
    path: 'coordinadorHome',
    component: CoordinadorHomeComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [4]
    }
  },
  {
    path: 'testigoHome',
    component: TestigoHomeComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [5]
    }
  },
  {
    path: 'crearGerente',
    component: CrearGerenteComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'crearSupervisor',
    component: CrearSupervisorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [2]
    }
  },
  {
    path: 'crearCoordinador',
    component: CrearCoordinadorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [3]
    }
  },
  {
    path: 'crearTestigo',
    component: CrearTestigoComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [4]
    }
  },
  {
    path: 'editarGerente/:id',
    component: EditarGerenteComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'consultarEquipoAdmin',
    component: VerEquipoAdminComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'consultarEquipoGerente',
    component: VerEquipoGerenteComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [2]
    }
  },
  {
    path: 'consultarEquipoSupervisor',
    component: VerEquipoSupervisorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [3]
    }
  },
  {
    path: 'consultarEquipoCoordinador',
    component: VerEquipoCoordinadorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [4]
    }
  },
  {
    path: 'estadisticasEquipoAdmin',
    component: VerPuestoAdminComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'estadisticasEquipoGerente',
    component: VerPuestoGerenteComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [2]
    }
  },
  {
    path: 'estadisticasEquipoSupervisor',
    component: VerPuestoSupervisorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [3]
    }
  },
  {
    path: 'estadisticasEquipoCoordinador',
    component: VerPuestoCoordinadorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [4]
    }
  },
  {
    path: 'editarSupervisor/:id',
    component: EditarSupervisorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [2]
    }
  },
  {
    path: 'editarCoordinador/:id',
    component: EditarCoordinadorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [3]
    }
  },
  {
    path: 'editarTestigo/:id',
    component: EditarTestigoComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [4]
    }
  },
  {
    path: 'consultarGerente',
    component: ConsultarGerenteComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'consultarSupervisor',
    component: ConsultarSupervisorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1, 2]
    }
  },
  {
    path: 'consultarCoordinador',
    component: ConsultarCoordinadorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1, 2, 3]
    }
  },
  {
    path: 'consultarTestigo',
    component: ConsultarTestigoComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1, 2, 3, 4]
    }
  },
  {
    path: 'reporteIncidencias',
    component: ReporteIncidenciasComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [5]
    }
  },
  {
    path: 'editarPerfil',
    component: EditarPerfilComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1, 2, 3, 4, 5, 8]
    }
  },
  {
    path: 'reporteIncidenciasCoordinador',
    component: ReporteIncidenciasCoordinadorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [4]
    }
  },
  {
    path: 'reporteVotosCoordinador',
    component: ReporteVotosCoordinadorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [4]
    }
  },
  {
    path: 'reporteVotosTestigo',
    component: ReporteVotosTestigoComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [5]
    }
  },
  //No olvidar cambiar id para poder utilizar el forbidden.
  {
    path: 'impugnar',
    component: ImpugnarComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [8]
    }
  },
  {
    path: 'impugnadorHome',
    component: ImpugnadorHomeComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [8]
    }
  },
  {
    path: 'crearSupervisorAdmin',
    component: CrearSupervisorAdminComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'crearCoordinadorAdmin',
    component: CrearCoordinadorAdminComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'crearTestigoAdmin',
    component: CrearTestigoAdminComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: 'crearCoordinadorGerente',
    component: CrearCoordinadorGerenteComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [2]
    }
  },
  {
    path: 'crearTestigoGerente',
    component: CrearTestigoGerenteComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [2]
    }
  },
  {
    path: 'crearTestigoSupervisor',
    component: CrearTestigoSupervisorComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [3]
    }
  },
  {
    path: 'cambiarRolGerente/:id',
    component: CambiarRolGerenteComponent,
    canActivate: [AuthGuard],
    data: {
      rol: [1]
    }
  },
  {
    path: '**',
    redirectTo: localStorage.getItem('previousUrl') ?? '/'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
