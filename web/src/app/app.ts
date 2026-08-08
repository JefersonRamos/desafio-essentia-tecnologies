import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Components
import { Navigation } from "./navigation/navigation";
import {TaskCard} from "./task-card/task-card";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, TaskCard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('code');
}
