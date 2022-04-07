import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ver-equipo-gerente',
  templateUrl: './ver-equipo-gerente.component.html',
  styleUrls: ['./ver-equipo-gerente.component.scss']
})
export class VerEquipoGerenteComponent implements OnInit {

  constructor() { }


  tablaSupervisores: Boolean = true;
  tablaCoordinadores: Boolean = false;
  tablaTestigos: Boolean = false;
  botonAtrasCoordinadores: Boolean = false;
  botonAtrasTestigos: Boolean = false;


  ngOnInit(): void {
  }

}
