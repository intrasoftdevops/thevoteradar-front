import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../services/theme/theme.service';
import { Theme } from '../../../core/models/theme.model';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.scss']
})
export class MenuAdminComponent implements OnInit, OnDestroy {
  currentTheme: Theme | null = null;
  logo: string = '../../../assets/logo.png'; // Logo por defecto
  private themeSubscription: Subscription | null = null;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit() {
    // Suscribirse al tema actual para aplicar colores dinámicos y logo
    this.themeSubscription = this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme;
      // Actualizar logo según el tema
      if (theme.branding && theme.branding.logo) {
        this.logo = theme.branding.logo;
      } else {
        // Si no hay logo en el tema, usar el por defecto
        this.logo = '../../../assets/logo.png';
      }
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  // Métodos helper para manejar eventos hover con TypeScript
  onNavLinkHoverEnter(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }
  }

  onNavLinkHoverLeave(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.backgroundColor = '';
    }
  }

  onDropdownItemHoverEnter(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.backgroundColor = 'var(--color-accent)';
      target.style.color = 'var(--color-surface)';
    }
  }

  onDropdownItemHoverLeave(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.backgroundColor = '';
      target.style.color = 'var(--color-surface)';
    }
  }
}
