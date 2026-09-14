import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-reset-progress-dialog',
  imports: [],
  templateUrl: './reset-progress-dialog.html',
  styleUrl: '../dialogs.css',
})
export class ResetProgressDialog {

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  @Output()
  resetConfirmed = new EventEmitter<void>();

  @Output()
  resetCancelled = new EventEmitter<void>();

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  reset(): void {
    this.resetConfirmed.emit();
    this.close();
  }

  cancel(event: Event): void {
    event.preventDefault();
    this.resetCancelled.emit();
    this.close();
  }

  private close(): void {
    this.dialog.nativeElement.close();
  }

}
