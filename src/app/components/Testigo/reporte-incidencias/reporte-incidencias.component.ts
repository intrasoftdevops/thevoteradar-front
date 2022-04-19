import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { CustomValidationService } from '../../../services/custom-validation.service';

@Component({
  selector: 'app-reporte-incidencias',
  templateUrl: './reporte-incidencias.component.html',
  styleUrls: ['./reporte-incidencias.component.scss']
})
export class ReporteIncidenciasComponent implements OnInit {

  categoryIncidencias: any = [];
  createForm: FormGroup = this.fb.group({
    categoria: [null, Validators.required],
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    url_archivo: ['', Validators.required],
    testigo_id: [''],
    estado: [0]
  });

  myFiles: string[] = [];

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

  ngOnInit(): void {
    this.getIncidenciasDeTestigo();
    this.getCategoriasIncidencias();
  }

  onSubmit() {
    console.log(this.createForm.value)
  }

  handleFileInput(event: any) {
    for (var i = 0; i < event.target.files.length; i++) {
      this.myFiles.push(event.target.files[i].name);
    }
    console.log(this.myFiles)
    console.log(document.getElementById("labelFile"))
    document.getElementById("labelFile")!.innerHTML = '<i class="fas fa-paperclip text-primary fa-lg"></i>' + this.myFiles.join(", ");
  }

  getCategoriasIncidencias() {
    this.apiService.getCategoriasIncidencias().subscribe((res: any) => {
      this.categoryIncidencias = res;
      console.log(this.categoryIncidencias)
    })
  }

  getIncidenciasDeTestigo() {
    this.apiService.getIncidenciasDeTestigo().subscribe((resp: any) => {
      console.log(resp)
    }, (err: any) => {
      console.log(err)
    })
  }

}
