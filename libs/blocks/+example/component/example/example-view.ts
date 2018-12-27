import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sky-example-view',
  templateUrl: 'example-view.html',
  styleUrls: [ 'example-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleViewComponent {
  @Input() isCorrect: boolean;
  @Input() value: number;

  @Output() valueChange = new EventEmitter<number>();

  public inc(): void {
    const value = this.value + 1;

    this.valueChange.emit(value);
  }

  public dec(): void {
    const value = this.value - 1;

    this.valueChange.emit(value);
  }
}
