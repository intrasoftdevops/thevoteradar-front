import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/custom-validation.service';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-testigo-home',
  templateUrl: './testigo-home.component.html',
  styleUrls: ['./testigo-home.component.scss']
})
export class TestigoHomeComponent implements OnInit {

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService,
    private customValidator: CustomValidationService) { }

  ngOnInit() {
  }

}
