import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { GameType } from '../../models/game-type';

@Component({
  selector: 'app-about-game-type-dialog',
  imports: [],
  templateUrl: './about-game-type-dialog.html',
  styleUrl: '../dialogs.css',
})
export class AboutGameTypeDialog {

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  @Input({ required: true })
  gameType: GameType | null = null;

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

}
