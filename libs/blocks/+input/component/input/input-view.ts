import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { TInputData, TInputAnswer } from '../../interface';

const KEY_AVAILABLE_ANSWERS_COUNT = 3;

@Component({
  selector: 'sky-input-view',
  templateUrl: 'input-view.html',
  styleUrls: [ 'input-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputViewComponent {
  @Input() answers: TInputAnswer[];
  @Input() correctAnswers: string[];
  @Input() currentAnswer: TInputAnswer | undefined;

  @Output() useKey = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<TInputData>();

  @ViewChild('input') inputRef: ElementRef<HTMLInputElement>;

  public canUseKey(): boolean {
    return !this.isCorrect() && (this.answers.length >= KEY_AVAILABLE_ANSWERS_COUNT);
  }

  public isCorrect(): boolean {
    return (!!this.currentAnswer && (this.currentAnswer.isCorrect === true));
  }

  public isWrong(): boolean {
    return (!!this.currentAnswer && (this.currentAnswer.isCorrect === false));
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      this.submit();
    }
  }

  public onKeyClick(): void {
    this.useKey.emit();
  }

  public submit(): void {
    const value = this.inputRef.nativeElement.value;

    this.valueChange.emit(value);
  }
}
