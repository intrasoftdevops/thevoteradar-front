import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-testigo-home',
  templateUrl: './testigo-home.component.html',
  styleUrls: ['./testigo-home.component.scss']
})
export class TestigoHomeComponent implements OnInit {
  safeURL: any;

  constructor(private _sanitizer: DomSanitizer) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/bNU_d8rei4k");
  }
  ngOnInit() {
  }

}
