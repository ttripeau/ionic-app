import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-text-info-html',
  templateUrl: './text-info-html.component.html',
  styleUrls: ['./text-info-html.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TextInfoHTMLComponent implements OnChanges{

  @Input() text = '';

  public content: SafeHtml = '';

  constructor(private domSanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    this.content = this.domSanitizer.bypassSecurityTrustHtml(this.text);
  }
}
