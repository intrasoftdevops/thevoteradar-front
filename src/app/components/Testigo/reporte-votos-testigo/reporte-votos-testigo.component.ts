import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-reporte-votos-testigo',
  templateUrl: './reporte-votos-testigo.component.html',
  styleUrls: ['./reporte-votos-testigo.component.scss']
})
export class ReporteVotosTestigoComponent implements OnInit {

  showUpload: boolean = false;
  mesas_asignadas: any = [];
  listCandidatos: any = [];
  createForm: FormGroup = this.fb.group({
    codigo_mesa: [null, Validators.required],
    votos: this.fb.array([]),
  });
  puestos_asignado: any = "";
  files: File[] = [];

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService,
    private customValidator: CustomValidationService) { }

  ngOnInit() {
    this.getVotosTestigo();
    this.getMesasTetigo();
    this.getCandidatos();
    console.log(this.createForm.value)
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get votos() {
    return this.createForm.get('votos') as FormArray;
  }

  onSubmit() {
    console.log(this.createForm.value);
    if (this.createForm.valid && this.files.length > 0) {

      const uploadData = new FormData();
      uploadData.append('codigo_mesa', this.createForm.get('codigo_mesa')!.value);
      for (let file in this.files) {
        uploadData.append("url_archivo[]", this.files[file]);
      }
      for (var i = 0; i < this.createFormControl['votos'].value.length; i++) {
        uploadData.append("votos[]", this.createFormControl['votos'].value[i]);
      }
      this.apiService.createVotos(uploadData).subscribe((resp: any) => {

        this.alertService.successAlert(resp.message);

      })

    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  getVotosTestigo() {
    this.apiService.getVotosTestigo().subscribe((resp: any) => {
      const { mesas_sin_reportar } = resp;
      this.mesas_asignadas = mesas_sin_reportar;
    })
  }

  getMesasTetigo() {
    this.apiService.getTestigo(this.apiService.getId()).subscribe((resp: any) => {
      const { puestos_asignados } = resp;
      this.puestos_asignado = puestos_asignados[0].nombre;
      console.log(resp)
    })
  }

  getCandidatos() {
    this.apiService.getCandidatos().subscribe((resp: any) => {
      const { candidatos } = resp;
      this.listCandidatos = candidatos;
      candidatos.forEach(() => {
        const votos = this.createForm.get('votos') as FormArray;
        votos.push(
          this.fb.control('', Validators.required)
        );
      });
      console.log(this.listCandidatos)
    })
  }

  getSelectedValue(item: any) {
    this.files = [];
    if (item) {
      this.createFormControl['votos'].reset();
      this.showUpload = true;
    } else {
      this.showUpload = false;
      this.createForm.reset();
    }
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
