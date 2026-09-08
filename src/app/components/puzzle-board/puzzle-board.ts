import Konva from 'konva';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CoreShapeComponent, StageComponent } from 'ng2-konva';

import { CoordinateValue } from '../../models/coordinate-value';
import { GameType } from '../../models/game-type';
import { Point } from '../../models/point';
import { Task } from '../../models/task';
import { ResetProgressDialog } from '../../modals/reset-progress-dialog/reset-progress-dialog';
import { findSnapOffset, flatPointsToSnapPoints, getTransformedVertices, SnapPoint } from './snap-calculator';

@Component({
  selector: 'app-puzzle-board',
  imports: [CoreShapeComponent, StageComponent, ResetProgressDialog],
  templateUrl: './puzzle-board.html',
  styleUrl: './puzzle-board.css',
})
export class PuzzleBoard implements AfterViewInit, OnChanges {

  @ViewChild('stageWrapper')
  stageWrapper!: ElementRef<HTMLDivElement>;

  @ViewChild('resetProgressDialog')
  resetProgressDialog!: ResetProgressDialog;

  @Input({ required: true })
  gameType!: GameType;

  @Input({ required: true })
  solvedTaskIds!: Set<string>;

  @Input({ required: true })
  taskFinished = false;

  @Output()
  verifyRequested = new EventEmitter<Task>();

  @Output()
  taskStarted = new EventEmitter<void>();

  controlsLeft = 40;
  controlsTop = 300;
  controlsWidth = 160;

  private readonly controlsMaxWidth = 160;
  private readonly controlsMinWidth = 120;

  private readonly controlsLogicalX = 40;
  private readonly controlsLogicalY = 300;

  private readonly stageWidth = 1000;
  private readonly mainStageHeight = 480;
  private readonly catalogStageHeight = 160;
  private readonly minScale = 0.85;
  private readonly snapDistance = 10;

  private currentScale = 1;
  mainStageDisplayHeight = this.mainStageHeight;

  pieceConfigs: any[] = [];
  selectedPiece: Konva.Line | null = null;

  taskConfigs: any[] = []
  selectedTask: Task | null = null;
  selectedTaskConfig: Konva.ShapeConfig | null = null;
  pendingTask: Task | null = null;

  piecesModified = false;

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

  selectedTaskGroupConfig: Konva.GroupConfig = {
    x: this.mainTaskAreaConfig.x + this.mainTaskAreaConfig.width / 2,
    y: this.mainTaskAreaConfig.y + this.mainTaskAreaConfig.height / 2
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gameType']) {
      this.basePieceConfig = {
        ...this.basePieceConfig,
        points: this.toKonvaPoints(
          this.gameType.baseShape,
          this.gameType.unitSize
        )
      };

      this.pieceConfigs = this.createPieceConfigs();
      this.taskConfigs = this.createTaskIconConfigs();
    }

