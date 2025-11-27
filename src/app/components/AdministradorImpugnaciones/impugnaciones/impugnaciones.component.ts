import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import {
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { FileDownloadService } from 'src/app/services/file-download/file-download.service';

@Component({
  selector: 'app-impugnaciones',
  templateUrl: './impugnaciones.component.html',
  styleUrls: ['./impugnaciones.component.scss'],
})
export class ImpugnacionesComponent implements OnInit, OnDestroy {
  @ViewChildren(DataTableDirective)
  dtElements!: QueryList<any>;
  searchForm: FormGroup;
  dataCandidatos: any = [];
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
    observaciones: [''],
  });
  indexRevisar: any;
  urlRevisar: SafeResourceUrl = '';
  urlImpugnados: SafeResourceUrl = '';
  urlNoImpugnados: SafeResourceUrl = '';
  dtOptions1: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  notFirstTime = false;
  nombreCoordinador: any;
  documentoCoordinador: any;
  nombreCliente: any;
  actual: any = 0;
  categoriaImpugnacion: any = '';
  categoryList: any = [];
  pagePDF: any = 0;
  selectedCategory: any = '';
  originalDataImpugnar: any = [];
  impugnacionActual: any  ={
    id: [''],
    categoria_impugnacion:[''],
    codigo_puesto: [''],
    mesa: [''],
    candidato: [''],
    numero_votos: [''],
    pagina: [''],
    observaciones: [''],
  }

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private customValidator: CustomValidationService,
    private sanitizer: DomSanitizer,
    private chRef: ChangeDetectorRef,
    private fileDownloadService: FileDownloadService
  ) {
    this.searchForm = this.fb.group({
      category: [],
    });
  }

  ngOnInit() {
    this.dataTableOptions();
    this.getInteresesCandidato();
    this.getNameUser();
    this.getCliente();
    const data = 0;
    this.getCategoríaImpugnación();
    this.getCategorias();
  }

  getNameUser() {
    this.apiService.getUser().subscribe((resp: any) => {
      this.nombreCoordinador = resp.nombres + ' ' + resp.apellidos;
      this.documentoCoordinador = resp.numero_documento;
    });
  }

  getCliente() {
    this.apiService.getCliente().subscribe((resp: any) => {
      this.nombreCliente = resp.nombres + ' ' + resp.apellidos;
    });
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
    console.log("entro")
    if (item) {
      const data = { candidato_comparacion: item.codigo_unico };
      this.getImpugnaciones(data);
    } else {
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
    this.apiService.getImpugnacionesRevisadas(data).subscribe((resp: any) => {
      console.log(resp);
      this.dataRevisar = resp.reportes_revisados;
      
      const categoriasMap = new Map(
        this.categoryList.map((cat: any) => [cat.id, cat.nombre])
      );

      this.originalDataImpugnar = resp.reportes_revisados.map(
        (reporte: any) => ({
          ...reporte,
          category:
            categoriasMap.get(reporte.categoria_impugnacion) ||
            'Categoría no encontrada',
        })
      );
      this.dataImpugnar = this.originalDataImpugnar;

      this.dataNoImpugnados = resp;
      this.renderer();
      this.notFirstTime = true;
      this.ModalRevisarActual(this.dataRevisar[this.actual]);
    });
  }

  getSelectedCategory(item: any) {
    if (item) {
      this.selectedCategory = item.nombre;

      console.log(this.originalDataImpugnar)

      this.dataImpugnar = this.originalDataImpugnar.filter((reporte: any) => {
        
        return reporte.category === this.selectedCategory;
      });
      console.log(this.dataImpugnar)
      this.renderer();
    } else {
      this.dataImpugnar = this.originalDataImpugnar;
      this.renderer();
    }
  }

  getCategoríaImpugnación() {
    this.apiService.getCategoriaImpugnacion().subscribe((resp: any) => {
      this.categoriaImpugnacion = resp;

      if (this.categoriaImpugnacion.id == 9) {
        this.pagePDF = 1000;
      }
    });
    var inicio = localStorage.getItem('login');
    if (inicio == 'true') {
      this.successAlert(
        'Tu objetivo es buscar: ' + this.categoriaImpugnacion.nombre
      );
      localStorage.setItem('login', 'false');
    }
  }

  ModalRevisarActual(porrevisar: any) {
    this.apiService
      .getReporteTransmision(porrevisar.id)
      .subscribe((resp: any) => {
        const revisar = resp.reportes_revisados;

        this.dataRevisarActual = revisar.reportes_revisados;
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
          resp.e_14 + '#page=' + this.pagePDF
        );
      });
  }

  ModalImpugnarActual(impugnar: any) {
    this.urlImpugnados = this.sanitizer.bypassSecurityTrustResourceUrl(
      impugnar.e_14
    );
    console.log(this.urlImpugnados);
    this.dataImpugnarActual = impugnar;
  }

  impugnar() {
    this.actual++;
    const pagina: any = this.createForm.get('pagina');
    const observaciones: any = this.createForm.get('observaciones');

    if (pagina.value === '' && observaciones.value === '') {
      this.createForm.value['categoria_impugnacion'] = null;
    } else {
      this.createForm.value['categoria_impugnacion'] = 9;
    }
    console.log(this.createForm.value);
    this.apiService
      .impugnar(this.dataRevisarActual.id, this.createForm.value)
      .subscribe((resp: any) => {
        console.log(resp);

        if (this.actual <= 9) {
          this.ModalRevisarActual(this.dataRevisar[this.actual]);
        } else {
          window.location.reload();
        }
        this.createForm.get('pagina')?.reset();
        this.createForm.get('observaciones')?.reset();
        this.renderer();
      });
  }

  noImpugnar() {
    this.createForm.get('categoria_impugnacion')?.setValue(null);
    this.apiService
      .noImpugnar(this.dataRevisarActual.id, this.createForm.value)
      .subscribe((resp: any) => {
        this.indexRevisar = this.dataRevisar.findIndex(
          (i: any) => i.id === this.dataRevisarActual.id
        );
        this.indexRevisar !== -1 &&
          this.dataRevisar.splice(this.indexRevisar, 1);
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
      });
  }

  successAlert(message: any) {
    Swal.fire({
      icon: 'success',
      title: message,
    });
  }

  getCategorias() {
    this.apiService.getCategoriasImpugnacion().subscribe((resp: any) => {
      this.categoryList = resp;
    });
  }

  print(impugnar: any) {
    let printContents, popupWin;
    printContents = '../../../../assets/target001.jpg';
    const height = window.screen.height * 0.7; 
    const width = window.screen.width * 0.7; 
    const top = (window.screen.height - height) / 2; 
    const left = (window.screen.width - width) / 2; 

    popupWin = window.open('', '_blank', `top=${top}, left=${left}, height=${height}, width=${width}`);
    popupWin?.document.open();
    popupWin?.document.write(`
    <html xmlns="http:
    <head>
    <title></title>
    
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
     <br/>
    <style type="text/css">
      @media print {
        @page {
          margin-top: 0;
        }
      }
      @page {
        size: landscape;
        margin-top: 0;
        margin-bottom: 0;
      }
      p {margin: 0; padding: 0;}	
      .ft09{font-size:12px;font-family:Times;color:#010101;}
      .ft10{font-size:8px;font-family:Times;color:#010101;}
      .ft11{font-size:10px;font-family:Times;color:#010101;}
      .ft12{font-size:31px;font-family:Times;color:#010101;}
      .ft13{font-size:11px;font-family:Times;color:#010101;}
      .ft14{font-size:10px;font-family:Times;color:#ffffff;}
      .ft15{font-size:9px;font-family:Times;color:#010101;}
      .ft16{font-size:17px;font-family:Times;color:#010101;}
      .ft17{font-size:24px;font-family:Times;color:#293179;}
      .ft18{font-size:17px;font-family:Times;color:#293179;}
      .ft19{font-size:17px;font-family:Times;color:#000000;}
      .ft110{font-size:36px;font-family:Times;color:#ffffff;}
      .ft111{font-size:9px;font-family:Times;color:#000000;}
      .ft112{font-size:13px;font-family:Times;color:#000000;}
    </style>
    </head>
      <body bgcolor="#A0A0A0" vlink="blue" link="blue" onload="window.print();window.close()">
        <div id="page1-div" style="position:relative;width:1188px;height:900px;">
          <img width="1188" height="900" src="${printContents}" alt="background image"/>
          <p style="position:absolute;top:128px;left:35px;white-space:nowrap" class="ft10">DEPARTAMENTO</p>
          <p style="position:absolute;top:145px;left:180px;white-space:nowrap" class="ft09">${impugnar.departamento}</p>
          <p style="position:absolute;top:200px;left:70px;white-space:nowrap" class="ft11">MARQUE “X” EN LA&#160;RESPECTIVA&#160;CAUSAL</p>
          <p style="position:absolute;top:725px;left:27px;white-space:nowrap" class="ft12"><b>SOLICITA&#160;RECUENTO DE VOTOS</b></p>
          <p style="position:absolute;top:128px;left:854px;white-space:nowrap" class="ft10">ZONA</p>
          <p style="position:absolute;top:145px;left:854px;white-space:nowrap" class="ft09">${impugnar.zona}</p>
          <p style="position:absolute;top:128px;left:959px;white-space:nowrap" class="ft10">PUESTO</p>
          <p style="position:absolute;top:145px;left:959px;white-space:nowrap" class="ft09">${impugnar.puesto}</p>
          <p style="position:absolute;top:128px;left:1084px;white-space:nowrap" class="ft10">MESA</p>
          <p style="position:absolute;top:145px;left:1084px;white-space:nowrap" class="ft09">${impugnar.mesa}</p>
          <p style="position:absolute;top:128px;left:420px;white-space:nowrap" class="ft10">MUNICIPIO O DISTRITO</p>
          <p style="position:absolute;top:145px;left:580px;white-space:nowrap" class="ft09">${impugnar.municipio}</p>
          <p style="position:absolute;top:261px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 9 ? 'X' : ' '}</b></p>
          <p style="position:absolute;top:260px;left:71px;white-space:nowrap" class="ft13"><b>LAS&#160;ACTAS DE LOS JURADOS CONTIENEN MENOS DE DOS FIRMAS</b></p>
          <p style="position:absolute;top:361px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 12 ? 'X' : ' '}</b></p>
          <p style="position:absolute;top:360px;left:69px;white-space:nowrap" class="ft13"><b>ACTAS DE ESCRUTINIO CON ERROR&#160;ARITMÉTICO&#160;AL&#160;SUMAR LOS VOTOS</b></p>
          <p style="position:absolute;top:395px;left:72px;white-space:nowrap" class="ft14"><b>SOLICITO RECUENTO RAZONABLE POR:</b></p>
          <p style="position:absolute;top:233px;left:72px;white-space:nowrap" class="ft14"><b>CAUSALES CONFORMES EL&#160;ART. 122 DEL&#160;CÓDIGO ELECTORAL</b></p>
          <p style="position:absolute;top:426px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 10 ? 'X' : ' '}</b></p>
          <p style="position:absolute;top:425px;left:69px;white-space:nowrap" class="ft13"><b>TACHADURAS, ENMENDADURAS O BORRONES EN EL&#160;ACTA&#160;DE ESCRUTINIO DE JURADOS</b></p>
          <p style="position:absolute;top:580px;left:35px;white-space:nowrap" class="ft13"><b>NOMBRE&#160;Y&#160;APELLIDOS DEL&#160;RECLAMANTE</b></p>
          <p style="position:absolute;top:600px;left:35px;white-space:nowrap" class="ft16"><b></b></p>
          <p style="position:absolute;top:652px;left:35px;white-space:nowrap" class="ft13"><b>CEDULA&#160;DE CIUDADANIA&#160;No.</b></p>
          <p style="position:absolute;top:675px;left:35px;white-space:nowrap" class="ft16"><b></b></p>
          <p style="position:absolute;top:652px;left:541px;white-space:nowrap" class="ft13"><b>RECIBIDO POR</b></p>
          <p style="position:absolute;top:652px;left:784px;white-space:nowrap" class="ft13"><b>No. RADICACION</b></p>
          <p style="position:absolute;top:230px;left:739px;white-space:nowrap" class="ft15"><b>CANDIDATO POR EL&#160;CUAL&#160;SE RECLAMA</b></p>
          <p style="position:absolute;top:253px;left:744px;white-space:nowrap" class="ft16"><b>${this.nombreCliente}</b></p>
          <p style="position:absolute;top:770px;left:30px;white-space:nowrap" class="ft13"><b>MOTIVO DE LA&#160;RECLAMACIÓN:</b></p>
          <p style="position: absolute; top: 788px; left: 30px; line-height: 2.1;" class="ft13"><b>${impugnar.observaciones == null ? ' ' : impugnar.observaciones}</b></p>
          <p style="position:absolute;top:580px;left:801px;white-space:nowrap" class="ft13"><b>FIRMA</b></p>
          <p style="position:absolute;top:289px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 11 ? 'X' : ' '}</b></p>
          <p style="position:absolute;top:288px;left:69px;white-space:nowrap" class="ft13"><b>EL&#160;NÚMERO DE SUFRAGANTES DE UNA&#160;MESA&#160;ES MAYOR&#160;AL&#160;DE CIUDADANOS&#160;APTOS&#160;PARA&#160;VOTAR</b></p>
          <p style="position:absolute;top:316px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 4 ? 'X' : ' '}</b></p>
          <p style="position:absolute;top:315px;left:69px;white-space:nowrap" class="ft13"><b>EL&#160;NÚMERO DE SUFRAGANTES DE UNA&#160;MESA&#160;ES MAYOR&#160;AL&#160;NÚMERO DE CIUDADANOS&#160;APTOS&#160;PARA&#160;</b></p>
          <p style="position:absolute;top:327px;left:69px;white-space:nowrap" class="ft13"><b>VOTAR EN LA&#160;CABECERA&#160;MUNICIAL, CORREGIMIENTO O INSPECCIÓN DE POLICIA</b></p>
          <p style="position:absolute;top:461px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 6 ? 'X' : ' '}</b></p>
          <p style="position:absolute;top:460px;left:69px;white-space:nowrap" class="ft13"><b>INDEBIDA&#160;CLASIFICACIÓN DE LOS VOTOS</b></p>
          <p style="position:absolute;top:496px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 7 ? 'X' : ' '}</b></p>
          <p style="position:absolute;top:495px;left:69px;white-space:nowrap" class="ft13"><b>REGISTRO ERRÓNEO DE LOS VOTOS DE LOS CANDIDATOS</b></p>
          <p style="position:absolute;top:531px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 8 ? 'X' : ' '}</b></p>
          <p style="position:absolute;top:530px;left:69px;white-space:nowrap" class="ft13"><b>UTILIZACIÓN DE LOS&#160;TARJETONES ELECTORALES NO MARCADOS</b></p>
          <p style="position:absolute;top:652px;left:1015px;white-space:nowrap" class="ft13"><b>FECHA&#160;SOLICITUD</b></p>
          <p style="position:absolute;top:670px;left:982px;white-space:nowrap" class="ft13"><b>DIA</b></p>
          <p style="position:absolute;top:670px;left:1050px;white-space:nowrap" class="ft13"><b>MES</b></p>
          <p style="position:absolute;top:670px;left:1116px;white-space:nowrap" class="ft13"><b>AÑO</b></p>
          <p style="position:absolute;top:32px;left:197px;white-space:nowrap" class="ft17"><b>FORMATO DE RECLAMACIONES ANTE JURADOS DE MESA</b></p>
          <p style="position:absolute;top:68px;left:308px;white-space:nowrap" class="ft18">ELECCIONES TERRITORIALES DEL 29 DE OCTUBRE 2023</p>
          <p style="position:absolute;top:347px;left:898px;white-space:nowrap" class="ft19"><b>ALCALDÍA</b></p>
          <p style="position:absolute;top:34px;left:1061px;white-space:nowrap" class="ft110"><b>E-25</b></p>
          <p style="position:absolute;top:583px;left:678px;white-space:nowrap" class="ft111"><b>CANDIDATO</b></p>
          <p style="position:absolute;top:602px;left:678px;white-space:nowrap" class="ft111"><b>TESTIGO</b></p>
          <p style="position:absolute;top:603px;left:754px;white-space:nowrap" class="ft111"><b>X</b></p>
          <p style="position:absolute;top:622px;left:678px;white-space:nowrap" class="ft111"><b>APODERADO</b></p>
          <p style="position:absolute;top:310px;left:820px;white-space:nowrap" class="ft112"><b>CORPORACIÓN O CARGO DE ELECCIÓN</b></p>
        </div>
      </body>
    </html>
    
    `);
    popupWin?.document.close();
  }

  printAll() {
    let printContents: any, popupWin: any;
    printContents = '../../../../assets/target001.jpg';
    popupWin = window.open('', '_blank', 'top=0, left=0, height=600, width=800');
    popupWin?.document.open();
    this.dataImpugnar.forEach((impugnar: any) => {
      popupWin?.document.write(`
      <html xmlns="http:
        <head>
        <title></title>
        
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <br/>
        <style type="text/css">
          @media print {
            @page {
              margin-top: 0;
            }
          }
          @page {
            size: landscape;
            margin-top: 0;
            margin-bottom: 0;
          }
          p {margin: 0; padding: 0;}	
          .ft09{font-size:12px;font-family:Times;color:#010101;}
          .ft10{font-size:8px;font-family:Times;color:#010101;}
          .ft11{font-size:10px;font-family:Times;color:#010101;}
          .ft12{font-size:31px;font-family:Times;color:#010101;}
          .ft13{font-size:11px;font-family:Times;color:#010101;}
          .ft14{font-size:10px;font-family:Times;color:#ffffff;}
          .ft15{font-size:9px;font-family:Times;color:#010101;}
          .ft16{font-size:17px;font-family:Times;color:#010101;}
          .ft17{font-size:24px;font-family:Times;color:#293179;}
          .ft18{font-size:17px;font-family:Times;color:#293179;}
          .ft19{font-size:17px;font-family:Times;color:#000000;}
          .ft110{font-size:36px;font-family:Times;color:#ffffff;}
          .ft111{font-size:9px;font-family:Times;color:#000000;}
          .ft112{font-size:13px;font-family:Times;color:#000000;}
        </style>
        </head>
        <body bgcolor="#A0A0A0" vlink="blue" link="blue" onload="window.print();window.close()">
          <div id="page1-div" style="position:relative;width:1188px;height:900px;">
            <img width="1188" height="900" src="${printContents}" alt="background image"/>
            <p style="position:absolute;top:128px;left:35px;white-space:nowrap" class="ft10">DEPARTAMENTO</p>
            <p style="position:absolute;top:145px;left:180px;white-space:nowrap" class="ft09">${impugnar.departamento}</p>
            <p style="position:absolute;top:200px;left:70px;white-space:nowrap" class="ft11">MARQUE “X” EN LA&#160;RESPECTIVA&#160;CAUSAL</p>
            <p style="position:absolute;top:725px;left:27px;white-space:nowrap" class="ft12"><b>SOLICITA&#160;RECUENTO DE VOTOS</b></p>
            <p style="position:absolute;top:128px;left:854px;white-space:nowrap" class="ft10">ZONA</p>
            <p style="position:absolute;top:145px;left:854px;white-space:nowrap" class="ft09">${impugnar.zona}</p>
            <p style="position:absolute;top:128px;left:959px;white-space:nowrap" class="ft10">PUESTO</p>
            <p style="position:absolute;top:145px;left:959px;white-space:nowrap" class="ft09">${impugnar.puesto}</p>
            <p style="position:absolute;top:128px;left:1084px;white-space:nowrap" class="ft10">MESA</p>
            <p style="position:absolute;top:145px;left:1084px;white-space:nowrap" class="ft09">${impugnar.mesa}</p>
            <p style="position:absolute;top:128px;left:420px;white-space:nowrap" class="ft10">MUNICIPIO O DISTRITO</p>
            <p style="position:absolute;top:145px;left:580px;white-space:nowrap" class="ft09">${impugnar.municipio}</p>
            <p style="position:absolute;top:261px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 9 ? 'X' : ' '}</b></p>
            <p style="position:absolute;top:260px;left:71px;white-space:nowrap" class="ft13"><b>LAS&#160;ACTAS DE LOS JURADOS CONTIENEN MENOS DE DOS FIRMAS</b></p>
            <p style="position:absolute;top:361px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 12 ? 'X' : ' '}</b></p>
            <p style="position:absolute;top:360px;left:69px;white-space:nowrap" class="ft13"><b>ACTAS DE ESCRUTINIO CON ERROR&#160;ARITMÉTICO&#160;AL&#160;SUMAR LOS VOTOS</b></p>
            <p style="position:absolute;top:395px;left:72px;white-space:nowrap" class="ft14"><b>SOLICITO RECUENTO RAZONABLE POR:</b></p>
            <p style="position:absolute;top:233px;left:72px;white-space:nowrap" class="ft14"><b>CAUSALES CONFORMES EL&#160;ART. 122 DEL&#160;CÓDIGO ELECTORAL</b></p>
            <p style="position:absolute;top:426px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 10 ? 'X' : ' '}</b></p>
            <p style="position:absolute;top:425px;left:69px;white-space:nowrap" class="ft13"><b>TACHADURAS, ENMENDADURAS O BORRONES EN EL&#160;ACTA&#160;DE ESCRUTINIO DE JURADOS</b></p>
            <p style="position:absolute;top:580px;left:35px;white-space:nowrap" class="ft13"><b>NOMBRE&#160;Y&#160;APELLIDOS DEL&#160;RECLAMANTE</b></p>
            <p style="position:absolute;top:600px;left:35px;white-space:nowrap" class="ft16"><b></b></p>
            <p style="position:absolute;top:652px;left:35px;white-space:nowrap" class="ft13"><b>CEDULA&#160;DE CIUDADANIA&#160;No.</b></p>
            <p style="position:absolute;top:675px;left:35px;white-space:nowrap" class="ft16"><b></b></p>
            <p style="position:absolute;top:652px;left:541px;white-space:nowrap" class="ft13"><b>RECIBIDO POR</b></p>
            <p style="position:absolute;top:652px;left:784px;white-space:nowrap" class="ft13"><b>No. RADICACION</b></p>
            <p style="position:absolute;top:230px;left:739px;white-space:nowrap" class="ft15"><b>CANDIDATO POR EL&#160;CUAL&#160;SE RECLAMA</b></p>
            <p style="position:absolute;top:253px;left:744px;white-space:nowrap" class="ft16"><b>${this.nombreCliente}</b></p>
            <p style="position:absolute;top:770px;left:30px;white-space:nowrap" class="ft13"><b>MOTIVO DE LA&#160;RECLAMACIÓN:</b></p>
            <p style="position: absolute; top: 788px; left: 30px; line-height: 2.1;" class="ft13"><b>${impugnar.observaciones == null ? ' ' : impugnar.observaciones}</b></p>
            <p style="position:absolute;top:580px;left:801px;white-space:nowrap" class="ft13"><b>FIRMA</b></p>
            <p style="position:absolute;top:289px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 11 ? 'X' : ' '}</b></p>
            <p style="position:absolute;top:288px;left:69px;white-space:nowrap" class="ft13"><b>EL&#160;NÚMERO DE SUFRAGANTES DE UNA&#160;MESA&#160;ES MAYOR&#160;AL&#160;DE CIUDADANOS&#160;APTOS&#160;PARA&#160;VOTAR</b></p>
            <p style="position:absolute;top:316px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 4 ? 'X' : ' '}</b></p>
            <p style="position:absolute;top:315px;left:69px;white-space:nowrap" class="ft13"><b>EL&#160;NÚMERO DE SUFRAGANTES DE UNA&#160;MESA&#160;ES MAYOR&#160;AL&#160;NÚMERO DE CIUDADANOS&#160;APTOS&#160;PARA&#160;</b></p>
            <p style="position:absolute;top:327px;left:69px;white-space:nowrap" class="ft13"><b>VOTAR EN LA&#160;CABECERA&#160;MUNICIAL, CORREGIMIENTO O INSPECCIÓN DE POLICIA</b></p>
            <p style="position:absolute;top:461px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 6 ? 'X' : ' '}</b></p>
            <p style="position:absolute;top:460px;left:69px;white-space:nowrap" class="ft13"><b>INDEBIDA&#160;CLASIFICACIÓN DE LOS VOTOS</b></p>
            <p style="position:absolute;top:496px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 7 ? 'X' : ' '}</b></p>
            <p style="position:absolute;top:495px;left:69px;white-space:nowrap" class="ft13"><b>REGISTRO ERRÓNEO DE LOS VOTOS DE LOS CANDIDATOS</b></p>
            <p style="position:absolute;top:531px;left:44px;white-space:nowrap" class="ft13"><b>${impugnar.categoria_impugnacion == 8 ? 'X' : ' '}</b></p>
            <p style="position:absolute;top:530px;left:69px;white-space:nowrap" class="ft13"><b>UTILIZACIÓN DE LOS&#160;TARJETONES ELECTORALES NO MARCADOS</b></p>
            <p style="position:absolute;top:652px;left:1015px;white-space:nowrap" class="ft13"><b>FECHA&#160;SOLICITUD</b></p>
            <p style="position:absolute;top:670px;left:982px;white-space:nowrap" class="ft13"><b>DIA</b></p>
            <p style="position:absolute;top:670px;left:1050px;white-space:nowrap" class="ft13"><b>MES</b></p>
            <p style="position:absolute;top:670px;left:1116px;white-space:nowrap" class="ft13"><b>AÑO</b></p>
            <p style="position:absolute;top:32px;left:197px;white-space:nowrap" class="ft17"><b>FORMATO DE RECLAMACIONES ANTE JURADOS DE MESA</b></p>
            <p style="position:absolute;top:68px;left:308px;white-space:nowrap" class="ft18">ELECCIONES TERRITORIALES DEL 29 DE OCTUBRE 2023</p>
            <p style="position:absolute;top:347px;left:898px;white-space:nowrap" class="ft19"><b>ALCALDÍA</b></p>
            <p style="position:absolute;top:34px;left:1061px;white-space:nowrap" class="ft110"><b>E-25</b></p>
            <p style="position:absolute;top:583px;left:678px;white-space:nowrap" class="ft111"><b>CANDIDATO</b></p>
            <p style="position:absolute;top:602px;left:678px;white-space:nowrap" class="ft111"><b>TESTIGO</b></p>
            <p style="position:absolute;top:603px;left:754px;white-space:nowrap" class="ft111"><b>X</b></p>
            <p style="position:absolute;top:622px;left:678px;white-space:nowrap" class="ft111"><b>APODERADO</b></p>
            <p style="position:absolute;top:310px;left:820px;white-space:nowrap" class="ft112"><b>CORPORACIÓN O CARGO DE ELECCIÓN</b></p>
          </div>
        </body>
      </html>
      `);
    });
    popupWin?.document.close();
  }

  dataTableOptions() {
    this.dtOptions1 = {
      destroy: true,
      processing: false,
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
        url: '
      },
    };
    this.dtOptions2 = {
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
        url: '
      },
    };
    this.dtOptions3 = {
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
        url: '
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

  download(url: string): void {
    this.fileDownloadService.downloadFile(url).subscribe((blob) => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'archivo.pdf'; 
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  atras() {
    this.actual--;
    if (this.actual <= 9) {
      
      this.ModalRevisarActual(this.dataRevisar[this.actual]);
    } else {
      window.location.reload();
    }
    this.createForm.get('pagina')?.reset(); 
    this.createForm.get('observaciones')?.reset(); 
    this.renderer();
  }

  seleccionarImpugnacion(impugnacion:any){
    this.impugnacionActual = impugnacion
    console.log(this.impugnacionActual)
  }

  

  saveObservation(observaciones:any){
     console.log(this.impugnacionActual)
     this.apiService.impugnar(this.impugnacionActual.id, this.impugnacionActual).subscribe((resp)=>{
      console.log(resp)
     })


  }
}
