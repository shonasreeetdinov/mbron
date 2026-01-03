import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, IonContent],
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage {
  constructor() { }
}