    if (changes['solvedTaskIds'] && !changes['gameType']) {
      this.taskConfigs = this.createTaskIconConfigs();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.resizeStage());
  }

  requestVerification(): void {
    if (!this.selectedTask) {
      return;
    }
    this.verifyRequested.emit(this.selectedTask);
  }

  selectPiece(event: any): void {
    const piece = event.target as Konva.Line;
    this.selectedPiece = piece;
    piece.moveToTop();
  }

  selectTaskRequested(task: Task): void {
    if (this.piecesModified && !this.taskFinished && this.selectedTask) {
      this.pendingTask = task;
      this.resetProgressDialog.open();
      return;
    }
    this.selectTask(task);
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.selectedTaskConfig = this.createTaskShapeConfig(task.polygons, 'white');
    this.restorePieces();
    this.taskStarted.emit();
  }

  resetProgress(): void {
    if (this.selectedTask && !this.taskFinished) {
      this.resetProgressDialog.open();
      return;
    }
    this.performReset();
  }

  performReset(): void {
    this.restorePieces();
    if (this.pendingTask) {
      const task = this.pendingTask;
      this.pendingTask = null;
      this.selectTask(task);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeStage();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.selectedPiece) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.piecesModified = true;
      this.selectedPiece.rotation(
        this.selectedPiece.rotation() - 45
      );
    }

    if (event.key === 'ArrowRight') {
      this.piecesModified = true;
      this.selectedPiece.rotation(
        this.selectedPiece.rotation() + 45
      );
    }

    if (event.key === 'ArrowUp') {
      this.piecesModified = true;
      this.selectedPiece.scaleX(
        this.selectedPiece.scaleX() * -1
      );
    }
  }

  snapPiece(event: any): void {
    this.piecesModified = true;
    const draggedNode = event.target as Konva.Line;

    const draggedPoints = getTransformedVertices(draggedNode);

    const targetPoints: SnapPoint[] = [
      ...flatPointsToSnapPoints(this.basePieceConfig.points)
    ];

    targetPoints.push(
      ...this.getSelectedTaskSnapPoints()
    );

    const layer = draggedNode.getLayer();

    if (layer) {
      const otherPieces = layer.find('.piece');

      otherPieces.forEach(node => {
        if (node !== draggedNode) {
          targetPoints.push(
            ...getTransformedVertices(node as Konva.Line)
          );
        }
      });
    }

    const logicalSnapDistance =
      this.snapDistance / this.currentScale;

    const offset = findSnapOffset(
      draggedPoints,
      targetPoints,
      logicalSnapDistance
    );

    if (offset) {
      draggedNode.x(draggedNode.x() + offset.dx);
      draggedNode.y(draggedNode.y() + offset.dy);
    }
  }

  private getSelectedTaskSnapPoints(): SnapPoint[] {
    if (!this.selectedTask) {
      return [];
    }

    const taskX =
      this.mainTaskAreaConfig.x + this.mainTaskAreaConfig.width / 2;

    const taskY =
      this.mainTaskAreaConfig.y + this.mainTaskAreaConfig.height / 2;

    return this.selectedTask.polygons.flatMap(polygon => {
      const points = this.toKonvaPoints(
        polygon,
        this.gameType.unitSize
      );

      return flatPointsToSnapPoints(points).map(point => ({
        x: point.x + taskX,
        y: point.y + taskY
      }));
    });
  }

  private createTaskIconConfigs(): any[] {
    return this.gameType.tasks.map((task, index) => {
      const fillColor = this.solvedTaskIds.has(task.id) ? '#666' : 'white';

      return {
        id: task.id,
        task: task,
        groupConfig: this.createTaskIconGroupConfig(task.id, index),
        shapeConfig: this.createTaskShapeConfig(task.polygons, fillColor)
      };
    });
  }

  private createTaskIconGroupConfig(taskId: string, index: number) {
    const iconSize = 80;
    const iconScale = 0.15;
    const columns = 12;

    let rowsBefore = Math.floor(index / columns);
    let columnsBefore = index % columns;

    return {
      id: taskId,
      name: 'task-icon',
      x: iconSize / 2 + columnsBefore * iconSize,
      y: iconSize / 2 + rowsBefore * iconSize,
      scaleX: iconScale,
      scaleY: iconScale
    };
  }

  private createTaskShapeConfig(polygons: Point[][], fillColor: string): Konva.ShapeConfig {
    const konvaPolygons = polygons.map(polygon =>
      this.toKonvaPoints(polygon, this.gameType.unitSize)
    );

    return {
      fill: fillColor,
      stroke: '#aaa',
      strokeWidth: 1,
      strokeScaleEnabled: false,
      fillRule: 'evenodd',

      sceneFunc: (context: Konva.Context, shape: Konva.Shape) => {
        context.beginPath();

        for (const points of konvaPolygons) {
          context.moveTo(points[0], points[1]);

          for (let i = 2; i < points.length; i += 2) {
            context.lineTo(points[i], points[i + 1]);
          }

          context.closePath();
        }

        context.fillStrokeShape(shape);
      }
    };
  }

  private restorePieces(): void {
    this.pieceConfigs = this.createPieceConfigs();
    this.selectedPiece = null;
    this.piecesModified = false;
  }

  private createPieceConfigs(): any[] {
    return this.gameType.pieces.map(piece => ({
      id: piece.id,
      name: 'piece',

      x: this.coordinateToNumber(piece.startPoint.x) * this.gameType.unitSize,
      y: this.coordinateToNumber(piece.startPoint.y) * this.gameType.unitSize,

      points: this.toKonvaPoints(
        piece.vertices,
        this.gameType.unitSize
      ),

      closed: true,
      fill: '#eef8ee',
      stroke: '#2e7d32',
      strokeWidth: 2,
      draggable: true,

      rotation: 0,
      scaleX: 1,
      scaleY: 1
    }));
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
    this.currentScale = scale;

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
