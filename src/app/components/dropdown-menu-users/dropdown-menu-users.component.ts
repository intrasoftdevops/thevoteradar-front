import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDataService } from '../../services/localData/local-data.service';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-dropdown-menu-users',
  templateUrl: './dropdown-menu-users.component.html',
  styleUrls: ['./dropdown-menu-users.component.scss']
})
export class DropdownMenuUsersComponent implements OnInit {

  constructor(private apiService: ApiService, private router:Router,private localData: LocalDataService) { }

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
