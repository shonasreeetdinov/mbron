import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonApp,
  IonButton,
  IonRouterOutlet,
  IonItem,
  IonInput,
  IonLabel,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-mobile-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonContent, DatePipe],
  templateUrl: './app-mobile.component.html',
  styleUrl: './app-mobile.component.scss',
})
export class AppMobileComponent {
  now = new Date();
}
