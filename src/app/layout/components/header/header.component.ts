import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ThemeService } from '../../../services/theme/theme.service';
import { Theme } from '../../../core/models/theme.model';

/**
 * HeaderComponent - Barra superior de la aplicación
 * 
 * Contiene:
 * - Logo/branding del tenant
 * - Toggle de sidebar
 * - Nombre del rol
 * - Menú de usuario (perfil, logout)
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() roleName = '';
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  
  currentTheme: Theme | null = null;
  showUserMenu = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }
}

