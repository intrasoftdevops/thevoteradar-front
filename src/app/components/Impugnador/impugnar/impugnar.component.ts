import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-impugnar',
  templateUrl: './impugnar.component.html',
  styleUrls: ['./impugnar.component.scss']
})
export class ImpugnarComponent implements OnInit {

  dataCandidatos: any = [];
  tabla: boolean = false;
  dataRevisar: any = [];
  dataImpugnar: any = [];
  dataNoImpugnados: any = [];
  dataRevisarActual: any = {};
  dataImpugnarActual: any = {};
  dataNoImpugnarActual: any = {};
  dataCategoriaImpugnacion: any = [];
  createForm: FormGroup = this.fb.group({
    categoria_impugnacion: [null, Validators.required],
    codigo_puesto: [''],
    mesa: [''],
    candidato: [''],
    numero_votos: [''],
  });
  indexRevisar: any;
  urlRevisar: SafeResourceUrl = '';
  urlImpugnados: SafeResourceUrl = '';
  urlNoImpugnados: SafeResourceUrl = '';

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService, private sanitizer: DomSanitizer, private http: HttpClient) { }

  ngOnInit() {
    this.getInteresesCandidato();
    this.getCategoriaImpugnacion();
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  getSelectedValue(item: any) {
    if (item) {
      const data = { candidato_comparacion: item };
      this.getImpugnaciones(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getInteresesCandidato() {
    this.apiService.getInteresesCandidato().subscribe((resp: any) => {
      this.dataCandidatos = resp;
    })
  }

  getImpugnaciones(data: any) {
    this.apiService.getImpugnaciones(data).subscribe((resp: any) => {
      this.dataRevisar = resp.reportes_no_revisados;
      this.dataImpugnar = resp.reportes_revisados;
      this.dataNoImpugnados = resp.reportes_no_impugnados;
      console.log(resp)
    })
  }

  getCategoriaImpugnacion() {
    this.apiService.getCategoriaImpugnacion().subscribe((resp: any) => {
      this.dataCategoriaImpugnacion = resp;
    })
  }

  ModalRevisarActual(revisar: any) {
    this.urlRevisar = this.sanitizer.bypassSecurityTrustResourceUrl(revisar.e_14);
    this.dataRevisarActual = revisar;
    this.createForm.get('categoria_impugnacion')?.setValue(revisar.categoria_impugnacion);
    this.createForm.get('codigo_puesto')?.setValue(revisar.codigo_puesto);
    this.createForm.get('mesa')?.setValue(revisar.mesa);
    this.createForm.get('candidato')?.setValue(revisar.candidato);
    this.createForm.get('numero_votos')?.setValue(revisar.numero_votos);
  }

  ModalImpugnarActual(impugnar: any) {
    this.urlImpugnados = this.sanitizer.bypassSecurityTrustResourceUrl(impugnar.e_14);
    this.dataImpugnarActual = impugnar;
  }

  ModalNoImpugnarActual(noImpugnar: any) {
    this.urlNoImpugnados = this.sanitizer.bypassSecurityTrustResourceUrl(noImpugnar.e_14);
    this.dataNoImpugnarActual = noImpugnar;
  }

  impugnar() {
    if (this.createForm.valid) {
      console.log(this.createForm.value)
      this.apiService.impugnar(this.dataRevisarActual.id, this.createForm.value).subscribe((resp: any) => {
        this.indexRevisar = this.dataRevisar.findIndex((i: any) => i.id === this.dataRevisarActual.id);
        this.dataRevisar.splice(this.indexRevisar, 1);
        this.dataImpugnar.push(this.dataRevisarActual);
        if (this.dataRevisar.length > 0) {
          var rand = Math.floor(Math.random() * this.dataRevisar.length);
          this.ModalRevisarActual(this.dataRevisar[rand]);
          this.successAlert(resp.message);
        } else {
          this.successAlert(resp.message);
        }
      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  noImpugnar() {
    this.createForm.get('categoria_impugnacion')?.setValue(null);
    this.apiService.noImpugnar(this.dataRevisarActual.id, this.createForm.value).subscribe((resp: any) => {
      this.indexRevisar = this.dataRevisar.findIndex((i: any) => i.id === this.dataRevisarActual.id);
      this.dataRevisar.splice(this.indexRevisar, 1);
      this.dataNoImpugnados.push(this.dataRevisarActual);
      if (this.dataRevisar.length > 0) {
        var rand = Math.floor(Math.random() * this.dataRevisar.length);
        this.ModalRevisarActual(this.dataRevisar[rand]);
        this.successAlert(resp.message);
      } else {
        this.alertService.successAlert(resp.message);
      }
    })
  }

  successAlert(message: any) {
    Swal.fire({
      icon: 'success',
      title: message,
    });
  }

}
