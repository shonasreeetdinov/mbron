import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'test',
    pathMatch: 'full',
  },
  {
    path: 'test',
    loadComponent: () => import('./pages/test.page').then(m => m.TestPage),
  },
];
