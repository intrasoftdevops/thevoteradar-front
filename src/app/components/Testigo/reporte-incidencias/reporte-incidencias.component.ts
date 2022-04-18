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
  });


  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

  ngOnInit(): void {
   this.getCategoriasIncidencias();
  }

  onSubmit() {
    console.log(this.createForm.value)
  }

  getCategoriasIncidencias() {
    this.apiService.getCategoriasIncidencias().subscribe((res: any) => {
      this.categoryIncidencias = res;
      console.log(this.categoryIncidencias)
    })
  }

}
