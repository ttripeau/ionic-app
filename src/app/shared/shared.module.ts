// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Modules
import { QuillModule } from 'ngx-quill';
import { IonicModule } from '@ionic/angular';
import { SwiperModule } from 'swiper/angular';
import { QRCodeModule } from 'angularx-qrcode';
import { TranslateModule } from '@ngx-translate/core';

// Directives
import { AutofillDirective } from './directives/autofill.directive';

// Pipes
import { SortPipe } from './pipes/sort.pipe';
import { TimePipe } from './pipes/time.pipe';
import { NgAbsPipeModule } from 'angular-pipes';
import { NgUniqPipeModule } from 'angular-pipes';
import { TruncatePipe } from './pipes/truncate.pipe';
import { NgStripTagsPipeModule } from 'angular-pipes';
import { DateToSincePipe } from './pipes/date-to-since.pipe';

// Modals
import { PlanModal } from './modals/plan/plan.modal';
import { FiltersModal } from './modals/filters/filters.modal';
import { AddNoteModal } from './modals/add-note/add-note.modal';
import { QrcodeModal } from './modals/qrcode-modal/qrcode-modal';
import { AskEmailModal } from './modals/ask-email-modal/ask-email.modal';
import { PhotoviewerModal } from './modals/photoviewer/photoviewer.component';
import { HappeningNowModal } from './modals/happening-now/happening-now.modal';
import { RoomFindModal } from './modals/interactive-map/room-find/room-find.modal';
import { RoomDetailModal } from './modals/interactive-map/room-detail/room-detail.modal';
import { InteractiviteListModal } from './modals/interactivite-list/interactivite-list.modal';
import { RoomWhereAmIModal } from './modals/interactive-map/room-where-am-i/room-where-am-i.modal';

// Components
import { MapComponent } from './components/map/map.component';
import { RatingComponent } from './components/rating/rating.component';
import { BlockSVGComponent } from './components/blocks-svg/blocks-svg.component';
import { BlockSVG1Component } from './components/blocks-svg/blocks-svg.component';
import { BlockSVG2Component } from './components/blocks-svg/blocks-svg.component';
import { BlockSVG3Component } from './components/blocks-svg/blocks-svg.component';
import { ExhibitorsComponent } from './components/exhibitors/exhibitors.component';
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { SessionTabsComponent } from './components/session-tabs/session-tabs.component';
import { SmallButtonComponent } from './components/small-button/small-button.component';
import { CardCongressComponent } from './components/card-congress/card-congress.component';
import { ReturnHeaderComponent } from './components/return-header/return-header.component';
import { ItemSkeletonComponent } from './components/item-skeleton/item-skeleton.component';
import { TextInfoHTMLComponent } from './components/text-info-html/text-info-html.component';
import { SliderSponsorComponent } from './components/slider-sponsor/slider-sponsor.component';
import { ContactDetailComponent } from './components/contact-detail/contact-detail.component';
import { VerticalButtonComponent } from './components/vertical-button/vertical-button.component';
import { AvatarInitialsComponent } from './components/avatar-initials/avatar-initials.component';
import { RichTextEditorComponent } from './components/rich-text-editor/rich-text-editor.component';
import { HorizontalButtonComponent } from './components/horizontal-button/horizontal-button.component';
import { AddToMyCalendarComponent } from './components/add-to-my-calendar/add-to-my-calendar.component';
import { SessionItemStyleComponent } from './components/session-item/session-item-style/session-item-style.component';
import { SessionItemScheduleComponent } from './components/session-item/session-item-schedule/session-item-schedule.component';
import { SessionItemInterventionComponent } from './components/session-item/session-item-intervention/session-item-intervention.component';
import { SubCongressesSessionTabsComponent } from './components/sub-congresses-session-tabs/sub-congresses-session-tabs.component';

const MODULES = [IonicModule, FormsModule, CommonModule, RouterModule, TranslateModule, ReactiveFormsModule, SwiperModule, QRCodeModule, QuillModule.forRoot()];

const ANGULAR_PIPES = [NgStripTagsPipeModule, NgUniqPipeModule, NgAbsPipeModule];

const PIPES = [TruncatePipe, SortPipe, TimePipe, DateToSincePipe];

const COMPONENTS = [
  MapComponent,
  RatingComponent,
  BlockSVGComponent,
  BlockSVG1Component,
  BlockSVG2Component,
  BlockSVG3Component,
  ExhibitorsComponent,
  MainHeaderComponent,
  SessionTabsComponent,
  SmallButtonComponent,
  CardCongressComponent,
  ReturnHeaderComponent,
  ItemSkeletonComponent,
  TextInfoHTMLComponent,
  ContactDetailComponent,
  SliderSponsorComponent,
  RichTextEditorComponent,
  VerticalButtonComponent,
  AvatarInitialsComponent,
  AddToMyCalendarComponent,
  HorizontalButtonComponent,
  SessionItemStyleComponent,
  SessionItemScheduleComponent,
  SessionItemInterventionComponent,
  SubCongressesSessionTabsComponent,
];

const DIRECTIVES: any[] = [AutofillDirective];

const MODALS = [
  PlanModal,
  QrcodeModal,
  FiltersModal,
  AddNoteModal,
  RoomFindModal,
  AskEmailModal,
  RoomDetailModal,
  PhotoviewerModal,
  RoomWhereAmIModal,
  HappeningNowModal,
  InteractiviteListModal,
];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES, ...MODALS, ...PIPES],
  providers: [...PIPES, DatePipe],
  imports: [...MODULES, NgStripTagsPipeModule],
  exports: [...MODULES, ...COMPONENTS, ...DIRECTIVES, ...MODALS, ...ANGULAR_PIPES, ...PIPES],
})
export class SharedModule {}
