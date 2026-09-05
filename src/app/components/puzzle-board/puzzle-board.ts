import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, ViewChild } from '@angular/core';
import { CoreShapeComponent, StageComponent } from 'ng2-konva';

import { CoordinateValue } from '../../models/coordinate-value';
import { GameType } from '../../models/game-type';
import { Point } from '../../models/point';

@Component({
  selector: 'app-puzzle-board',
  imports: [CoreShapeComponent, StageComponent],
  templateUrl: './puzzle-board.html',
  styleUrl: './puzzle-board.css',
})
export class PuzzleBoard implements AfterViewInit, OnChanges {

  @ViewChild('stageWrapper')
  stageWrapper!: ElementRef<HTMLDivElement>;

  @Input({ required: true })
  gameType!: GameType;

  controlsLeft = 40;
  controlsTop = 300;
  controlsWidth = 160;

  private readonly controlsMaxWidth = 160;
  private readonly controlsMinWidth = 120;

  private readonly controlsLogicalX = 40;
  private readonly controlsLogicalY = 300;

  private readonly stageWidth = 1000;
  private readonly mainStageHeight = 480;
  private readonly catalogStageHeight = 120;
  private readonly minScale = 0.85;

  mainStageDisplayHeight = this.mainStageHeight;

  mainStageConfig = {
    width: this.stageWidth,
    height: this.mainStageHeight,
    scaleX: 1,
    scaleY: 1
  };

  catalogStageConfig = {
    width: this.stageWidth,
    height: this.catalogStageHeight,
    scaleX: 1,
    scaleY: 1
  };

  mainTaskAreaConfig = {
    x: 275,
    y: 0,
    width: 725,
    height: 480,
    fill: '#e6e6e6'
  };

  catalogBackgroundConfig = {
    x: 0,
    y: 0,
    width: this.stageWidth,
    height: this.catalogStageHeight,
    fill: '#e6e6e6'
  };

  basePieceConfig = {
    x: 0,
    y: 0,
    points: [] as number[],
    closed: true,
    stroke: '#333',
    strokeWidth: 1
  };

  ngOnChanges(): void {
    this.basePieceConfig = {
      ...this.basePieceConfig,
      points: this.toKonvaPoints(
        this.gameType.baseShape,
        this.gameType.unitSize
      )
    };
  }

  ngAfterViewInit(): void {
    this.resizeStage();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeStage();
  }

  private resizeStage(): void {
    const availableWidth = this.stageWrapper.nativeElement.clientWidth;

    const scale = Math.max(
      this.minScale,
      availableWidth / this.stageWidth
    );

    this.mainStageConfig = {
      width: this.stageWidth * scale,
      height: this.mainStageHeight * scale,
      scaleX: scale,
      scaleY: scale
    };

    this.catalogStageConfig = {
      width: this.stageWidth * scale,
      height: this.catalogStageHeight * scale,
      scaleX: scale,
      scaleY: scale
    };

    this.controlsLeft = this.controlsLogicalX * scale;
    this.controlsTop = this.controlsLogicalY * scale;
    this.mainStageDisplayHeight = this.mainStageHeight * scale;

    const controlsAvailableWidth = (this.mainTaskAreaConfig.x - this.controlsLogicalX) * scale;
    this.controlsWidth = Math.max(
      this.controlsMinWidth,
      Math.min(this.controlsMaxWidth, controlsAvailableWidth)
    );
  }

  private coordinateToNumber(coordinate: CoordinateValue): number {
    return (coordinate.constant ?? 0)
      + (coordinate.sqrt2 ?? 0) * Math.sqrt(2)
      + (coordinate.sqrt3 ?? 0) * Math.sqrt(3);
  }

  private toKonvaPoints(points: Point[], unitSize: number): number[] {
    return points.flatMap(point => [
      this.coordinateToNumber(point.x) * unitSize,
      this.coordinateToNumber(point.y) * unitSize
    ]);
  }

}
