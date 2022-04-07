import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ver-equipo-supervisor',
  templateUrl: './ver-equipo-supervisor.component.html',
  styleUrls: ['./ver-equipo-supervisor.component.scss']
})
export class VerEquipoSupervisorComponent implements OnInit {

  constructor() { }

  

  tablaCoordinadores: Boolean = true;
  tablaTestigos: Boolean = false;
  botonAtrasTestigos: Boolean = false;

  ngOnInit(): void {
  }

}
