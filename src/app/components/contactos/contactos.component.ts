import { Component, OnInit } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { CustomValidationService } from '../../services/custom-validation.service';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.component.html',
  styleUrls: ['./contactos.component.scss']
})
export class ContactosComponent implements OnInit {

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
  updateForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    numero_contacto: ['', Validators.required],
    apodo: ['', Validators.required],
    como_te_dice: ['', Validators.required],
  });
  listContactos: any = [];

  constructor(private apiService: ApiService, private router: Router, private alertService: AlertService, private fb: FormBuilder, private customValidator: CustomValidationService) {
  }

  ngOnInit() {
    this.getContactos();
    this.innerWidth = window.innerWidth;
    this.resizeObservable$ = fromEvent(window, 'resize')
    this.resizeSubscription$ = this.resizeObservable$.subscribe(() => {
      this.innerWidth = window.innerWidth;
    })
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get updateFormControl() {
    return this.updateForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    console.log(this.createForm.value)
    if (this.createForm.valid) {
      console.log(this.createForm.value)
      this.apiService.createContacto(this.createForm.value).subscribe((resp: any) => {

        this.alertService.successAlert(resp.message);

      }, (err: any) => {
        console.log(err);
        this.alertService.errorAlert(err.message);
      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  deleteContacto(id: any) {
    this.apiService.deleteContacto(id).subscribe((resp: any) => {
      console.log(resp);
    }, (err: any) => {
      console.log(err)
    })
  }

  updateData(contacto: any) {
    this.updateForm.get('nombres')?.setValue(contacto.nombres);
    this.updateForm.get('apellidos')?.setValue(contacto.apellidos);
    this.updateForm.get('apodo')?.setValue(contacto.apodo);
    this.updateForm.get('como_te_dice')?.setValue(contacto.como_te_dice);
    this.updateForm.get('numero_contacto')?.setValue(contacto.numero_contacto);
  }

  onSubmitItem(id: any) {
    console.log(this.updateForm.value)
    if (this.updateForm.valid) {
      console.log(this.updateForm.value)
      this.apiService.updateContacto(id,this.updateForm.value).subscribe((resp: any) => {
        console.log(resp)

        this.alertService.successAlert(resp.message);

      }, (err: any) => {
        console.log(err);
        this.alertService.errorAlert(err.message);
      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  getContactos() {
    this.apiService.getContactos().subscribe((resp: any) => {
      this.listContactos = resp;
      console.log(resp)
    }, (err: any) => {
      console.log(err)
    })
  }

}
