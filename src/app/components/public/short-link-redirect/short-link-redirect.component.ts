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
    
    console.log(`[ShortLinkRedirect] Obteniendo long_url para short code: ${this.shortCode}`);
    console.log(`[ShortLinkRedirect] Backend base: ${backendBase}`);
    
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
      console.log(`[ShortLinkRedirect] Respuesta del backend: ${response.status}`);
      
      // Si el backend devuelve un redirect (302/301), extraer la Location
      if (response.status === 302 || response.status === 301 || response.status === 307 || response.status === 308) {
        const location = response.headers.get('Location');
        console.log(`[ShortLinkRedirect] Location header: ${location}`);
        
        if (location) {
          // Parsear la URL para extraer path y query params
          try {
            const url = new URL(location, window.location.origin);
            const path = url.pathname;
            const search = url.search;
            const fullPath = path + search;
            
            console.log(`[ShortLinkRedirect] Redirigiendo a: ${fullPath}`);
            
            // Usar router.navigate en lugar de window.location.href para evitar loops
            // Si la URL es del mismo dominio, usar router.navigate
            if (url.hostname === window.location.hostname || url.hostname === currentHost) {
              this.router.navigateByUrl(fullPath).catch(err => {
                console.error('[ShortLinkRedirect] Error al navegar:', err);
                // Si falla la navegación con router, usar window.location como fallback
                window.location.href = location;
              });
            } else {
              // Si es otro dominio, usar window.location
              window.location.href = location;
            }
          } catch (e) {
            console.error('[ShortLinkRedirect] Error al parsear URL:', e);
            // Si la location es relativa, intentar navegar directamente
            if (location.startsWith('/')) {
              this.router.navigateByUrl(location).catch(() => {
                window.location.href = location;
              });
            } else {
              this.handleError();
            }
          }
        } else {
          console.error('[ShortLinkRedirect] No se encontró header Location en la respuesta');
          this.handleError();
        }
      } else if (response.status === 404) {
        console.error('[ShortLinkRedirect] Short code no encontrado (404)');
        this.handleError();
      } else {
        console.error(`[ShortLinkRedirect] Respuesta inesperada del backend: ${response.status}`);
        this.handleError();
      }
    })
    .catch(error => {
      console.error('[ShortLinkRedirect] Error al obtener short link del backend:', error);
      this.handleError();
    });
  }

  handleError(): void {
    // Si hay error o el short code no existe, redirigir al inicio
    console.error('[ShortLinkRedirect] Error: redirigiendo al inicio');
    // Usar replace para evitar que el usuario pueda volver atrás a una página de error
    this.router.navigate(['/'], { replaceUrl: true });
  }
}

