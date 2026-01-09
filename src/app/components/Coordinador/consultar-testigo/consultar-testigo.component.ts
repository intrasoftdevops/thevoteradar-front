import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';

@Component({
  selector: 'app-consultar-testigo',
  templateUrl: './consultar-testigo.component.html',
  styleUrls: ['./consultar-testigo.component.scss'],
})
export class ConsultarTestigoComponent implements OnInit, OnDestroy {
  listTestigoAsignados: any = [];
  listTestigoNoAsignados: any = [];
  testigosMesas: { [key: number]: string[] } = {};
  dtOptionsTestigoAsignados: DataTables.Settings = {};
  dtOptionsTestigoNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  testigoActual: any = {};
  mesasActual: any = '';
  searchForm: FormGroup;
  activeTab: string = 'asignados';
  dataStations: any = [];
  tabla: boolean = false;
  puestoSeleccionado = '';
  @ViewChild(DataTableDirective)
  dtElement!: any;
  notFirstTime = false;
  
  // Para el flujo de cascada (admin)
  isAdmin: boolean = false;
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  selectedDepartment: string = '';
  selectedMunicipal: string = '';
  selectedZone: string = '';
  loadingMunicipios: boolean = false;
  loadingZonas: boolean = false;
  loadingPuestos: boolean = false;
  loading: boolean = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private localData: LocalDataService,
    private fb: FormBuilder,
    private backofficeAdminService: BackofficeAdminService
  ) {
    this.searchForm = this.fb.group({
      departamento: [null],
      municipio: [null],
      zona: [null],
      puestos: [null],
    });
  }

  ngOnInit(): void {
    // Verificar si el usuario es admin
    const rol = this.localData.getRol();
    this.isAdmin = rol === '1' || rol === 'admin';
    
    this.dataTableOptions();
    
    if (this.isAdmin) {
      // Si es admin, cargar departamentos asignados
      this.getDepartmentAdmin();
    } else {
      // Si es coordinador, cargar puestos directamente
      this.getPuestos();
    }
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  getTestigos() {
    this.loading = true;
    
    if (this.isAdmin) {
      // Para admin: usar el nuevo endpoint de testigos
      this.backofficeAdminService.getTestigosPuestoAsignado().subscribe({
        next: (resp: any) => {
          const { testigos_asignados, testigos_no_asignados } = resp;
          
          // Separar testigos asignados y no asignados
          const testigosAsignados = testigos_asignados || [];
          const testigosNoAsignados = testigos_no_asignados || [];
          
          
          // Inicializar listas
          let testigosAsignadosFiltrados = [];
          
          // Si hay un puesto seleccionado, filtrar por ese puesto
          if (this.puestoSeleccionado) {
            testigosAsignadosFiltrados = testigosAsignados.filter((testigo: any) => {
              // Verificar que el testigo tenga mesas
              if (!testigo.mesas || !Array.isArray(testigo.mesas) || testigo.mesas.length === 0) {
                return false;
              }
              
              // Filtrar mesas del testigo por el puesto seleccionado
              const mesasDelPuesto = testigo.mesas.filter(
                (mesa: any) => mesa.codigo_puesto_votacion === this.puestoSeleccionado
              );
              
              // Si tiene mesas del puesto seleccionado, actualizar el array de mesas del testigo
              if (mesasDelPuesto.length > 0) {
                testigo.mesas = mesasDelPuesto;
                return true;
              }
              
              return false;
            });
          } else {
            // Si no hay puesto seleccionado, mostrar todos los testigos asignados
            testigosAsignadosFiltrados = testigosAsignados;
          }
          
          this.listTestigoAsignados = testigosAsignadosFiltrados;
          this.listTestigoNoAsignados = testigosNoAsignados;
          
          
          this.renderer();
          this.notFirstTime = true;
          this.loading = false;
          setTimeout(() => {
            this.applyPaginationStyles();
          }, 300);
        },
        error: (error: any) => {
          this.listTestigoAsignados = [];
          this.listTestigoNoAsignados = [];
          this.loading = false;
        }
      });
    } else {
      // Para coordinador: usar el endpoint tradicional con el ID del coordinador
      this.apiService.getTestigos().subscribe({
        next: (resp: any) => {
          const { testigos_asignados, testigos_no_asignados } = resp;
          
          
          // Inicializar listas
          let testigosAsignadosFiltrados = [];
          
          // Si hay un puesto seleccionado, filtrar por ese puesto
          if (this.puestoSeleccionado) {
            testigosAsignadosFiltrados = (testigos_asignados || []).filter((testigo: any) => {
              // Verificar que el testigo tenga mesas
              if (!testigo.mesas || !Array.isArray(testigo.mesas) || testigo.mesas.length === 0) {
                return false;
              }
              
              // Filtrar mesas del testigo por el puesto seleccionado
              const mesasDelPuesto = testigo.mesas.filter(
                (mesa: any) => mesa.codigo_puesto_votacion === this.puestoSeleccionado
              );
              
              // Si tiene mesas del puesto seleccionado, actualizar el array de mesas del testigo
              if (mesasDelPuesto.length > 0) {
                testigo.mesas = mesasDelPuesto;
                return true;
              }
              
              return false;
            });
          } else {
            // Si no hay puesto seleccionado, mostrar todos los testigos asignados
            testigosAsignadosFiltrados = testigos_asignados || [];
          }
          
          this.listTestigoAsignados = testigosAsignadosFiltrados;
          this.listTestigoNoAsignados = testigos_no_asignados || [];
          
          this.renderer();
          this.notFirstTime = true;
          this.loading = false;
          // Apply styles after rendering is complete
          setTimeout(() => {
            this.applyPaginationStyles();
          }, 300);
        },
        error: (error) => {
          this.listTestigoAsignados = [];
          this.listTestigoNoAsignados = [];
          this.loading = false;
        }
      });
    }
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

  redirectUpdateTestigo(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(['editarTestigo', idEncrypt]);
  }

  testigoActualSeleccionado(testigo: any, mesas?: any) {
    this.testigoActual = testigo;
    this.mesasActual = mesas;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  dataTableOptions() {
    this.dtOptionsTestigoAsignados = {
      destroy: true,
      processing: true,
      pageLength: 20,
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      },
    };
    this.dtOptionsTestigoNoAsignados = {
      destroy: true,
      processing: true,
      pageLength: 20,
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      },
    };
  }

  // ==========================================
  // MÉTODOS PARA COORDINADOR (flujo directo puesto)
  // ==========================================
  
  getPuestos() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
      if (this.dataStations.length > 0) {
        this.searchForm
          .get('puestos')
          ?.setValue(this.dataStations[0].codigo_unico);
        this.getSelectedStation(this.dataStations[0]);
      }
    });
  }

  getSelectedStation(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      this.puestoSeleccionado = codigo_unico;
      this.tabla = true;
      this.getTestigos();
    } else {
      this.puestoSeleccionado = '';
      this.tabla = false;
      // Si no hay puesto seleccionado, obtener todos los testigos
      this.getTestigos();
    }
  }

  // ==========================================
  // MÉTODOS PARA ADMIN (flujo cascada desde departamento)
  // ==========================================
  
  getDepartmentAdmin() {
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        this.dataDepartments = resp.departamentos || resp || [];
      },
      error: (error: any) => {
        this.dataDepartments = [];
      }
    });
  }

  getSelectedDepartment() {
    const dept = this.searchForm.get('departamento')?.value;
    if (dept) {
      this.selectedDepartment = dept;
      this.selectedMunicipal = '';
      this.selectedZone = '';
      this.puestoSeleccionado = '';
      this.searchForm.get('municipio')?.setValue(null);
      this.searchForm.get('zona')?.setValue(null);
      this.searchForm.get('puestos')?.setValue(null);
      this.getMunicipalAdmin(dept);
    } else {
      this.selectedDepartment = '';
      this.dataMunicipals = [];
      this.dataZones = [];
      this.dataStations = [];
    }
    this.getTestigos();
  }

  getMunicipalAdmin(codigoDepartamento: string) {
    this.loadingMunicipios = true;
    this.backofficeAdminService.getMunicipiosAdmin(codigoDepartamento).subscribe({
      next: (resp: any) => {
        this.dataMunicipals = resp.municipios || resp || [];
        this.loadingMunicipios = false;
      },
      error: (error: any) => {
        this.dataMunicipals = [];
        this.loadingMunicipios = false;
      }
    });
  }

  getSelectedMunicipal() {
    const munic = this.searchForm.get('municipio')?.value;
    if (munic) {
      this.selectedMunicipal = munic;
      this.selectedZone = '';
      this.puestoSeleccionado = '';
      this.searchForm.get('zona')?.setValue(null);
      this.searchForm.get('puestos')?.setValue(null);
      this.getZonasyGerentes(munic);
    } else {
      this.selectedMunicipal = '';
      this.dataZones = [];
      this.dataStations = [];
    }
    this.getTestigos();
  }

  getZonasyGerentes(codigoMunicipio: string) {
    this.loadingZonas = true;
    this.backofficeAdminService.getZonasPorMunicipio(codigoMunicipio).subscribe({
      next: (resp: any) => {
        this.dataZones = resp.zonas || resp || [];
        this.loadingZonas = false;
      },
      error: (error: any) => {
        this.dataZones = [];
        this.loadingZonas = false;
      }
    });
  }

  getSelectedZone() {
    const zona = this.searchForm.get('zona')?.value;
    if (zona) {
      this.selectedZone = zona;
      this.puestoSeleccionado = '';
      this.searchForm.get('puestos')?.setValue(null);
      this.dataStations = [];
      this.getPuestosySupervisores(zona);
    } else {
      this.selectedZone = '';
      this.dataStations = [];
      this.puestoSeleccionado = '';
    }
    this.getTestigos();
  }

  getPuestosySupervisores(codigoZona: string) {
    this.loadingPuestos = true;
    this.backofficeAdminService.getPuestosPorZona(codigoZona).subscribe({
      next: (resp: any) => {
        this.dataStations = resp.puestos || resp || [];
        this.loadingPuestos = false;
      },
      error: (error: any) => {
        this.dataStations = [];
        this.loadingPuestos = false;
      }
    });
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }
}

