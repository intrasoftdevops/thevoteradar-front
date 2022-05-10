import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-votos-coordinador',
  templateUrl: './reporte-votos-coordinador.component.html',
  styleUrls: ['./reporte-votos-coordinador.component.scss']
})
export class ReporteVotosCoordinadorComponent implements OnInit {

  tabla: boolean = false;
  dataStations: any = [];
  listMesas: any = [];
  reporte: any = {};
  listReportes: any = [];
  photos: any = [];
  totalVotosMesas: number = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getStationsTestigo();
  }

  ModalReporteActual(mesa: any) {
    console.log(mesa)
    this.photos = [];
    this.listReportes = [];
    this.reporte = mesa;
    console.log(this.reporte.reporte)
    this.listReportes = this.reporte.reporte.reportes;
    this.photos = mesa.reporte.archivos;
    this.totalVotosMesas = this.listReportes.reduce((acc:any,obj:any,) => acc + (obj.numero_votos),0);
  }

  getVotosCoordinador(data: any) {
    this.apiService.getVotosCoordinador(data).subscribe((resp: any) => {
      console.log(resp)
      const { puesto } = resp;
      const { mesas_reportadas } = puesto;
      this.listMesas = mesas_reportadas;
    })
  }

  getStationsTestigo() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
    })
  }

  getSelectedValue(item: any) {
    if (item) {
      this.tabla = true;
      const data = { puesto: item.codigo_unico }
      this.getVotosCoordinador(data);
    } else {
      this.tabla = false;
      this.listMesas = [];
    }
  }


}
