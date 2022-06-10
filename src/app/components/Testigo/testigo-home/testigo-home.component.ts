import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-testigo-home',
  templateUrl: './testigo-home.component.html',
  styleUrls: ['./testigo-home.component.scss']
})
export class TestigoHomeComponent implements OnInit {

  videos: string[] = ["https://www.youtube.com/embed/g40iqIY243s", "https://www.youtube.com/embed/FZVAxoBYWyg"];
  sanitizedVideos!: SafeResourceUrl[];

  constructor(private _sanitizer: DomSanitizer) {
    this.sanitizedVideos = this.videos.map(video => this._sanitizer.bypassSecurityTrustResourceUrl(video));
  }
  ngOnInit() {
  }

}
