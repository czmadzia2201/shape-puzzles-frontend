import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';

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

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

  reset(): void {
    this.resetConfirmed.emit();
    this.close();
  }

}
