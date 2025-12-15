import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

// Layout Components
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { RoleMenuComponent } from './components/role-menu/role-menu.component';
import { SidebarMenuComponent } from './components/sidebar-menu/sidebar-menu.component';

/**
 * LayoutModule - Contiene los layouts principales de la aplicación
 * 
 * Layouts disponibles:
 * - MainLayout: Layout legacy con menús por rol
 * - AdminLayout: Nuevo layout con sidebar moderno (tenant-aware)
 * - PublicLayout: Para páginas públicas (sin sidebar, header mínimo)
 * 
 * Componentes:
 * - SidebarMenu: Nuevo menú lateral con módulos principales
 * - Sidebar: Contenedor de navegación lateral (legacy)
 * - Header: Barra superior con usuario y acciones
 * - RoleMenu: Menú dinámico basado en el rol del usuario (legacy)
 */
@NgModule({
  declarations: [
    // Layouts
    MainLayoutComponent,
    PublicLayoutComponent,
    AdminLayoutComponent,
    
    // Components
    SidebarComponent,
    HeaderComponent,
    RoleMenuComponent,
    SidebarMenuComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ],
  exports: [
    // Layouts
    MainLayoutComponent,
    PublicLayoutComponent,
    AdminLayoutComponent,
    
    // Components
    SidebarComponent,
    HeaderComponent,
    RoleMenuComponent,
    SidebarMenuComponent,
  ],
})
export class LayoutModule {}
