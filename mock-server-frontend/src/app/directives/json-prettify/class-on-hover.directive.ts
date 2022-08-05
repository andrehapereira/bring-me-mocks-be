import { AfterViewChecked, Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[feClassOnHover]'
})
export class ClassOnHover {

  @Input('feClassOnHover')
  classToToggle = '';

  constructor(private el: ElementRef) { 
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.classList.add(this.classToToggle);
  }
  
  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.classList.remove(this.classToToggle);
  }

}
