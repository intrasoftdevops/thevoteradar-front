import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../services/theme/theme.service';
import { Theme } from '../../../models/theme.model';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.scss']
})
export class MenuAdminComponent implements OnInit {
  public currentTheme: Theme | null = null;
  public logo: string = '../../../../assets/logo.png';

  constructor(private themeService: ThemeService) {
    // Suscribirse a cambios de tema para actualizar branding
    this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme;
      if (theme.branding) {
        this.logo = theme.branding.logo;
      }
    });
  }

  ngOnInit() {
  }


}
