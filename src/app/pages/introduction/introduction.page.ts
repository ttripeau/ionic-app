import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Virtual, Autoplay, Pagination, Navigation } from 'swiper';
import { Storage } from '@ionic/storage-angular';
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
  selector: 'app-introduction',
  templateUrl: './introduction.page.html',
  styleUrls: ['./introduction.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IntroductionPage {
  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  config = {
    initialSlide: 2,
    slidesPerView: 1,
    centeredSlides: true,
    // autoplay: {
    //   delay: 5000,
    //   disableOnInteraction: false,
    // },
    autoplay: false,
  };

  constructor(private storage: Storage, private router: Router) {}

  public async acceptIntroduction(): Promise<void> {
    await this.storage.set('introduction_accepted', true);
    if (this.swiper?.currentVirtualData) {
      const { slides, ...rest } = this.swiper?.currentVirtualData;
      console.log('slides: ', slides);
      console.log('rest: ', rest);
    }
    this.router.navigate(['/app/tabs/home'], { replaceUrl: true });
  }
}
