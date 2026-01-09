import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-consultar-supervisor',
  templateUrl: './consultar-supervisor.component.html',
  styleUrls: ['./consultar-supervisor.component.scss']
})
export class ConsultarSupervisorComponent implements OnInit, OnDestroy {

  listSupervisorAsignados: any = [];
  listSupervisorNoAsignados: any = [];
  listZones: any = [];
  dtOptionsSupervisorAsignados: DataTables.Settings = {};
  dtOptionsSupervisorNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  supervisorActual: any={};
  zonasActual: any='';
  activeTab: string = 'asignados';
  loading: boolean = true;

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private router: Router,
    private localData: LocalDataService
  ) { }

  ngOnInit(): void {
    this.dataTableOptions();
    this.getSupervisores();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  getSupervisores() {
    this.loading = true;
    
    // Si es admin, usar el endpoint de backoffice sin parámetros
    // Si es gerente, usar el endpoint con el ID del gerente
    const userRol = this.localData.getRol();
    const isAdmin = userRol === '1' || userRol === 'admin' || userRol === 'Admin';
    
    if (isAdmin) {
      // Para admin: obtener todos los supervisores desde el equipo completo
      this.backofficeAdminService.getEquipoAdmin().subscribe({
        next: (resp: any) => {
          // El endpoint devuelve toda la jerarquía, extraer supervisores
          const allSupervisores: any[] = [];
          
          // Recorrer gerentes y extraer sus supervisores
          if (resp.gerentes && Array.isArray(resp.gerentes)) {
            resp.gerentes.forEach((gerente: any) => {
              if (gerente.supervisores && Array.isArray(gerente.supervisores)) {
                allSupervisores.push(...gerente.supervisores);
              }
            });
          }
          
          // Separar supervisores asignados y no asignados
          this.listSupervisorAsignados = allSupervisores.filter((s: any) => 
            s.zonas && Array.isArray(s.zonas) && s.zonas.length > 0
          );
          this.listSupervisorNoAsignados = allSupervisores.filter((s: any) => 
            !s.zonas || !Array.isArray(s.zonas) || s.zonas.length === 0
          );
          
          // Procesar zonas para mostrar
          for (let supervisor of this.listSupervisorAsignados) {
            let zonas = this.getZones(supervisor.zonas || []);
            let lastZonas;
            if (zonas.length > 1) {
              lastZonas = zonas.shift();
              this.listZones.push(zonas.join(', ') + " y " + lastZonas);
            } else {
              this.listZones.push(zonas);
            }
          }
          
          setTimeout(() => {
            this.dtTrigger.next(void 0);
            this.applyPaginationStyles();
          });
          this.loading = false;
        },
        error: (error: any) => {
          this.listSupervisorAsignados = [];
          this.listSupervisorNoAsignados = [];
          this.loading = false;
        }
      });
    } else {
      // Para gerente: usar el endpoint tradicional con el ID del gerente
      this.apiService.getSupervisores().subscribe({
        next: (resp: any) => {
          const { supervisores_asignados, supervisores_no_asignados } = resp;
          this.listSupervisorAsignados = supervisores_asignados || [];
          this.listSupervisorNoAsignados = supervisores_no_asignados || [];
          for (let supervisor of this.listSupervisorAsignados) {
            let zonas = this.getZones(supervisor.zonas || []);
            let lastZonas;
            if (zonas.length > 1) {
              lastZonas = zonas.shift();
              this.listZones.push(zonas.join(', ') + " y " + lastZonas);
            } else {
              this.listZones.push(zonas);
            }
          }
          setTimeout(() => {
            this.dtTrigger.next(void 0);
            this.applyPaginationStyles();
          });
          this.loading = false;
        },
        error: (error: any) => {
          this.listSupervisorAsignados = [];
          this.listSupervisorNoAsignados = [];
          this.loading = false;
        }
      });
    }
  }

  getZones(data: any) {
    return data.map((zone: any) => {
      const { nombre } = zone;
      return nombre;
    });
  }

  redirectUpdateSupervisor(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["editarSupervisor", idEncrypt]);
  }

  supervisorActualSeleccionado(supervisor: any, zonas?:any) {
    this.supervisorActual=supervisor;
    this.zonasActual=zonas;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  applyPaginationStyles() {
    const applyStyles = () => {
      const root = document.documentElement;
      const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary').trim();
      const accentColor = getComputedStyle(root).getPropertyValue('--color-accent').trim();
      
      const selectors = [
        '.dataTables_wrapper .dataTables_paginate .paginate_button.current',
        '.dataTables_wrapper .dataTables_paginate .paginate_button.current a',
        '.dataTables_wrapper .dataTables_paginate ul.pagination li.paginate_button.current',
        '.dataTables_wrapper .dataTables_paginate ul.pagination li.paginate_button.current a'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((button: any) => {
          if (button) {
            button.removeAttribute('style');
            button.style.cssText += `background: linear-gradient(to right, ${primaryColor}, ${accentColor}) !important;`;
            button.style.cssText += `background-color: transparent !important;`;
            button.style.cssText += `background-image: linear-gradient(to right, ${primaryColor}, ${accentColor}) !important;`;
            button.style.cssText += `border-color: ${primaryColor} !important;`;
            button.style.cssText += `color: white !important;`;
            button.style.cssText += `font-weight: 600 !important;`;
          }
        });
      });
    };
    
    const intervals = [0, 50, 100, 200, 300, 500, 1000];
    intervals.forEach(delay => setTimeout(applyStyles, delay));
    
    const paginationContainers = document.querySelectorAll('.dataTables_wrapper');
    paginationContainers.forEach(container => {
      const paginationContainer = container.querySelector('.dataTables_paginate');
      if (paginationContainer) {
        const observer = new MutationObserver(() => applyStyles());
        observer.observe(paginationContainer, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
      }
    });
    
    document.addEventListener('click', (e: any) => {
      if (e.target && e.target.closest && e.target.closest('.dataTables_wrapper .dataTables_paginate')) {
        setTimeout(applyStyles, 10);
        setTimeout(applyStyles, 50);
        setTimeout(applyStyles, 100);
      }
    }, true);
  }

  dataTableOptions() {
    this.dtOptionsSupervisorAsignados = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-md-table-cell',
      }, {
        orderable: true,
        className: 'd-none d-lg-table-cell'
      },
      {
        orderable: true,
      },
      {
        orderable: false,
      }
      ],
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      }
    };
    this.dtOptionsSupervisorNoAsignados = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-md-table-cell'
      },
      {
        orderable: true,
        className: 'd-none d-md-table-cell'
      },
      {
        orderable: false,
      }
      ],
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      }
    };
  }

}
