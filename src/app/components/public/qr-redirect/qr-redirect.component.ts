import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/**
 * Componente para manejar la redirección de QR codes a WhatsApp.
 * 
 * El QR apunta a: /qr/{tenant_id}
 * Este componente obtiene la URL de WhatsApp desde el backend y redirige.
 */
@Component({
  selector: 'app-qr-redirect',
  template: `
    <div class="container mt-5 text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Redirigiendo a WhatsApp...</span>
      </div>
      <p class="mt-3">Redirigiendo a WhatsApp...</p>
    </div>
  `
})
export class QrRedirectComponent implements OnInit {
  tenantId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.tenantId = this.route.snapshot.paramMap.get('tenantId');
    
    if (!this.tenantId) {
      this.handleError();
      return;
    }

    // Obtener la URL de WhatsApp desde el backend y redirigir
    this.redirectToWhatsApp();
  }

  redirectToWhatsApp(): void {
    if (!this.tenantId) {
      this.handleError();
      return;
    }

    // Obtener la URL del backend
    const backofficeApiUrl = environment.backofficeApiURL || '';
    if (!backofficeApiUrl) {
      console.error('Backoffice API URL no configurada');
      this.handleError();
      return;
    }

    // Construir la URL del endpoint
    const apiUrl = `${backofficeApiUrl}/qr/${this.tenantId}/url`;
    
    // Hacer petición al backend para obtener la URL de WhatsApp
    this.http.get<{
      tenant_id: string;
      whatsapp_url: string;
      numero: string;
      mensaje: string;
      qr_url: string;
    }>(apiUrl).subscribe({
      next: (data) => {
        if (data.whatsapp_url) {
          // Redirigir directamente a WhatsApp
          window.location.href = data.whatsapp_url;
        } else {
          console.error('No se recibió URL de WhatsApp');
          this.handleError();
        }
      },
      error: (error) => {
        console.error('Error obteniendo URL de WhatsApp:', error);
        // Si hay error, intentar redirigir a WhatsApp genérico
        this.handleError();
      }
    });
  }

  handleError(): void {
    // Si hay error, redirigir a WhatsApp genérico o página de error
    // Por ahora, redirigimos a la página principal
    this.router.navigate(['/'], { replaceUrl: true });
  }
}

