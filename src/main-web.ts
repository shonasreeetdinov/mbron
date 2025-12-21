import { bootstrapApplication } from '@angular/platform-browser';

import { AppWebComponent } from './app/platforms/web/app-web.component';
import { appConfig } from './app/app.config';
import { webConfig } from './app/platforms/web/app-web.config';
import { provideIonicAngular } from '@ionic/angular/standalone';

bootstrapApplication(AppWebComponent, {
  providers: [
    ...appConfig.providers!,
    ...webConfig.providers!, provideIonicAngular({})
  ]
}).catch(err => console.error(err));