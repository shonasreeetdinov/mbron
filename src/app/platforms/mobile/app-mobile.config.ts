import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { mobileRoutes } from './app-mobile.routes';
import { provideHttpClient } from '@angular/common/http';

export const mobileConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    provideRouter(mobileRoutes),
    provideHttpClient()
  ]
};