import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../services/loader/loader.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  loading!: boolean;

  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe((v:any) => {
      //console.log(v);
      this.loading = v;
    });
   }

  ngOnInit(): void {
  }

}
