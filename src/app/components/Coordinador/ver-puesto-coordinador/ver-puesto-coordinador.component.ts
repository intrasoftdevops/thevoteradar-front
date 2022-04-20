import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-ver-puesto-coordinador',
  templateUrl: './ver-puesto-coordinador.component.html',
  styleUrls: ['./ver-puesto-coordinador.component.scss']
})
export class VerPuestoCoordinadorComponent implements OnInit {

  tabla: boolean = false;
  dataStations: any = [];
  data: any = {
    testigos: {
      cantidad_testigos_existentes: '',
      cantidad_testigos_necesitados: '',
      cantidad_testigos_por_asignar: ''
    }
  };

  constructor(private apiService: ApiService,private alertService: AlertService) { }

  ngOnInit() {
    this.getPuestos();
  }

  getSelectedStation(item: any){
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico };
      this.getNecesitadosPuesto(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getPuestos() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getNecesitadosPuesto(data: any){
    this.apiService.getNecesitadosPuesto(data).subscribe((resp: any) => {
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
