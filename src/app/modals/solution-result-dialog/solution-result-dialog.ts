import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SolutionResultMessages } from '../../models/solution-result';

@Component({
  selector: 'app-solution-result-dialog',
  imports: [],
  templateUrl: './solution-result-dialog.html',
  styleUrl: '../dialogs.css',
})
export class SolutionResultDialog {

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  @Input({ required: true })
  solutionResultMessages!: SolutionResultMessages;

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

}
