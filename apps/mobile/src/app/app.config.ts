import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Preloading o'chirildi - mobile uchun lazy loading optimallashtirish
    // Faqat kerakli sahifalar yuklanadi, chunk'lar kamayadi
    provideRouter(routes),
    provideAnimations(),
  ],
};
