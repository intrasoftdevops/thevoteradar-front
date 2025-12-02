import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss']
})
export class ThemeSelectorComponent {
  public showThemeSelector: boolean = false;

  constructor(private themeService: ThemeService) {}

  changeTheme(themeId: string) {
    this.themeService.setTheme(themeId);
    this.showThemeSelector = false;
  }

  toggleSelector() {
    this.showThemeSelector = !this.showThemeSelector;
  }
}


