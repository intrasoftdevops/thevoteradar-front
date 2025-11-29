import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { filter, Subscription } from 'rxjs';
import { LocalDataService } from './services/localData/local-data.service';
import { ApiService } from './services/api/api.service';
import { environment } from '../environments/environment';
import { ConfigService } from './services/config/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  rol: any = '';
  subscriber!: Subscription;
  public isDevelopmentMode: boolean = this.checkDevelopmentMode();

  constructor(
    private localData: LocalDataService,
    private router: Router,
    private permissionsService: NgxPermissionsService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.permissionsService.addPermission([this.getRol()]);
    this.subscriber = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(({ urlAfterRedirects }: any) => {
        this.permissionsService.addPermission([this.getRol()]);
        if (urlAfterRedirects != '/forbidden') {
          localStorage.setItem('previosUrl', urlAfterRedirects);
        }
        if (localStorage.getItem('previosUrl') == '/forbidden') {
          this.router.navigate(['/']);
        }
      });
  }

  getRol(): any {
    this.rol = this.localData.getRol() != '' ? this.localData.getRol() : ['0'];
    
    return this.rol;
  }

  private checkDevelopmentMode(): boolean {
    try {
      const config = this.configService.getConfig();
      return config.development && 
             !config.production && 
             (window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1' ||
              window.location.hostname.includes('dev') ||
              window.location.hostname.includes('test'));
    } catch {
      return environment.development && 
             !environment.production && 
             (window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1' ||
              window.location.hostname.includes('dev') ||
              window.location.hostname.includes('test'));
    }
  }
}
