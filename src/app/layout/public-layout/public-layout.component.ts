import { Component } from '@angular/core';

/**
 * PublicLayoutComponent - Layout para páginas públicas (sin autenticación)
 * 
 * Usado para:
 * - Landing pages de encuestas
 * - Páginas de error (404, 403)
 * - Login
 */
@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent {}

