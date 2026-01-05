import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonRouterOutlet, IonApp],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'mbron-mobile';
  
  constructor(private platform: Platform) { }

  async ngOnInit() {
    await this.platform.ready();
    
    // Capacitor server'ni Vercel'ga yo'naltirish (cache bypass bilan)
    this.configureServerUrl();
  }

  private configureServerUrl() {
    const timestamp = Date.now();
    // Native platform'da AppDelegate.swift buni qiladi
    // Web'da Vercel'dan to'g'ridan to'g'ri olib kelamiz
    console.log(`[App] Server configured with cache bypass: t=${timestamp}`);
  }

}
