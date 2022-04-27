import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-impugnador',
  templateUrl: './menu-impugnador.component.html',
  styleUrls: ['./menu-impugnador.component.scss']
})
export class MenuImpugnadorComponent implements OnInit {

  constructor(private apiService: ApiService, private localData: LocalDataService, private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        this.localData.deleteCookies();
        this.router.navigate(['']);
      },
      error: () => {
        this.localData.deleteCookies();
        this.router.navigate(['']);
      }
    })
  }

}
