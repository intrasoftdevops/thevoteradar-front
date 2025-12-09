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
      console.error('[ShortLinkRedirect] Survey API URL no configurada');
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
    console.log(`[ShortLinkRedirect] URL completa: ${backendBase}/${this.shortCode}`);
    
    // Intentar primero con HttpClient (puede manejar mejor CORS a través de interceptores)
    // Si falla, usar fetch como fallback
    this.tryHttpClient(backendBase, currentHost, currentProto);
  }

  private tryHttpClient(backendBase: string, currentHost: string, currentProto: string): void {
    // HttpClient y XMLHttpRequest siguen redirects automáticamente, lo cual causa problemas
    // Usar fetch directamente con redirect: 'manual'
    this.tryFetchFallback(backendBase, currentHost, currentProto);
  }

  private tryFetchFallback(backendBase: string, currentHost: string, currentProto: string): void {
    if (!this.shortCode) return;
    
    // Usar el endpoint /url que devuelve JSON en lugar de hacer redirect
    // Esto evita problemas de CORS con redirects
    const url = `${backendBase}/${this.shortCode}/url`;
    console.log(`[ShortLinkRedirect] Obteniendo URL desde endpoint JSON: ${url}`);
    
    // Hacer petición al endpoint que devuelve JSON
    fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'X-Forwarded-Host': currentHost,
        'X-Forwarded-Proto': currentProto,
      },
    })
    .then(response => {
      console.log(`[ShortLinkRedirect] Fetch response status: ${response.status}`);
      
      if (response.ok) {
        // El endpoint devuelve JSON con la URL
        response.json().then(data => {
          console.log(`[ShortLinkRedirect] URL obtenida: ${data.url}`);
          if (data.url) {
            this.handleRedirect(data.url, currentHost);
          } else {
            console.error('[ShortLinkRedirect] No se encontró URL en la respuesta');
            this.handleError();
          }
        }).catch(err => {
          console.error('[ShortLinkRedirect] Error al parsear JSON:', err);
          this.handleError();
        });
      } else if (response.status === 404) {
        console.error('[ShortLinkRedirect] Short code no encontrado (404)');
        this.handleError();
      } else {
        console.error(`[ShortLinkRedirect] Respuesta inesperada: ${response.status}`);
        this.handleError();
      }
    })
    .catch(err => {
      console.error('[ShortLinkRedirect] Error en fetch:', err);
      this.handleError();
    });
  }


  private handleRedirect(location: string, currentHost: string): void {
    try {
      const url = new URL(location, window.location.origin);
      const path = url.pathname;
      const search = url.search;
      const fullPath = path + search;
      
      console.log(`[ShortLinkRedirect] Redirigiendo a: ${fullPath}`);
      
      // Si la URL es del mismo dominio, usar router.navigate
      if (url.hostname === window.location.hostname || url.hostname === currentHost || !url.hostname || url.hostname === '') {
        this.router.navigateByUrl(fullPath).catch(err => {
          console.error('[ShortLinkRedirect] Error al navegar con router:', err);
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
  }

  handleError(): void {
    // Si hay error o el short code no existe, redirigir al inicio
    console.error('[ShortLinkRedirect] Error: redirigiendo al inicio');
    // Usar replace para evitar que el usuario pueda volver atrás a una página de error
    this.router.navigate(['/'], { replaceUrl: true });
  }
}

