import { Component, ChangeDetectionStrategy, ElementRef, OnInit } from '@angular/core';
import { InputComponent } from '../input/input';
import { getParentComponent } from '@skyeng/libs/blocks/base/helpers';

@Component({
  selector: 'sky-input-answer',
  template: `
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputAnswerComponent implements OnInit {
  constructor(
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  public ngOnInit() {
    // no ng-content content on init
    window.setTimeout(() => {
      const answer = (this.elementRef.nativeElement.textContent || '').trim();
      const inputComponent = getParentComponent<InputComponent>(this.elementRef.nativeElement, 'sky-input');

      inputComponent.addCorrectAnswer(answer);

      this.elementRef.nativeElement.textContent = '';
    });
  }
}
