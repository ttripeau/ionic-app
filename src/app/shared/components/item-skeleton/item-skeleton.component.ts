import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-skeleton',
  templateUrl: './item-skeleton.component.html',
  styleUrls: ['./item-skeleton.component.scss'],
})
export class ItemSkeletonComponent implements OnInit {
  @Input() lines = 'inset';
  @Input() linesSize = 3;
  @Input() rounded = true;

  public fakeArray: number[] = [];

  ngOnInit(): void {
    for (let i = 0; i < this.linesSize; i++) {
      this.fakeArray.push(this.randomIntFromInterval(40, 90));
    }
  }

  public randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
