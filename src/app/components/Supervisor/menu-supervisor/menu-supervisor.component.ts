import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-menu-supervisor',
  templateUrl: './menu-supervisor.component.html',
  styleUrls: ['./menu-supervisor.component.scss']
})
export class MenuSupervisorComponent implements OnInit {

  listCoordinadorAsignados: any = [];
  listCoordinadorNoAsignados: any = [];

  constructor(private apiService: ApiService, private router: Router, private localData: LocalDataService) { }

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
