import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

import { AlertService } from '../../../services/alert.service';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/custom-validation.service';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.scss']
})
export class MenuAdminComponent implements OnInit {

  showLoading:boolean = false;
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

  constructor(private apiService: ApiService, private router: Router, private alertService: AlertService, private fb: FormBuilder, private customValidator: CustomValidationService) {
  }

  ngOnInit() {
  }

  logout() {
    this.showLoading = true;
    this.apiService.logout().subscribe((resp: any) => {
      this.showLoading = false;
      console.log(resp);
      this.apiService.deleteCookies();
      this.router.navigate(['']);
    }, (err: any) => {
      this.showLoading = false;
      console.log(err);
      this.apiService.deleteCookies();
      this.router.navigate(['']);
    })
  }

}
