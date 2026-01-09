import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-consultar-coordinador',
  templateUrl: './consultar-coordinador.component.html',
  styleUrls: ['./consultar-coordinador.component.scss']
})
export class ConsultarCoordinadorComponent implements OnInit,OnDestroy {

  listCoordinadorAsignados: any = [];
  listCoordinadorNoAsignados: any = [];
  listStations: any = [];
  dtOptionsCoordinadorAsignados: DataTables.Settings = {};
  dtOptionsCoordinadorNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  coordinadorActual: any={};
  puestosActual: any='';
  activeTab: string = 'asignados';
  loading: boolean = true;

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private router: Router,
    private localData: LocalDataService
  ) { }

  ngOnInit() {
    this.dataTableOptions();
    this.getCoordinadores();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  getCoordinadores() {
    this.loading = true;
    
    // Si es admin, usar el endpoint de backoffice sin parámetros
    // Si es supervisor, usar el endpoint con el ID del supervisor
    const userRol = this.localData.getRol();
    const isAdmin = userRol === '1' || userRol === 'admin' || userRol === 'Admin';
    
    if (isAdmin) {
      // Para admin: obtener todos los coordinadores desde el equipo completo
      this.backofficeAdminService.getEquipoAdmin().subscribe({
        next: (resp: any) => {
          // El endpoint devuelve toda la jerarquía, extraer coordinadores
          const allCoordinadores: any[] = [];
          
          // Recorrer gerentes -> supervisores -> coordinadores
          if (resp.gerentes && Array.isArray(resp.gerentes)) {
            resp.gerentes.forEach((gerente: any) => {
              if (gerente.supervisores && Array.isArray(gerente.supervisores)) {
                gerente.supervisores.forEach((supervisor: any) => {
                  if (supervisor.coordinadores && Array.isArray(supervisor.coordinadores)) {
                    allCoordinadores.push(...supervisor.coordinadores);
                  }
                });
              }
            });
          }
          
          // Separar coordinadores asignados y no asignados
          this.listCoordinadorAsignados = allCoordinadores.filter((c: any) => 
            c.puestos && Array.isArray(c.puestos) && c.puestos.length > 0
          );
          this.listCoordinadorNoAsignados = allCoordinadores.filter((c: any) => 
            !c.puestos || !Array.isArray(c.puestos) || c.puestos.length === 0
          );
          
          // Procesar puestos para mostrar
          for (let coordinador of this.listCoordinadorAsignados) {
            let puestos = this.getZones(coordinador.puestos || []);
            let lastPuestos;
            if (puestos.length > 1) {
              lastPuestos = puestos.shift();
              this.listStations.push(puestos.join(', ') + " y " + lastPuestos);
            } else {
              this.listStations.push(puestos);
            }
          }
          
          setTimeout(() => {
            this.dtTrigger.next(void 0);
            this.applyPaginationStyles();
          });
          this.loading = false;
        },
        error: (error: any) => {
          this.listCoordinadorAsignados = [];
          this.listCoordinadorNoAsignados = [];
          this.loading = false;
        }
      });
    } else {
      // Para supervisor: usar el endpoint tradicional con el ID del supervisor
      this.apiService.getCoordinadores().subscribe({
        next: (resp: any) => {
          const { coordinadores_asignados, coordinadores_no_asignados } = resp;
          this.listCoordinadorAsignados = coordinadores_asignados || [];
          this.listCoordinadorNoAsignados = coordinadores_no_asignados || [];
          for (let coordinador of this.listCoordinadorAsignados) {
            let puestos = this.getZones(coordinador.puestos || []);
            let lastPuestos;
            if (puestos.length > 1) {
              lastPuestos = puestos.shift();
              this.listStations.push(puestos.join(', ') + " y " + lastPuestos);
            } else {
              this.listStations.push(puestos);
            }
          }
          setTimeout(() => {
            this.dtTrigger.next(void 0);
            this.applyPaginationStyles();
          });
          this.loading = false;
        },
        error: (error: any) => {
          this.listCoordinadorAsignados = [];
          this.listCoordinadorNoAsignados = [];
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

  redirectUpdateCoordinador(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["editarCoordinador",idEncrypt]);
  }

  coordinadorActualSeleccionado(coordinador: any, puestos?:any) {
    this.coordinadorActual=coordinador;
    this.puestosActual=puestos;
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
    this.dtOptionsCoordinadorAsignados = {
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
    this.dtOptionsCoordinadorNoAsignados = {
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
