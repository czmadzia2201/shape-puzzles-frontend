import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GuestProgressService {

  private solvedTasks = new Set<string>();

  addToSolvedTasks(taskId: string): void {
    this.solvedTasks.add(taskId);
  }

  clearSolvedTasks(): void {
    this.solvedTasks.clear();
  }

  getSolvedTasks(): Set<string> {
    return this.solvedTasks;
  }

}
