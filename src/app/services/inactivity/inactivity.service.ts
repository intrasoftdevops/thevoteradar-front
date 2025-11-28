import { Injectable } from '@angular/core';
import { Subject, Observable, timer, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private inactivityTimeout: number = 300000; 
  private inactivityTimer: Observable<number>;
  private inactivitySubscription: Subscription;

  private inactivitySource = new Subject<void>();

  constructor() {
    this.inactivityTimer = timer(this.inactivityTimeout);
    this.inactivitySubscription = this.inactivityTimer.subscribe(() => {
      this.inactivitySource.next();
    });
  }

  
  resetTimer() {
    this.inactivitySubscription.unsubscribe();
    this.inactivitySubscription = this.inactivityTimer.subscribe(() => {
      this.inactivitySource.next();
    });
  }

  get inactivityObservable(): Observable<void> {
    return this.inactivitySource.asObservable();
  }
}
