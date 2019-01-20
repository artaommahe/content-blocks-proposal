import { Component, ChangeDetectionStrategy, ElementRef, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sky-nodes-portal',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodesPortalComponent implements OnInit {
  @Input() nodes: Node[];

  constructor(
    private elementRef: ElementRef<HTMLElement>
  ) {
  }

  public ngOnInit() {
    this.nodes.forEach(node => this.elementRef.nativeElement.appendChild(node));
  }
}
