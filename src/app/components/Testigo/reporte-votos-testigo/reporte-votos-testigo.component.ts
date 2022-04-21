import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-reporte-votos-testigo',
  templateUrl: './reporte-votos-testigo.component.html',
  styleUrls: ['./reporte-votos-testigo.component.scss']
})
export class ReporteVotosTestigoComponent implements OnInit {

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getVotosTestigo();
  }

  getVotosTestigo(){
    this.apiService.getVotosTestigo().subscribe(resp =>{
      console.log(resp)
    }, (err: any)=>{
      console.log(err)
    })
  }

}
