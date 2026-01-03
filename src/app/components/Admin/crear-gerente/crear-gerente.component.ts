import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-crear-gerente',
  templateUrl: './crear-gerente.component.html',
  styleUrls: ['./crear-gerente.component.scss']
})
export class CrearGerenteComponent implements OnInit {

  dataMunicipals: any = [];
  dataDepartments: any = [];

  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
    numero_documento: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    departamento: [null], // Opcional - puede asignarse después
    municipios: [null], // Opcional - puede asignarse después
  });

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private customValidator: CustomValidationService
  ) { }

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  getSelectedValue(item: any) {
    this.createForm.patchValue({
      municipios: null, // Cambiado de [] a null
    });
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico)
    } else {
      this.dataMunicipals = [];
    }
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    if (!this.createFormControl['email'].errors?.['email'] || !this.createFormControl['email'].errors?.['invalidEmail']) {

      if (this.createForm.valid) {
        // Transformar los datos del formulario al formato esperado por el backend
        const formValue = this.createForm.value;
        const gerenteData: any = {
          email: formValue.email,
          numero_documento: formValue.numero_documento.toString(),
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          telefono: formValue.telefono ? formValue.telefono.toString() : null,
        };
        
        // Solo incluir departamento y municipios si fueron seleccionados
        if (formValue.departamento) {
          gerenteData.departamento = formValue.departamento; // Ya es un string (codigo_unico) gracias a bindValue
        }
        
        if (Array.isArray(formValue.municipios) && formValue.municipios.length > 0) {
          gerenteData.municipios = formValue.municipios; // Array de códigos únicos
        }
        
        console.log('📤 Datos a enviar:', gerenteData);
        
        // Usar el nuevo servicio de backoffice en lugar de voteradar-back
        this.backofficeAdminService.createGerente(gerenteData).subscribe({
          next: (resp: any) => {
            this.alertService.successAlert(resp.message || 'Gerente creado correctamente');
            // Opcional: resetear el formulario después de crear
            this.createForm.reset();
            this.dataMunicipals = [];
          },
          error: (error: any) => {
            console.error('❌ Error al crear gerente:', error);
            console.error('❌ Error completo:', error.error);
            // Mostrar detalles del error de validación si están disponibles
            let errorMessage = 'Error al crear el gerente';
            if (error.error?.detail) {
              if (Array.isArray(error.error.detail)) {
                // Si es un array de errores de validación
                errorMessage = error.error.detail.map((err: any) => 
                  `${err.loc?.join('.')}: ${err.msg}`
                ).join('\n');
              } else {
                errorMessage = error.error.detail;
              }
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
            this.alertService.errorAlert(errorMessage);
          }
        });
      } else {
        this.alertService.errorAlert("Llene los campos obligatorios.");
      }

    }
  }

  getDepartmentAdmin() {
    // Usar el nuevo servicio de backoffice
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        // Adaptar respuesta según el formato del nuevo endpoint
        this.dataDepartments = resp.departamentos || resp || [];
      },
      error: (error: any) => {
        console.error('❌ Error al cargar departamentos:', error);
        console.error('❌ Error completo:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          message: error.message
        });
        this.dataDepartments = [];
        
        let errorMessage = 'Error al cargar los departamentos.';
        
        if (error.status === 401) {
          errorMessage = 'Error de autenticación: El token del backoffice no es válido para esta operación. ' +
            'Por favor, contacte al administrador del sistema.';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor (500): El backend no pudo procesar la solicitud. ' +
            'Esto puede deberse a un problema de autenticación o configuración. ' +
            'Verifique los logs del servidor backend.';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión: No se pudo conectar con el servidor backend. ' +
            'Verifique que el servidor esté corriendo en http://localhost:8002';
        } else if (error.error?.detail || error.error?.message) {
          errorMessage = `Error: ${error.error.detail || error.error.message}`;
        }
        
        this.alertService.errorAlert(errorMessage);
      }
    });
  }

  getMunicipalAdmin(codigoDepartamento: string) {
    // Usar el nuevo servicio de backoffice, pasando el código del departamento
    this.backofficeAdminService.getMunicipiosAdmin(codigoDepartamento).subscribe({
      next: (resp: any) => {
        console.log('✅ Municipios cargados:', resp);
        // Adaptar respuesta según el formato del nuevo endpoint
        // El backend ya filtra por departamento, así que no necesitamos filtrar aquí
        this.dataMunicipals = resp.municipios || resp || [];
      },
      error: (error: any) => {
        console.error('❌ Error al cargar municipios:', error);
        console.error('❌ Error completo:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          message: error.message
        });
        this.dataMunicipals = [];
        
        let errorMessage = 'Error al cargar los municipios.';
        
        if (error.status === 401) {
          errorMessage = 'Error de autenticación: El token del backoffice no es válido para esta operación. ' +
            'Por favor, contacte al administrador del sistema.';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor (500): El backend no pudo procesar la solicitud. ' +
            'Esto puede deberse a un problema de autenticación o configuración. ' +
            'Verifique los logs del servidor backend.';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión: No se pudo conectar con el servidor backend. ' +
            'Verifique que el servidor esté corriendo en http://localhost:8002';
        } else if (error.error?.detail || error.error?.message) {
          errorMessage = `Error: ${error.error.detail || error.error.message}`;
        }
        
        this.alertService.errorAlert(errorMessage);
      }
    });
  }

}
