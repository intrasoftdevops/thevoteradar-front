import { Component, Input } from '@angular/core';

/**
 * SidebarComponent - Barra lateral de navegación
 * 
 * Contenedor para el menú, recibe el contenido dinámico
 * a través de content projection
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;
}

