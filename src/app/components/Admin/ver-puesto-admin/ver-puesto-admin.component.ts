import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-ver-puesto-admin',
  templateUrl: './ver-puesto-admin.component.html',
  styleUrls: ['./ver-puesto-admin.component.scss']
})
export class VerPuestoAdminComponent implements OnInit {

  tabla: boolean = false;
  dataDepartments: any = [];
  data: any = {
    gerentes: {
      cantidad_gerentes_existentes: 0,
      cantidad_gerentes_necesitados: 0,
      cantidad_gerentes_por_asignar: 0
    },
    supervisores: {
      cantidad_supervisores_existentes: '',
      cantidad_supervisores_necesitados: '',
      cantidad_supervisores_por_asignar: ''
    },
    coordinadores: {
      cantidad_coordinadores_existentes: '',
      cantidad_coordinadores_necesitados: '',
      cantidad_coordinadores_por_asignar: ''
    },
    testigos: {
      cantidad_testigos_existentes: '',
      cantidad_testigos_necesitados: '',
      cantidad_testigos_por_asignar: ''
    }
  };

  constructor(private apiService: ApiService, private alertService: AlertService) { }

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  getSelectedDepartment(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { departamento: codigo_unico };
      this.getNecesitadosDepartamento(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    })
  }

  getNecesitadosDepartamento(data: any) {
    this.apiService.getNecesitadosDepartamento(data).subscribe((resp: any) => {
      this.data = resp;
      this.tabla = true;
    }, (err: any) => {
      this.alertService.errorAlert(err.message);
    })
  }

  textColor(existentes: any, necesitados: any) {
    if (existentes == necesitados) {
      return 'text-success';
    } else if (existentes < necesitados) {
      return 'text-primary';
    } else {
      return 'text-danger'
    }
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
