import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-supervisor',
  templateUrl: './menu-supervisor.component.html',
  styleUrls: ['./menu-supervisor.component.scss']
})
export class MenuSupervisorComponent implements OnInit {

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
  }

  logout() {
    this.apiService.logout().subscribe((resp: any) => {
      console.log(resp);
      this.apiService.deleteCookies();
      this.router.navigate(['']);
    }, err => console.log(err))
  }

}
