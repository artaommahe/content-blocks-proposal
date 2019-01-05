import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { TInputData } from '../../interface';
import { IAnswer } from '@skyeng/libs/blocks/base/model/interface';

@Component({
  selector: 'sky-input-view',
  templateUrl: 'input-view.html',
  styleUrls: [ 'input-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputViewComponent {
  @Input() correctAnswers: string[];
  @Input() currentAnswer: IAnswer<TInputData> | undefined;

  @Output() valueChange = new EventEmitter<TInputData>();

  @ViewChild('input') inputRef: ElementRef<HTMLInputElement>;

  public onKeyDown(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      this.submit();
    }
  }

  public submit(): void {
    const value = this.inputRef.nativeElement.value;

    this.valueChange.emit(value);
  }
}
