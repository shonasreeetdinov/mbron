import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { appConfig } from './app/app.config';
import { AppMobileComponent } from './app/platforms/mobile/app-mobile.component';
import { mobileConfig } from './app/platforms/mobile/app-mobile.config';

bootstrapApplication(AppMobileComponent, {
  providers: [
    provideAnimations(),
    ...appConfig.providers!,
    ...mobileConfig.providers!,
  ],
}).catch((err) => console.error(err));
