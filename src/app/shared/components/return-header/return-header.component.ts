import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { PreviousRouteService } from 'src/app/core/services/previous-route.service';

@Component({
  selector: 'app-return-header',
  templateUrl: './return-header.component.html',
  styleUrls: ['./return-header.component.scss'],
})
export class ReturnHeaderComponent implements OnInit {
  @Input() defaultHref: string = '/app/tabs/home';
  @Input() colorBg?: string = '';
  @Input() colorBtn: string = '';
  @Input() text: string = '';
  @Input() title: string = '';
  @Input() colorTitle: string = 'dark';
  @Input() buttonBack: boolean = false;
  @Input() icon: string = 'chevron-back-outline';
  @Input() hasFavorite: boolean = false;
  @Input() hasAddToMySession: boolean = false;
  @Input() forCamera: boolean = false;
  @Input() isFavorite: boolean = false;
  @Input() newMessage: boolean = false;
  @Input() positionAbsolute: boolean = true;

  @Output() clickBack: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() clickAddToMyCalendar: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() addFavorite: EventEmitter<void> = new EventEmitter<void>();
  @Output() removeFavorite: EventEmitter<void> = new EventEmitter<void>();
  @Output() save: EventEmitter<void> = new EventEmitter<void>();

  public isIos: boolean = false;

  constructor(private previousRouteService: PreviousRouteService, private platform: Platform, private router: Router) {}

  public ngOnInit(): void {
    this.isIos = this.platform.is('ios');
  }

  public goBack(event: Event): void {
    this.clickBack.emit(event);
  }

  public addFavoriteHandler(): void {
    this.addFavorite.emit();
  }

  public removeFavoriteHandler(): void {
    this.removeFavorite.emit();
  }

  public saveHandler(): void {
    this.save.emit();
  }

  public previousRoute(event: Event): void {
    this.goBack(event);
    this.previousRouteService.back();
  }

  public openNewConversation(): void {
    this.router.navigate(['/app/tabs/new-conversation']);
  }

  public addToMyCalendar(): void {
    this.clickAddToMyCalendar.emit();
  }
}
