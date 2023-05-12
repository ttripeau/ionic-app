import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AskEmailModal } from './ask-email.modal';

describe('AskEmailModal', () => {
  let component: AskEmailModal;
  let fixture: ComponentFixture<AskEmailModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AskEmailModal],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AskEmailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
