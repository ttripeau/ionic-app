import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
})
export class RatingComponent {
  @Input() ratingSize: number = 5;
  @Input() value: number = 0;

  @Output() changeRate: EventEmitter<number> = new EventEmitter<number>();
  @Output() removeRate: EventEmitter<number> = new EventEmitter<number>();

  public ratingArray: number[] = [];

  constructor() {
    for (let index = 0; index < this.ratingSize; index++) {
      this.ratingArray.push(index);
    }
  }

  calculateRating(rating: number) {
    if (parseInt(`${rating}`, 10) === parseInt(`${this.value}`, 10)) {
      this.removeRate.emit();
    } else {
      this.changeRate.emit(rating);
    }
  }

  iconStatus(index: number) {
    return this.value >= index + 1 ? 'star' : 'star-outline';
  }
}
