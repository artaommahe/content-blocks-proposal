import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ExampleComponent } from '../example/example';
import { getParentComponent } from '@skyeng/libs/blocks/base/helpers';

@Component({
  selector: 'sky-example-answer',
  template: `
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleAnswerComponent implements OnInit {
  constructor(
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  public ngOnInit() {
    // no content on init
    window.setTimeout(() => {
      const answer = parseInt(this.elementRef.nativeElement.textContent, 10);
      const exampleComponent = getParentComponent<ExampleComponent>(this.elementRef.nativeElement, 'sky-example');

      exampleComponent.addCorrectAnswer(answer);

      this.elementRef.nativeElement.textContent = '';
    });
  }
}
