import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Virtual, Autoplay, Pagination, Navigation } from 'swiper';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { Router } from '@angular/router';

SwiperCore.use([Virtual]);
SwiperCore.use([Navigation, Pagination]);
SwiperCore.use([Autoplay, Navigation, Pagination]);

export interface SlideInterface {
  picture: string;
  link?: string;
  route?: string;
}

@Component({
  selector: 'app-slider-sponsor',
  templateUrl: './slider-sponsor.component.html',
  styleUrls: ['./slider-sponsor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SliderSponsorComponent {
  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  @Input() slides?: SlideInterface[] = [];

  @Input() config = {
    initialSlide: 1,
    slidesPerView: 1,
    centeredSlides: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
    },
  };

  constructor(private inAppBrowserService: InAppBrowserService, private router: Router) {}

  public openUrl(url: string | undefined): void {
    if (url) {
      this.inAppBrowserService.openUrl(url);
    }
  }

  public changePage(url: string | undefined): void {
    if (url) {
      this.router.navigate([url]);
    }
  }

  public clickAdMainSponsor(slide: SlideInterface): void {
    console.log('slide: ', slide);
  }
}
