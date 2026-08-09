import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TaskCard } from "./task-card";
import type { Task } from "../tasks/task.model";

const TASK: Task = {
  id: "b3f1c0de-9a2b-4d77-8f3e-1c6a5d0e2b41",
  title: "Configurar projeto Angular",
  description: null,
  done: false,
  createdAt: "2026-08-09T12:00:00.000Z",
  updatedAt: "2026-08-09T12:00:00.000Z",
};

describe("TaskCard", () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    fixture.componentRef.setInput("task", TASK);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the title", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Configurar projeto Angular");
  });
});
