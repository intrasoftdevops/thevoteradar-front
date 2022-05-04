import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LocalDataService } from './services/localData/local-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'voteradar-front';
  rol: any;
  subscriber!: Subscription;

  constructor(private localData: LocalDataService, private router: Router) {
  }

  ngOnInit() {
    this.getRol();
    this.subscriber = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.getRol();
    });
  }

  getRol() {
    this.rol = this.localData.getRol();
  }

}
