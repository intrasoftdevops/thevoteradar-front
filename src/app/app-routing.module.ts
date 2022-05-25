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
import { NgxPermissionsGuard } from 'ngx-permissions';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { LogoutPermissionsGuard } from './permissions/logout-permissions-guard';
import { CambiarRolGerenteComponent } from './components/Admin/cambiar-rol-gerente/cambiar-rol-gerente.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [LogoutPermissionsGuard],
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  {
    path: 'adminHome',
    component: AdminHomeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'gerenteHome',
    component: GerenteHomeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["2"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'supervisorHome',
    component: SupervisorHomeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["3"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'coordinadorHome',
    canActivate: [NgxPermissionsGuard],
    component: CoordinadorHomeComponent,
    data: {
      permissions: {
        only: ["4"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'testigoHome',
    component: TestigoHomeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["5"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearGerente',
    component: CrearGerenteComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearSupervisor',
    component: CrearSupervisorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [2],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearCoordinador',
    component: CrearCoordinadorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["3"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearTestigo',
    component: CrearTestigoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["4"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'editarGerente/:id',
    component: EditarGerenteComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'consultarEquipoAdmin',
    component: VerEquipoAdminComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'consultarEquipoGerente',
    component: VerEquipoGerenteComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [2],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'consultarEquipoSupervisor',
    component: VerEquipoSupervisorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["3"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'consultarEquipoCoordinador',
    component: VerEquipoCoordinadorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["4"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'estadisticasEquipoAdmin',
    component: VerPuestoAdminComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'estadisticasEquipoGerente',
    component: VerPuestoGerenteComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [2],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'estadisticasEquipoSupervisor',
    component: VerPuestoSupervisorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["3"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'estadisticasEquipoCoordinador',
    component: VerPuestoCoordinadorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["4"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'editarSupervisor/:id',
    component: EditarSupervisorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [2],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'editarCoordinador/:id',
    component: EditarCoordinadorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["3"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'editarTestigo/:id',
    component: EditarTestigoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["4"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'consultarGerente',
    component: ConsultarGerenteComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'consultarSupervisor',
    component: ConsultarSupervisorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [1, 2],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'consultarCoordinador',
    component: ConsultarCoordinadorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [1, 2, 3],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'consultarTestigo',
    component: ConsultarTestigoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [1, 2, 3, 4],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'reporteIncidencias',
    component: ReporteIncidenciasComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["5"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'editarPerfil',
    component: EditarPerfilComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [1, 2, 3, 4, 5, 8],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'reporteIncidenciasCoordinador',
    component: ReporteIncidenciasCoordinadorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["4"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'reporteVotosCoordinador',
    component: ReporteVotosCoordinadorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["4"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'reporteVotosTestigo',
    component: ReporteVotosTestigoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["5"],
        redirectTo: '/forbidden'
      }
    }
  },
  //No olvidar cambiar id para poder utilizar el forbidden.
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
    component: CrearSupervisorAdminComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearCoordinadorAdmin',
    component: CrearCoordinadorAdminComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearTestigoAdmin',
    component: CrearTestigoAdminComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearCoordinadorGerente',
    component: CrearCoordinadorGerenteComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [2],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearTestigoGerente',
    component: CrearTestigoGerenteComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [2],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'crearTestigoSupervisor',
    component: CrearTestigoSupervisorComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["3"],
        redirectTo: '/forbidden'
      }
    }
  },
  {
    path: 'cambiarRolGerente/:id',
    component: CambiarRolGerenteComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ["1"],
        redirectTo: '/forbidden'
      }
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
