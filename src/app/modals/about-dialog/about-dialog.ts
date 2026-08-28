import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-about-dialog',
  imports: [],
  templateUrl: './about-dialog.html',
  styleUrl: '../dialogs.css',
})
export class AboutDialog {

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

}
