import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-consultar-gerente',
  templateUrl: './consultar-gerente.component.html',
  styleUrls: ['./consultar-gerente.component.scss'],
})
export class ConsultarGerenteComponent implements OnDestroy, OnInit {

  listGerenteAsignados: any = [];
  listGerenteNoAsignados: any = [];
  listMunicipals: any = [];
  gerenteActual: any={};
  municipiosActual: any='';
  dtOptionsGerenteAsignados: DataTables.Settings = {};
  dtOptionsGerenteNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective)
  dtElement!: any;
  notFirstTime = false;
  activeTab: string = 'asignados';
  loading: boolean = true;

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private router: Router,
    private localData: LocalDataService,
    private fb: FormBuilder
  ) { }

  private paginationStyleInterval: any;

  ngOnInit() {
    this.dataTableOptions();
    this.getGerentes();
    
    // Continuous interval to ensure styles are applied (as backup)
    this.paginationStyleInterval = setInterval(() => {
      this.applyPaginationStyles();
    }, 500);
  }

  ngOnDestroy() {
    // Verificar si el Subject ya está cerrado antes de completarlo para evitar ObjectUnsubscribedError
    if (!this.dtTrigger.closed) {
      this.dtTrigger.complete();
    }
    // Clear interval
    if (this.paginationStyleInterval) {
      clearInterval(this.paginationStyleInterval);
    }
  }

  getGerentes() {
    this.loading = true;
    // Usar el nuevo servicio de backoffice
    this.backofficeAdminService.getGerentesMunicipioAsignado().subscribe({
      next: (resp: any) => {
        // Adaptar respuesta según el formato del nuevo endpoint
        const { gerentes_asignados, gerentes_no_asignados } = resp;
        this.listGerenteAsignados = gerentes_asignados || [];
        this.listGerenteNoAsignados = gerentes_no_asignados || [];
        for (let gerente of this.listGerenteAsignados) {
          let municipios = this.getMunicipals(gerente.municipios);
          let lastMunicipio;
          if (municipios.length > 1) {
            lastMunicipio = municipios.shift();
            this.listMunicipals.push(municipios.join(', ') + " y " + lastMunicipio);
          } else {
            this.listMunicipals.push(municipios['0']);
          }
        }
        this.renderer();
        this.notFirstTime = true;
        this.loading = false;
        // Apply styles after rendering is complete
        setTimeout(() => {
          this.applyPaginationStyles();
        }, 300);
      },
      error: (error: any) => {
        this.listGerenteAsignados = [];
        this.listGerenteNoAsignados = [];
        this.loading = false;
      }
    });
  }

  renderer() {
    if (this.notFirstTime) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.draw();
        dtInstance.destroy();
      });
    }
    setTimeout(() => {
      this.dtTrigger.next(void 0);
      this.applyPaginationStyles();
    });
  }

  applyPaginationStyles() {
    const applyStyles = () => {
      // Get computed styles to use actual CSS variable values
      const root = document.documentElement;
      const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary').trim();
      const accentColor = getComputedStyle(root).getPropertyValue('--color-accent').trim();
      
      // Find all current page buttons - be very specific
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
            // Completely remove all inline styles first
            button.removeAttribute('style');
            
            // Apply new styles directly as inline styles with !important via setAttribute
            const style = button.getAttribute('style') || '';
            const newStyle = `background: linear-gradient(to right, ${primaryColor}, ${accentColor}) !important; ` +
                           `background-color: ${primaryColor} !important; ` +
                           `background-image: linear-gradient(to right, ${primaryColor}, ${accentColor}) !important; ` +
                           `border-color: ${primaryColor} !important; ` +
                           `color: white !important; ` +
                           `font-weight: 600 !important; ` +
                           style;
            button.setAttribute('style', newStyle);
            
            // Also use setProperty for modern browsers
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
    
    // Apply immediately and repeatedly
    const intervals = [0, 50, 100, 200, 300, 500, 1000];
    intervals.forEach(delay => {
      setTimeout(applyStyles, delay);
    });
    
    // Use MutationObserver to detect when pagination changes
    const paginationContainers = document.querySelectorAll('.dataTables_wrapper');
    paginationContainers.forEach(container => {
      const paginationContainer = container.querySelector('.dataTables_paginate');
      if (paginationContainer) {
        const observer = new MutationObserver(() => {
          applyStyles();
        });
        observer.observe(paginationContainer, { 
          childList: true, 
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style']
        });
      }
    });
    
    // Listen for all click events on pagination
    document.addEventListener('click', (e: any) => {
      if (e.target && e.target.closest && e.target.closest('.dataTables_wrapper .dataTables_paginate')) {
        setTimeout(applyStyles, 10);
        setTimeout(applyStyles, 50);
        setTimeout(applyStyles, 100);
      }
    }, true);
  }

  getMunicipals(data: any) {
    return data.map((municipal: any) => {
      const { nombre } = municipal;
      return nombre;
    });
  }

  redirectUpdateGerente(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    // Navigate to the new route under /panel/usuarios/gerente/editar/:id
    this.router.navigate(['/panel/usuarios/gerente/editar', idEncrypt]);
  }

  redirectSwitchRolGerente(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["cambiarRolGerente", idEncrypt]);
  }

  gerenteActualSeleccionado(gerente: any, municipios?:any) {
    this.gerenteActual=gerente;
    this.municipiosActual=municipios;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  dataTableOptions() {
    this.dtOptionsGerenteAsignados = {
      destroy:true,
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-md-table-cell',
      },{
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
        emptyTable: "No hay datos disponibles en la tabla",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        infoEmpty: "Mostrando 0 a 0 de 0 entradas",
        infoFiltered: "(filtrado de _MAX_ entradas totales)",
        lengthMenu: "Mostrar _MENU_ entradas",
        loadingRecords: "Cargando...",
        processing: "Procesando...",
        search: "Buscar:",
        zeroRecords: "No se encontraron registros coincidentes",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
        aria: {
          sortAscending: ": activar para ordenar la columna de forma ascendente",
          sortDescending: ": activar para ordenar la columna de forma descendente"
        }
      }
    };
    this.dtOptionsGerenteNoAsignados = {
      destroy:true,
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      },{
        orderable: true,
        className: 'd-none d-md-table-cell',
      },
       {
        orderable: true,
        className: 'd-none d-md-table-cell',
      },
      {
        orderable: false,
      }
      ],
      responsive: true,
      language: {
        emptyTable: "No hay datos disponibles en la tabla",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        infoEmpty: "Mostrando 0 a 0 de 0 entradas",
        infoFiltered: "(filtrado de _MAX_ entradas totales)",
        lengthMenu: "Mostrar _MENU_ entradas",
        loadingRecords: "Cargando...",
        processing: "Procesando...",
        search: "Buscar:",
        zeroRecords: "No se encontraron registros coincidentes",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
        aria: {
          sortAscending: ": activar para ordenar la columna de forma ascendente",
          sortDescending: ": activar para ordenar la columna de forma descendente"
        }
      }
    };
  }

}
