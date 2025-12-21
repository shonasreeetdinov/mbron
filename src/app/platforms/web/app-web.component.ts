// src/app/platforms/web/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-web-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app-web.component.html',
  styleUrl: './app-web.component.scss'
})
export class AppWebComponent {}