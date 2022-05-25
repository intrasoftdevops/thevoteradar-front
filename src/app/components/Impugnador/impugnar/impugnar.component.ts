import { Component, OnDestroy, OnInit, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-impugnar',
  templateUrl: './impugnar.component.html',
  styleUrls: ['./impugnar.component.scss']
})
export class ImpugnarComponent implements OnInit, OnDestroy {

  @ViewChildren(DataTableDirective)
  dtElements!: QueryList<any>;

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
  searchForm: FormGroup = this.fb.group({
    candidato: [null],
  });
  indexRevisar: any;
  urlRevisar: SafeResourceUrl = '';
  urlImpugnados: SafeResourceUrl = '';
  urlNoImpugnados: SafeResourceUrl = '';
  dtOptions: DataTables.Settings[] = [];
  dtTrigger1: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  notFirstTime = false;

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService,
    private sanitizer: DomSanitizer, private chRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.dataTableOptions();
    this.getInteresesCandidato();
    this.getCategoriaImpugnacion();
  }

  ngOnDestroy() {
    this.dtTrigger1.unsubscribe();
    this.dtTrigger2.unsubscribe();
    this.dtTrigger3.unsubscribe();
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  getSelectedValue(item: any) {
    if (item) {
      const data = { candidato_comparacion: item.codigo_unico };
      this.getImpugnaciones(data);
      this.tabla = true;
    } else {
      this.tabla = false;
      this.renderer();
    }
  }

  getInteresesCandidato() {
    this.apiService.getInteresesCandidato().subscribe((resp: any) => {
      this.dataCandidatos = resp;
      if (this.dataCandidatos.length > 0) {
        this.dataCandidatos.map((i: any) => { i.fullName = i.nombres + ' ' + i.apellidos; return i; });
        this.searchForm.get('candidato')?.setValue(this.dataCandidatos[0].codigo_unico);
        this.getSelectedValue(this.dataCandidatos[0]);
      }
    })
  }

  getImpugnaciones(data: any) {
    this.apiService.getImpugnaciones(data).subscribe((resp: any) => {
      this.dataRevisar = resp.reportes_no_revisados;
      this.dataImpugnar = resp.reportes_revisados;
      this.dataNoImpugnados = resp.reportes_no_impugnados;
      this.renderer();
      this.notFirstTime = true;
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
      this.apiService.impugnar(this.dataRevisarActual.id, this.createForm.value).subscribe((resp: any) => {
        this.indexRevisar = this.dataRevisar.findIndex((i: any) => i.id === this.dataRevisarActual.id);
        this.indexRevisar !== -1 && this.dataRevisar.splice(this.indexRevisar, 1);
        this.dataRevisar = this.dataRevisar;
        this.dataImpugnar.push(this.dataRevisarActual);
        if (this.dataRevisar.length > 0) {
          var rand = Math.floor(Math.random() * this.dataRevisar.length);
          this.ModalRevisarActual(this.dataRevisar[rand]);
          this.successAlert(resp.message);
        } else {
          this.successAlert(resp.message);
        }
        this.renderer();
      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  noImpugnar() {
    this.createForm.get('categoria_impugnacion')?.setValue(null);
    this.apiService.noImpugnar(this.dataRevisarActual.id, this.createForm.value).subscribe((resp: any) => {
      this.indexRevisar = this.dataRevisar.findIndex((i: any) => i.id === this.dataRevisarActual.id);
      this.indexRevisar !== -1 && this.dataRevisar.splice(this.indexRevisar, 1);
      this.dataRevisar = this.dataRevisar;
      this.dataNoImpugnados.push(this.dataRevisarActual);
      if (this.dataRevisar.length > 0) {
        var rand = Math.floor(Math.random() * this.dataRevisar.length);
        this.ModalRevisarActual(this.dataRevisar[rand]);
        this.successAlert(resp.message);
      } else {
        this.alertService.successAlert(resp.message);
      }
      this.renderer();
    })
  }

  successAlert(message: any) {
    Swal.fire({
      icon: 'success',
      title: message,
    });
  }

  dataTableOptions() {
    this.dtOptions[0] = {
      destroy: true,
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      },
      {
        orderable: false,
      }
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
    this.dtOptions[1] = {
      destroy: true,
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      },
      {
        orderable: false,
      }
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
    this.dtOptions[2] = {
      destroy: true,
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
      },
      {
        orderable: false,
      }
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
  }

  renderer() {
    if (this.notFirstTime) {
      this.dtElements.forEach((dtElement: DataTableDirective) => {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
          dtInstance.destroy();
        });
      });
    }
    setTimeout(() => {
      this.dtTrigger1.next(void 0);
      this.dtTrigger2.next(void 0);
      this.dtTrigger3.next(void 0);
    });
  }

}
