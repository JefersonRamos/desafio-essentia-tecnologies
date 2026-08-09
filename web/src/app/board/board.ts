import { Component } from '@angular/core';
import { Navigation } from '../navigation/navigation';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-board',
  imports: [Navigation, TaskCard],
  templateUrl: './board.html',
})
export class Board {}
