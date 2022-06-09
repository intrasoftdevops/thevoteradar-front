import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { filter, Subscription } from 'rxjs';
import { LocalDataService } from './services/localData/local-data.service';
import { ApiService } from './services/api/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  rol: any = '';
  subscriber!: Subscription;

  constructor(private localData: LocalDataService, private router: Router,
    private permissionsService: NgxPermissionsService, private apiService: ApiService) {
  }

  ngOnInit() {
    this.permissionsService.addPermission([this.getRol()]);
    this.subscriber = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(({ urlAfterRedirects }: any) => {
      if (urlAfterRedirects != "/") {
        this.getIdOnlineUser();
      }
      this.permissionsService.addPermission([this.getRol()]);
      if (urlAfterRedirects != "/forbidden") {
        localStorage.setItem('previosUrl', urlAfterRedirects);
      }
      if (localStorage.getItem('previosUrl') == "/forbidden") {
        this.router.navigate(['']);
      }
    });
  }

  getRol(): any {
    this.rol = this.localData.getRol() != '' ? this.localData.getRol() : ["0"];
    return this.rol;
  }

  getIdOnlineUser(): any {
    this.apiService.getIdOnlineUser().subscribe({
      error: (e) => {
        console.log(e);
        this.localData.deleteCookies();
        this.router.navigate(['']);
      }
    })
  }

}
