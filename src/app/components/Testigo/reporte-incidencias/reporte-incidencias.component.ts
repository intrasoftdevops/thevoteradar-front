import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { CustomValidationService } from '../../../services/custom-validation.service';

@Component({
  selector: 'app-reporte-incidencias',
  templateUrl: './reporte-incidencias.component.html',
  styleUrls: ['./reporte-incidencias.component.scss']
})
export class ReporteIncidenciasComponent implements OnInit {

  photos: any = [];

  categoryIncidencias: any = [];
  mesas_asignadas: any = [];
  dataIncidencias: any = [];
  createForm: FormGroup = this.fb.group({
    categoria_id: [null, Validators.required],
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    url_archivo: this.fb.array([]),
    codigo_mesa: [null, Validators.required],
  });

  myFiles: string[] = [];
  incidenciaActual: any = {};

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService,
    private customValidator: CustomValidationService) { }

  ngOnInit(): void {
    this.getIncidenciasDeTestigo();
    this.getMesasTetigo();
    this.getCategoriasIncidencias();
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  onSubmit() {
    console.log(this.createForm.value)

    if (this.createForm.valid) {

      const uploadData = new FormData();
      uploadData.append('categoria_id', this.createForm.get('categoria_id')!.value);
      uploadData.append('titulo', this.createForm.get('titulo')!.value);
      uploadData.append('descripcion', this.createForm.get('descripcion')!.value);
      for (var i = 0; i < this.createFormControl['url_archivo'].value.length; i++) {
        uploadData.append("url_archivo[]", this.createFormControl['url_archivo'].value[i]);
      }
      uploadData.append('codigo_mesa', this.createForm.get('codigo_mesa')!.value);

      this.apiService.createIncidencias(uploadData).subscribe((resp: any) => {

        this.alertService.successAlert(resp.message);

      }, (err: any) => {
        console.log(err)
        this.alertService.errorAlert(err.message);
      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  ModalIncidenciaActual(incidencia: any) {
    this.photos=[];
    this.incidenciaActual = {};
    this.incidenciaActual = incidencia;
    for (let i = 0; i < this.incidenciaActual.archivos.length; i++) {
      this.photos.push(this.incidenciaActual.archivos[i].url_archivo);
    }
  }

  handleFileInput(event: any) {
    let selectedFiles = event.target.files;
    if (selectedFiles) {
      for (let file of selectedFiles) {
        this.myFiles.push(file.name);
        this.createImage(file);
      }
      document.getElementById("labelFile")!.innerHTML = '<i class="fas fa-paperclip text-primary fa-lg"></i> ' + this.myFiles.join(", ");
    }
  }

  createImage(img: any) {
    const newImage = new FormControl(img, Validators.required);
    (<FormArray>this.createForm.get('url_archivo')).push(newImage)
  }

  getCategoriasIncidencias() {
    this.apiService.getCategoriasIncidencias().subscribe((res: any) => {
      this.categoryIncidencias = res;
    })
  }

  getMesasTetigo() {
    this.apiService.getTestigo(this.apiService.getId()).subscribe((resp: any) => {
      const { mesas_asignadas } = resp;
      this.mesas_asignadas = mesas_asignadas;
    }, (err: any) => {
      console.log(err)
    })
  }

  getIncidenciasDeTestigo() {
    this.apiService.getIncidenciasDeTestigo().subscribe((resp: any) => {
      this.dataIncidencias = resp;
      console.log(resp)
    }, (err: any) => {
      console.log(err)
    })
  }

}
