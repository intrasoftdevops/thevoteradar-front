import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { AlertService } from '../../../services/alert/alert.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { environment } from '../../../../environments/environment';

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
  loading: boolean = false;

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private localData: LocalDataService) { }

  ngOnInit() {
    this.getVotosTestigo();
    this.getMesasTetigo();
    this.getCandidatos();
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get votos() {
    return this.createForm.get('votos') as FormArray;
  }

  onSubmit() {
    if (this.createForm.valid && this.files.length > 0) {

      const uploadData = new FormData();
      uploadData.append('codigo_mesa', this.createForm.get('codigo_mesa')!.value);
      for (let file of this.files) {
        uploadData.append("url_archivo", file);
      }
      for (var i = 0; i < this.createFormControl['votos'].value.length; i++) {
        const votoValue = this.createFormControl['votos'].value[i];
        uploadData.append("votos", String(votoValue));
      }
      this.apiService.createVotos(uploadData).subscribe((resp: any) => {

        this.alertService.successAlert(resp.message);

      })

    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  getVotosTestigo() {
    this.loading = true;
    this.apiService.getVotosTestigo().subscribe({
      next: (resp: any) => {
        const { mesas_sin_reportar } = resp;
        this.mesas_asignadas = mesas_sin_reportar;
        if (this.mesas_asignadas.length > 0) {
          this.createForm.get('codigo_mesa')?.setValue(this.mesas_asignadas[0].codigo_unico);
          this.getSelectedValue(this.mesas_asignadas[0]);
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    })
  }

  getMesasTetigo() {
    this.apiService.getTestigo(this.localData.getId()).subscribe((resp: any) => {
      const { puestos_asignados } = resp;
      this.puestos_asignado = puestos_asignados?.nombre || '';
    })
  }

  getCandidatos() {
    this.apiService.getCandidatos().subscribe({
      next: (resp: any) => {
        const candidatos = resp?.candidatos || resp || [];
        
        this.listCandidatos = candidatos;
        
        if (candidatos.length === 0) {
          this.alertService.errorAlert('No se encontraron candidatos para este reporte. Por favor, contacte al administrador.');
        } else {
          // Limpiar FormArray de votos antes de agregar nuevos
          const votos = this.createForm.get('votos') as FormArray;
          while (votos.length !== 0) {
            votos.removeAt(0);
          }
          
          candidatos.forEach(() => {
            votos.push(
              this.fb.control('', Validators.required)
            );
          });
        }
      },
      error: (error) => {
        this.alertService.errorAlert('Error al cargar los candidatos. Por favor, intente nuevamente.');
        this.listCandidatos = [];
      }
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
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

}
