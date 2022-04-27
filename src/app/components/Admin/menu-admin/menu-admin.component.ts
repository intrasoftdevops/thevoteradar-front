import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { Router } from '@angular/router';

import { AlertService } from '../../../services/alert/alert.service';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.scss']
})
export class MenuAdminComponent implements OnInit {

  listGerenteAsignados: any = [];
  listGerenteNoAsignados: any = [];
  innerWidth: any;
  resizeObservable$!: Observable<Event>;
  resizeSubscription$!: Subscription;
  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    numero_contacto: ['', Validators.required],
    apodo: ['', Validators.required],
    como_te_dice: ['', Validators.required],
  });

  constructor(private apiService: ApiService, private router: Router, private fb: FormBuilder, private localData: LocalDataService) {
  }

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
