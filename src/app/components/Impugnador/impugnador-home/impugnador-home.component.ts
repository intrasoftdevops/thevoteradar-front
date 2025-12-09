import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-impugnador-home',
  templateUrl: './impugnador-home.component.html',
  styleUrls: ['./impugnador-home.component.scss']
})
export class ImpugnadorHomeComponent implements OnInit {
  safeURL: any;

  constructor(private _sanitizer: DomSanitizer) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl("");
  }

  ngOnInit(): void {
  }

}
