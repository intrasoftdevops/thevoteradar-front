import { Component, OnInit } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../services/api/api.service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { CustomValidationService } from '../../services/validations/custom-validation.service';
import Swal from 'sweetalert2';

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
    if (this.createForm.valid) {
      this.apiService.createContacto(this.createForm.value).subscribe((resp: any) => {
        this.createForm.reset();
        this.getContactos();
        this.successAlert(resp.message);
      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  deleteContacto(id: any) {
    Swal.fire({
      icon: 'warning',
      title: '¿Esta seguro de borrar este contacto?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteContacto(id).subscribe((resp: any) => {
          this.successAlert(resp.message);
          this.getContactos();
        })
      }
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
    if (this.updateForm.valid) {
      this.apiService.updateContacto(id, this.updateForm.value).subscribe((resp: any) => {
        this.updateForm.reset();
        this.getContactos();
        this.successAlert(resp.message);
      });
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  getContactos() {
    this.apiService.getContactos().subscribe((resp: any) => {
      this.listContactos = resp;
    })
  }

  successAlert(message: any) {
    Swal.fire({
      icon: 'success',
      title: message,
    });
  }

}
