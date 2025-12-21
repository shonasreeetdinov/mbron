import { Component, OnInit } from '@angular/core';
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
export class AppMobileComponent implements OnInit {
  now = Date.now();
  constructor(
    private updateService: UpdateService,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.platform.ready();

    // App ochilganda yangi versiyani check qilish
    this.updateService.checkForUpdate();

    // Ixtiyoriy: Har 10 daqiqada check qilish
    setInterval(() => {
      this.updateService.checkForUpdate();
    }, 10 * 60 * 1000);
  }
}