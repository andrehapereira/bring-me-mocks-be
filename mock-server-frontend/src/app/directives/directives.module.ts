import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassOnHover } from './json-prettify/class-on-hover.directive';



@NgModule({
  declarations: [
    ClassOnHover
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ClassOnHover
  ]
})
export class DirectivesModule { }
