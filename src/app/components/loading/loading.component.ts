import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../services/loader/loader.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  loading: boolean = false;
  timeLeft: number = 60;
  interval: any;

  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe((v: any) => {
      //console.log(v);
      this.loading = v;
      this.pauseTimer();
      this.timeLeft = 60;
      if (v) {
        this.startTimer();
      }
      //console.log(this.timeLeft);
      if (this.timeLeft == 0) {
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
    }, 1000)
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

}
