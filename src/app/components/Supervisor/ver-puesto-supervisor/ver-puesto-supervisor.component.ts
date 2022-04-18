import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-ver-puesto-supervisor',
  templateUrl: './ver-puesto-supervisor.component.html',
  styleUrls: ['./ver-puesto-supervisor.component.scss']
})
export class VerPuestoSupervisorComponent implements OnInit {

  tabla: boolean = false;
  dataZones: any = [];
  dataStations: any = [];
  selectedStation: any = [];
  data: any = {
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

  ngOnInit(): void {
    this.getZonas();

  }

  getSelectedZone(item: any){
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico };
      this.getNecesitadosZona(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getNecesitadosZona(data: any){
    this.apiService.getNecesitadosZona(data).subscribe((resp: any) => {
      console.log(resp)
      this.data = resp;
      this.tabla = true;
    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    })
  }

  getZonas() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
    }, (err: any) => {
      this.showError(err);
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
