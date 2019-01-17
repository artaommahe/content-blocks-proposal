import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IOrderWordFormattedItem } from '../../interface';

@Component({
  selector: 'sky-order-word-answer-item',
  templateUrl: 'order-word-answer-item.html',
  styleUrls: [ 'order-word-answer-item.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderWordAnswerItemComponent {
  @Input() isFirst: boolean;
  @Input() isLast: boolean;
  @Input() item: IOrderWordFormattedItem;

  @Output() moveLeft = new EventEmitter<void>();
  @Output() moveRight = new EventEmitter<void>();

  public isCorrect(): boolean {
    return this.item.isCorrect === true;
  }

  public isWrong(): boolean {
    return this.item.isCorrect === false;
  }

  public onMoveLeftClick(): void {
    if (this.isFirst) {
      return;
    }

    this.moveLeft.emit();
  }

  public onMoveRightClick(): void {
    if (this.isLast) {
      return;
    }

    this.moveRight.emit();
  }
}
