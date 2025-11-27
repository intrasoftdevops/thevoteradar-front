import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-impugnar',
  templateUrl: './impugnar.component.html',
  styleUrls: ['./impugnar.component.scss'],
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
    pagina: [''],
    observaciones: ['']

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
  nombreCoordinador: any
  nombreCliente: any
  actual: any = 0
  categoriaImpugnacion:any = ''
  pagePDF:any = 0
  erroresImpugnacion:any = true

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private customValidator: CustomValidationService,
    private sanitizer: DomSanitizer,
    private chRef: ChangeDetectorRef
  ) {}

  ngOnInit() {

    


    
    this.getInteresesCandidato();
    this.getNameUser()
    this.getCliente()
    const data = 0
    
    this.getCategoriaImpugnacion()
  }

  getNameUser() {
    this.apiService.getUser().subscribe((resp: any) => {
      this.nombreCoordinador = resp.nombres + ' ' + resp.apellidos
    })
  }

  getCliente() {
    this.apiService.getCliente().subscribe((resp:any)=>{
      this.nombreCliente = resp.nombres + ' ' + resp.apellidos
    })
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
        this.dataCandidatos.map((i: any) => {
          i.fullName = i.nombres + ' ' + i.apellidos;
          return i;
        });
        this.searchForm
          .get('candidato')
          ?.setValue(this.dataCandidatos[0].codigo_unico);
        this.getSelectedValue(this.dataCandidatos[0]);
      }
    });
  }

  getImpugnaciones(data: any) {
    console.log("entro")
    this.apiService.getImpugnaciones(data).subscribe((resp: any) => {
      console.log(resp)
        this.dataRevisar = resp;
       
       if(this.dataRevisar.length == 0) {
        this.successAlert("No se encontraron reportes")
       }
        this.renderer();
        this.notFirstTime = true;
        this.ModalRevisarActual(this.dataRevisar[this.actual]);
       
    });
}


  getCategoriaImpugnacion() {
    this.apiService.getCategoriaImpugnacion().subscribe((resp:any)=>{
      this.categoriaImpugnacion = resp;
      if(this.categoriaImpugnacion.id == 9) {
        this.pagePDF = 1000;
      }
      var inicio = localStorage.getItem('login');
      if(inicio == 'true'){
        this.successAlert('Tu objetivo es buscar: ' + this.categoriaImpugnacion.nombre);
        localStorage.setItem('login', 'false');
      }
    })
    
    
  }
  

  ModalRevisarActual(porrevisar: any) {
    console.log("entro")
    console.log(porrevisar)
    
    this.apiService.getReporteTransmision(porrevisar.id).subscribe((resp:any)=>{
        const revisar = resp
        console.log(resp)
       
        this.dataRevisarActual = revisar;
        this.createForm
          .get('categoria_impugnacion')
          ?.setValue(revisar.categoria_impugnacion);
        this.createForm.get('codigo_puesto')?.setValue(revisar.codigo_puesto);
        this.createForm.get('mesa')?.setValue(revisar.mesa);
        this.createForm.get('candidato')?.setValue(revisar.candidato);
        this.createForm.get('numero_votos')?.setValue(revisar.numero_votos);
        this.createForm.get('pagina')?.setValue(revisar.pagina);
        this.createForm.get('observaciones')?.setValue(revisar.observaciones);
       
        this.urlImpugnados = this.sanitizer.bypassSecurityTrustResourceUrl(
          resp.e_14
        )
        
       /*  
       ;
        */
        

    })
    
  }




  impugnar() {
    this.actual++
    const pagina: any = this.createForm.get('pagina')
    const observaciones:any = this.createForm.get('observaciones')
   console.log(pagina.value)
    if(pagina.value === null && observaciones.value === null){
      this.createForm.value['categoria_impugnacion'] = null
      console.log("vacio")
    }
    else{
      this.createForm.value['categoria_impugnacion'] = 9
    }
      console.log(this.createForm.value)
      this.apiService
        .impugnar(this.dataRevisarActual.id, this.createForm.value)
        .subscribe((resp: any) => {
          console.log(resp)
          
          
          if (this.dataRevisar.length > 1) {
            console.log(this.dataRevisar.length )
            console.log(this.actual)
            
            this.ModalRevisarActual(this.dataRevisar[this.actual]);
            if(this.actual == 9){
              console.log("Son iguales")
              window.location.reload()
            }
          }
          else if (this.dataRevisar.length  == 1){
            
            window.location.reload()

          }
          
          else {
            this.successAlert("No se encontraron reportes")
         
          }
          this.createForm.get('pagina')?.reset();
          this.createForm.get('observaciones')?.reset(); 
          this.renderer();
        });
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
      columns: [
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: false,
        },
      ],
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      },
    };
    this.dtOptions[1] = {
      destroy: true,
      processing: true,
      pageLength: 10,
      columns: [
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: false,
        },
      ],
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      },
    };
    this.dtOptions[2] = {
      destroy: true,
      processing: true,
      pageLength: 10,
      columns: [
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: true,
        },
        {
          orderable: false,
        },
      ],
      responsive: true,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      },
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

  atras(){
    this.actual--
    if (this.actual <= 9) {
      
      this.ModalRevisarActual(this.dataRevisar[this.actual]);
      
    } else {
      window.location.reload()
    }
    this.createForm.get('pagina')?.reset(); 
    this.createForm.get('observaciones')?.reset(); 
    this.renderer();


  }

  
  
}
