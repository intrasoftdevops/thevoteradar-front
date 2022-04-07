import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ver-equipo-admin',
  templateUrl: './ver-equipo-admin.component.html',
  styleUrls: ['./ver-equipo-admin.component.scss']
})
export class VerEquipoAdminComponent implements OnInit {

  constructor() { }

  tablaGerentes: Boolean = true;
  tablaSupervisores: Boolean = false;
  tablaCoordinadores: Boolean = false;
  tablaTestigos: Boolean = false;
  botonAtrasSupervisores: Boolean = false;
  botonAtrasCoordinadores: Boolean = false;
  botonAtrasTestigos: Boolean = false;

  ngOnInit(): void {
  }

}
