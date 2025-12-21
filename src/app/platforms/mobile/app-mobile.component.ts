import { Component } from '@angular/core';
import { IonApp, IonButton, IonRouterOutlet, IonItem, IonInput, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mobile-root',
  standalone: true,
  imports: [IonInput, IonApp, IonRouterOutlet, IonButton,IonItem, IonLabel],
  templateUrl: './app-mobile.component.html',
  styleUrl: './app-mobile.component.scss'
})
export class AppMobileComponent {}