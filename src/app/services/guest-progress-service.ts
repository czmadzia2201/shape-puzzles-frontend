import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GuestProgressService {

  private readonly guestSolvedTasksKey = 'guestSolvedTasks';

  addToSolvedTasks(taskId: string): void {
    const solvedTasks = this.getSolvedTasks();
    solvedTasks.add(taskId);
    localStorage.setItem(this.guestSolvedTasksKey, JSON.stringify([...solvedTasks]));
  }

  clearSolvedTasks(): void {
    localStorage.removeItem(this.guestSolvedTasksKey);
  }

  getSolvedTasks(): Set<string> {
    const stored = localStorage.getItem(this.guestSolvedTasksKey);
    return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
  }

}
