import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ============================================
// THIRD-PARTY MODULES
// ============================================
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { LightboxModule } from 'ngx-lightbox';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxPermissionsModule } from 'ngx-permissions';

// ============================================
// SHARED COMPONENTS (Legacy - ubicados en components/)
// Se mantienen aquí para no romper imports existentes
// ============================================
import { LoadingComponent } from '../components/loading/loading.component';
import { FooterComponent } from '../components/footer/footer.component';
import { DropdownMenuUsersComponent } from '../components/dropdown-menu-users/dropdown-menu-users.component';
import { ThemeSelectorComponent } from '../components/shared/theme-selector/theme-selector.component';

// ============================================
// SHARED PIPES
// ============================================
import { RoleNamePipe } from './pipes/role-name.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

/**
 * SharedModule - Módulo para componentes, pipes y directivas reutilizables
 * 
 * ¿Qué va aquí?
 * - Componentes UI reutilizables (loading, footer, modals, etc.)
 * - Pipes personalizados
 * - Directivas personalizadas
 * - Re-exports de módulos de terceros usados en múltiples features
 * 
 * ¿Qué NO va aquí?
 * - Servicios singleton (van en CoreModule)
 * - Componentes específicos de un feature (van en su FeatureModule)
 * 
 * IMPORTANTE: Este módulo puede importarse en cualquier FeatureModule
 */
@NgModule({
  declarations: [
    // ============================================
    // UI COMPONENTS
    // ============================================
    LoadingComponent,
    FooterComponent,
    DropdownMenuUsersComponent,
    ThemeSelectorComponent,
    
    // ============================================
    // PIPES
    // ============================================
    RoleNamePipe,
    TruncatePipe,
    SafeHtmlPipe,
  ],
  imports: [
    // Angular Core
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // Third-party
    NgSelectModule,
    NgbModule,
    DataTablesModule,
    LightboxModule,
    NgxDropzoneModule,
    NgxPermissionsModule,
  ],
  exports: [
    // ============================================
    // RE-EXPORT ANGULAR MODULES
    // Para que los features no tengan que importarlos
    // ============================================
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // ============================================
    // RE-EXPORT THIRD-PARTY MODULES
    // ============================================
    NgSelectModule,
    NgbModule,
    DataTablesModule,
    LightboxModule,
    NgxDropzoneModule,
    NgxPermissionsModule,
    
    // ============================================
    // EXPORT SHARED COMPONENTS
    // ============================================
    LoadingComponent,
    FooterComponent,
    DropdownMenuUsersComponent,
    ThemeSelectorComponent,
    
    // ============================================
    // EXPORT PIPES
    // ============================================
    RoleNamePipe,
    TruncatePipe,
    SafeHtmlPipe,
  ],
})
export class SharedModule {}
