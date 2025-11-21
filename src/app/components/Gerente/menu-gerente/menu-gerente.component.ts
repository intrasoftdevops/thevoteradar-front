import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { ThemeService } from '../../../services/theme/theme.service';
import { Theme } from '../../../models/theme.model';

@Component({
  selector: 'app-menu-gerente',
  templateUrl: './menu-gerente.component.html',
  styleUrls: ['./menu-gerente.component.scss']
})
export class MenuGerenteComponent implements OnInit {
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
