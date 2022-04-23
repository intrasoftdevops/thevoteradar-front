import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-testigo',
  templateUrl: './menu-testigo.component.html',
  styleUrls: ['./menu-testigo.component.scss']
})
export class MenuTestigoComponent implements OnInit {

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        this.apiService.deleteCookies();
        this.router.navigate(['']);
      },
      error: () => {
        this.apiService.deleteCookies();
        this.router.navigate(['']);
      }
    })
  }

}
