import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-ver-puesto-gerente',
  templateUrl: './ver-puesto-gerente.component.html',
  styleUrls: ['./ver-puesto-gerente.component.scss']
})
export class VerPuestoGerenteComponent implements OnInit {

  tabla: boolean = false;
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  data: any = {
    supervisores: {
      cantidad_supervisores_existentes: '',
      cantidad_supervisores_necesitados: '',
      cantidad_supervisores_por_asignar: ''
    },
    coordinadores: {
      cantidad_coordinadores_existentes: '',
      cantidad_coordinadores_necesitados: '',
      cantidad_coordinadores_por_asignar: ''
    },
    testigos: {
      cantidad_testigos_existentes: '',
      cantidad_testigos_necesitados: '',
      cantidad_testigos_por_asignar: ''
    }
  };

  constructor(private apiService: ApiService,private alertService: AlertService) { }

  ngOnInit() {
    this.getMunicipalAdmin();
  }

  getSelectedMunicipal(item: any){
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico };
      this.getNecesitadosMunicipio(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalGerente().subscribe(resp => {
      this.dataMunicipals = resp;
    }, (err: any) => {
      this.showError(err);
    });
  }

  getNecesitadosMunicipio(data: any) {
    this.apiService.getNecesitadosMunicipio(data).subscribe((resp: any) => {
      console.log(resp)
      this.data = resp;
      this.tabla = true;
    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    })
  }

  textColor(existentes: any, necesitados: any) {
    if (existentes == necesitados) {
      return 'text-success';
    } else if (existentes < necesitados) {
      return 'text-primary';
    } else {
      return 'text-danger'
    }
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  showError(err: any) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.message,
    });
  }

}
