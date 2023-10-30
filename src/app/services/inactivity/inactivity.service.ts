import { Injectable } from '@angular/core';
import { Subject, Observable, timer, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private inactivityTimeout: number = 300000; // Tiempo de inactividad en milisegundos (10 minutos)
  private inactivityTimer: Observable<number>;
  private inactivitySubscription: Subscription;

  private inactivitySource = new Subject<void>();

  constructor() {
    this.inactivityTimer = timer(this.inactivityTimeout);
    this.inactivitySubscription = this.inactivityTimer.subscribe(() => {
      this.inactivitySource.next();
    });
  }

  // Este servicio crea un temporizador que se activa después de un período de inactividad (en el ejemplo, 10 minutos) y emite un observable cuando se alcanza el tiempo de inactividad.
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
