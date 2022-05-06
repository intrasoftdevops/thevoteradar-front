import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-reporte-incidencias',
  templateUrl: './reporte-incidencias.component.html',
  styleUrls: ['./reporte-incidencias.component.scss']
})
export class ReporteIncidenciasComponent implements OnInit {

  photos: any = [];
  files: File[] = [];
  categoryIncidencias: any = [];
  mesas_asignadas: any = [];
  dataIncidencias: any = [];
  createForm: FormGroup = this.fb.group({
    categoria_id: [null, Validators.required],
    descripcion: ['', Validators.required],
    codigo_mesa: [null, Validators.required],
  });
  incidenciaActual: any = {};

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private localData: LocalDataService) { }

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

    if (this.createForm.valid && this.files.length > 0) {

      const uploadData = new FormData();
      uploadData.append('categoria_id', this.createForm.get('categoria_id')!.value);
      uploadData.append('descripcion', this.createForm.get('descripcion')!.value);
      for (let file in this.files) {
        uploadData.append("url_archivo[]", this.files[file]);
      }
      uploadData.append('codigo_mesa', this.createForm.get('codigo_mesa')!.value);

      this.apiService.createIncidencias(uploadData).subscribe((resp: any) => {

        this.createForm.reset();
        this.files = [];
        this.alertService.successAlert(resp.message);

      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  ModalIncidenciaActual(incidencia: any) {
    this.photos = [];
    this.incidenciaActual = {};
    this.incidenciaActual = incidencia;
    this.photos = incidencia.archivos;
  }

  getCategoriasIncidencias() {
    this.apiService.getCategoriasIncidencias().subscribe((res: any) => {
      this.categoryIncidencias = res;
    })
  }

  getMesasTetigo() {
    this.apiService.getTestigo(this.localData.getId()).subscribe((resp: any) => {
      const { mesas_asignadas } = resp;
      this.mesas_asignadas = mesas_asignadas;
    })
  }

  getIncidenciasDeTestigo() {
    this.apiService.getIncidenciasDeTestigo().subscribe((resp: any) => {
      console.log(resp)
      this.dataIncidencias = resp;
    })
  }

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    console.log(this.files)
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
    console.log(this.files)
  }

}
