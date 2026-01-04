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
    console.log('📞 Obteniendo testigos...');
    console.log('📍 Puesto seleccionado:', this.puestoSeleccionado);
    
    this.apiService.getTestigos().subscribe((resp: any) => {
      console.log('✅ Respuesta de testigos:', resp);
      const { testigos_asignados, testigos_no_asignados } = resp;
      
      console.log(`📊 Testigos recibidos del backend: ${testigos_asignados?.length || 0} asignados, ${testigos_no_asignados?.length || 0} no asignados`);
      
      // Inicializar listas
      let testigosAsignadosFiltrados = [];
      
      // Si hay un puesto seleccionado, filtrar por ese puesto
      if (this.puestoSeleccionado) {
        console.log(`🔍 Filtrando testigos por puesto: ${this.puestoSeleccionado}`);
        testigosAsignadosFiltrados = (testigos_asignados || []).filter((testigo: any) => {
          // Verificar que el testigo tenga mesas
          if (!testigo.mesas || !Array.isArray(testigo.mesas) || testigo.mesas.length === 0) {
            console.log(`⚠️ Testigo ${testigo.id} no tiene mesas`);
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
        console.log(`✅ Testigos filtrados por puesto: ${testigosAsignadosFiltrados.length}`);
      } else {
        // Si no hay puesto seleccionado, mostrar todos los testigos asignados
        console.log('📋 Mostrando todos los testigos asignados (sin filtro de puesto)');
        testigosAsignadosFiltrados = testigos_asignados || [];
      }
      
      this.listTestigoAsignados = testigosAsignadosFiltrados;
      this.listTestigoNoAsignados = testigos_no_asignados || [];
      
      console.log(`📋 Testigos finales: ${this.listTestigoAsignados.length} asignados, ${this.listTestigoNoAsignados.length} no asignados`);
      
      // Mostrar detalles de los primeros testigos asignados para debug
      if (this.listTestigoAsignados.length > 0) {
        console.log('📝 Primeros testigos asignados:', this.listTestigoAsignados.slice(0, 3).map((t: any) => ({
          id: t.id,
          nombre: `${t.nombres} ${t.apellidos}`,
          mesas: t.mesas?.length || 0
        })));
      }
      
      this.renderer();
      this.notFirstTime = true;
    }, (error) => {
      console.error('❌ Error al obtener testigos:', error);
      this.listTestigoAsignados = [];
      this.listTestigoNoAsignados = [];
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
    });
  }

  redirectUpdateTestigo(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(['editarTestigo', idEncrypt]);
  }

  testigoActualSeleccionado(testigo: any, mesas?: any) {
    this.testigoActual = testigo;
    this.mesasActual = mesas;
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
      console.log('📍 Puesto seleccionado:', this.puestoSeleccionado);
      this.tabla = true;
      this.getTestigos();
    } else {
      this.puestoSeleccionado = '';
      console.log('📍 Puesto deseleccionado');
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
        console.log('✅ Departamentos cargados:', resp);
        this.dataDepartments = resp.departamentos || resp || [];
      },
      error: (error: any) => {
        console.error('❌ Error al cargar departamentos:', error);
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
    console.log('📞 Llamando a getMunicipiosAdmin con código:', codigoDepartamento);
    this.loadingMunicipios = true;
    this.backofficeAdminService.getMunicipiosAdmin(codigoDepartamento).subscribe({
      next: (resp: any) => {
        console.log('✅ Respuesta de municipios:', resp);
        this.dataMunicipals = resp.municipios || resp || [];
        console.log('📋 Municipios cargados:', this.dataMunicipals.length, 'municipios');
        this.loadingMunicipios = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar municipios:', error);
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
    console.log('📞 Llamando a getZonasPorMunicipio con código:', codigoMunicipio);
    this.loadingZonas = true;
    this.backofficeAdminService.getZonasPorMunicipio(codigoMunicipio).subscribe({
      next: (resp: any) => {
        console.log('✅ Respuesta de zonas:', resp);
        this.dataZones = resp.zonas || resp || [];
        console.log('📋 Zonas cargadas:', this.dataZones.length, 'zonas');
        this.loadingZonas = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar zonas:', error);
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
    console.log('📞 Llamando a getPuestosPorZona con código:', codigoZona);
    this.loadingPuestos = true;
    this.backofficeAdminService.getPuestosPorZona(codigoZona).subscribe({
      next: (resp: any) => {
        console.log('✅ Respuesta de puestos:', resp);
        this.dataStations = resp.puestos || resp || [];
        console.log('📋 Puestos cargados:', this.dataStations.length, 'puestos');
        this.loadingPuestos = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar puestos:', error);
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
