import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { CustomValidationService } from '../../../services/custom-validation.service';
import { AlertService } from '../../../services/alert.service';

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
    url_archivo: this.fb.array([]),
  });
  puestos_asignado: any = "";
  myFiles: string[] = [];
  filename: string = "";

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
    if (this.createForm.valid) {

      const uploadData = new FormData();
      uploadData.append('codigo_mesa', this.createForm.get('codigo_mesa')!.value);
      for (var i = 0; i < this.createFormControl['url_archivo'].value.length; i++) {
        uploadData.append("url_archivo[]", this.createFormControl['url_archivo'].value[i]);
      }
      for (var i = 0; i < this.createFormControl['votos'].value.length; i++) {
        uploadData.append("votos[]", this.createFormControl['votos'].value[i]);
      }
      this.apiService.createVotos(uploadData).subscribe((resp: any) => {

        this.alertService.successAlert(resp.message);

      }, (err: any) => {
        console.log(err)
        this.alertService.errorAlert(err.message);
      })

    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  getVotosTestigo() {
    this.apiService.getVotosTestigo().subscribe(resp => {
      console.log(resp)
    }, (err: any) => {
      console.log(err)
    })
  }

  getMesasTetigo() {
    this.apiService.getTestigo(this.apiService.getId()).subscribe((resp: any) => {
      const { mesas_asignadas, puestos_asignados } = resp;
      this.mesas_asignadas = mesas_asignadas;
      this.puestos_asignado = puestos_asignados[0].nombre;
      console.log(resp)
    }, (err: any) => {
      console.log(err)
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
    }, (err: any) => {
      console.log(err)
    })
  }

  handleFileInput(event: any) {
    let selectedFiles = event.target.files;
    if (selectedFiles) {
      for (let file of selectedFiles) {
        this.myFiles.push(file.name);
        this.createImage(file);
      }
      this.filename = this.myFiles.join(", ");
    }
  }

  createImage(img: any) {
    const newImage = new FormControl(img, Validators.required);
    (<FormArray>this.createForm.get('url_archivo')).push(newImage)
  }

  getSelectedValue(item: any) {
    this.myFiles = [];
    if (item) {
      this.createFormControl['votos'].reset();
      const arr = this.createFormControl['url_archivo'] as FormArray;
      while (0 !== arr.length) {
        arr.removeAt(0);
      }
      console.log(this.createFormControl['url_archivo'].value)
      this.showUpload = true;
    } else {
      this.showUpload = false;
      this.createForm.reset();
    }
  }

}
