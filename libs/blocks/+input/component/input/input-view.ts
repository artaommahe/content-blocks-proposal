import {
  Component, ChangeDetectionStrategy, Input, Output, EventEmitter,
  ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy,
} from '@angular/core';
import { TInputData, TInputAnswer } from '../../interface';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { TBlockId } from '@skyeng/libs/blocks/base/interface';
import { debounceTime } from 'rxjs/operators';

const KEY_AVAILABLE_ANSWERS_COUNT = 3;
const TYPING_DEBOUNCE_MS = 300;

@Component({
  selector: 'sky-input-view',
  templateUrl: 'input-view.html',
  styleUrls: [ 'input-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputViewComponent implements AfterViewInit, OnDestroy {
  @Input() blockId: TBlockId;
  @Input() correctAnswers: string[];
  @Input() currentAnswer: TInputAnswer | undefined;
  @Input() value: TInputAnswer;
  @Input() wrongAnswersCount: number;

  @Output() typing = new EventEmitter<string>();
  @Output() useKey = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<TInputData>();

  @ViewChild('input') inputRef: ElementRef<HTMLInputElement>;

  constructor(
    private ngZone: NgZone,
  ) {
  }

  public ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.inputRef.nativeElement, 'input')
        .pipe(
          debounceTime(TYPING_DEBOUNCE_MS),
          takeUntilDestroyed(this),
        )
        .subscribe(() => this.typing.next(this.inputRef.nativeElement.value));
    });
  }

  public ngOnDestroy() {
  }

  public canUseKey(): boolean {
    return !this.isCorrect() && (this.wrongAnswersCount >= KEY_AVAILABLE_ANSWERS_COUNT);
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
