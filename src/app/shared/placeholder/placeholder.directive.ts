import { Directive, ViewContainerRef } from "@angular/core";

@Directive({ selector: "[appPlaceholder]" })
export class PlaceolderDirective {
  constructor(public viewConteinerRef: ViewContainerRef) {}
}
