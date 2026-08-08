import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Components
import { Navigation } from "./navigation/navigation";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('code');
}
