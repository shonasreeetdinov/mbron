// app-mobile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { UpdateService } from '../../shared/service/update.service';
import { IonContent, IonRouterOutlet, IonApp } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-mobile-root',
  templateUrl: './app-mobile.component.html',
  styleUrls: ['./app-mobile.component.scss'],
  standalone: true,
  imports: [IonApp, IonContent, IonRouterOutlet, DatePipe]
})
export class AppMobileComponent implements OnInit, OnDestroy {
  now = Date.now();
  private updateInterval?: number;

  constructor(
    private updateService: UpdateService,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.platform.ready();

    // Dastlabki tekshirish
    this.updateService.checkForUpdate();

    // Har 10 daqiqada tekshirish
    this.updateInterval = window.setInterval(() => {
      this.updateService.checkForUpdate();
    }, 10 * 60 * 1000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}