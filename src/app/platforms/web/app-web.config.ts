import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { webRoutes } from './app-web.routes';

export const webConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            webRoutes,
            withViewTransitions()
        )
    ]
};
