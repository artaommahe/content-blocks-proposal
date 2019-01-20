import { NgModule } from '@angular/core';
import { NodesPortalComponent } from './component/nodes-portal/nodes-portal';

@NgModule({
  declarations: [
    NodesPortalComponent,
  ],
  exports: [
    NodesPortalComponent,
  ]
})
export class BaseModule {
}
