import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-coordinador-home',
  templateUrl: './coordinador-home.component.html',
  styleUrls: ['./coordinador-home.component.scss']
})
export class CoordinadorHomeComponent implements OnInit {
  safeURL: any;

  constructor(private _sanitizer: DomSanitizer) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/bNU_d8rei4k");
  }

  ngOnInit(): void {
  }

}
