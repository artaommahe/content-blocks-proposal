import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from './component/app/app';
import { BlocksModule } from '@skyeng/libs/blocks/module';
import { ScoreModule } from '../score/module';
import { SyncService } from '../sync/service/sync';
import { EventsComponent } from './component/events/events';
import { ConfigComponent } from './component/config/config';

@NgModule({
  imports: [
    BrowserModule,
    // loaded with separate bundle in real app
    BlocksModule,
    ScoreModule,
  ],
  declarations: [
    AppComponent,
    EventsComponent,
    ConfigComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {
  constructor(
    _syncService: SyncService,
  ) {
  }
}
