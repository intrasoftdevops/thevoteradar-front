import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../services/theme/theme.service';
import { Theme } from '../../../models/theme.model';

@Component({
  selector: 'app-menu-coordinador',
  templateUrl: './menu-coordinador.component.html',
  styleUrls: ['./menu-coordinador.component.scss']
})
export class MenuCoordinadorComponent implements OnInit {
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

  ngOnInit(): void {
  }

}
