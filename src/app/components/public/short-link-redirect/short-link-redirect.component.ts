import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/**
 * Componente para manejar la redirección de short links.
 * 
 * Similar al middleware de Next.js, intercepta rutas que parecen short codes
 * y las redirige a través del backend del survey module.
 */
@Component({
  selector: 'app-short-link-redirect',
  template: `
    <div class="container mt-5 text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Redirigiendo...</span>
      </div>
      <p class="mt-3">Redirigiendo...</p>
    </div>
  `
})
export class ShortLinkRedirectComponent implements OnInit {
  shortCode: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.shortCode = this.route.snapshot.paramMap.get('shortCode');
    
    if (!this.shortCode) {
      this.router.navigate(['/']);
      return;
    }

    // El guard ya validó que es un short code válido, proceder con la redirección
    this.redirectToLongUrl();
  }

  redirectToLongUrl(): void {
    if (!this.shortCode) return;

    // Obtener el dominio y protocolo actual del frontend
    const currentHost = window.location.host;
    const currentProto = window.location.protocol.slice(0, -1); // http o https
    
    // Construir la URL del backend del survey module
    const surveyApiUrl = environment.surveyApiURL || '';
    if (!surveyApiUrl) {
      console.error('Survey API URL no configurada');
      this.handleError();
      return;
    }
    
    // Extraer la base URL del backend (sin /api/v1)
    let backendBase = surveyApiUrl;
    if (backendBase.includes('/api/v1')) {
      backendBase = backendBase.replace('/api/v1', '');
    } else if (backendBase.includes('/api')) {
      backendBase = backendBase.replace('/api', '');
    }
    backendBase = backendBase.replace(/\/$/, ''); // Remover trailing slash
    
    // Hacer fetch al backend para obtener la redirección
    // El backend reconstruirá la long_url con el dominio del frontend actual
    fetch(`${backendBase}/${this.shortCode}`, {
      method: 'GET',
      redirect: 'manual', // No seguir redirects automáticamente
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        // Pasar el dominio actual para que el backend reconstruya la URL con este dominio
        'X-Forwarded-Host': currentHost,
        'X-Forwarded-Proto': currentProto,
      },
    })
    .then(response => {
      // Si el backend devuelve un redirect (302/301), extraer la Location
      if (response.status === 302 || response.status === 301) {
        const location = response.headers.get('Location');
        if (location) {
          // La location ya viene con el dominio correcto desde el backend
          // Redirigir a esa URL
          window.location.href = location;
        } else {
          this.handleError();
        }
      } else if (response.ok) {
        // Si la respuesta es OK, intentar obtener la URL del body o headers
        const location = response.headers.get('Location');
        if (location) {
          window.location.href = location;
        } else {
          this.handleError();
        }
      } else {
        this.handleError();
      }
    })
    .catch(error => {
      console.error('Error al obtener short link del backend:', error);
      this.handleError();
    });
  }

  handleError(): void {
    // Si hay error o el short code no existe, redirigir al inicio
    this.router.navigate(['/']);
  }
}

