import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
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
    this.apiService.logout().subscribe((resp: any) => {
      console.log(resp);
      this.apiService.deleteCookies();
      this.router.navigate(['']);
    }, (err: any) => {
      console.log(err);
      this.apiService.deleteCookies();
      this.router.navigate(['']);
    })
  }

}
