import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IOrderWordFormattedItem } from '../../interface';

@Component({
  selector: 'sky-order-word-view',
  templateUrl: 'order-word-view.html',
  styleUrls: [ 'order-word-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderWordViewComponent {
  @Input() items: IOrderWordFormattedItem[];

  @Output() set = new EventEmitter<string[]>();

  public itemTrack(_index: number, item: IOrderWordFormattedItem): string {
    return item.id;
  }

  public moveLeft(index: number): void {
    const item = this.items[index];
    const otherItem = this.items[index - 1];

    this.items = [
      ...this.items.slice(0, index - 1),
      item,
      otherItem,
      ...this.items.slice(index + 1),
    ];
  }

  public moveRight(index: number): void {
    const item = this.items[index];
    const otherItem = this.items[index + 1];

    this.items = [
      ...this.items.slice(0, index),
      otherItem,
      item,
      ...this.items.slice(index + 2),
    ];
  }

  public onSetClick(): void {
    const itemsIds = this.items.map(item => item.id);

    this.set.emit(itemsIds);
  }
}
