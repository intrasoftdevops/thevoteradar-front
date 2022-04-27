import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-menu-testigo',
  templateUrl: './menu-testigo.component.html',
  styleUrls: ['./menu-testigo.component.scss']
})
export class MenuTestigoComponent implements OnInit {

  constructor(private apiService: ApiService, private router: Router, private localData: LocalDataService) { }

  ngOnInit(): void {
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
