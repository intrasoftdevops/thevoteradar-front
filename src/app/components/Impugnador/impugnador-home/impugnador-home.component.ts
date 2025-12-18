import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-impugnador-home',
  templateUrl: './impugnador-home.component.html',
  styleUrls: ['./impugnador-home.component.scss']
})
export class ImpugnadorHomeComponent implements OnInit {
  safeURL: SafeResourceUrl | null = null;

  constructor(private _sanitizer: DomSanitizer) {
    // Si hay una URL de video, se puede configurar aquí
    const videoUrl = ""; // Puedes agregar una URL de video aquí si es necesario
    if (videoUrl) {
      this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
    }
  }

  ngOnInit(): void {
  }
}
