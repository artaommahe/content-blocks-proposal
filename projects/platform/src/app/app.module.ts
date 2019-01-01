import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from './component/app/app';
import { BlocksModule } from '@skyeng/libs/blocks/module';
import { ScoreModule } from '../score/module';

@NgModule({
  imports: [
    BrowserModule,
    // loaded with separate bundle in real app
    BlocksModule,
    ScoreModule,
  ],
  declarations: [
    AppComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
