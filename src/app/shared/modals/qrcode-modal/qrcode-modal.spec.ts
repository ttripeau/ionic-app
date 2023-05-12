import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QrcodeModal } from './qrcode-modal';

describe('QrcodeModalComponent', () => {
  let component: QrcodeModal;
  let fixture: ComponentFixture<QrcodeModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QrcodeModal],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(QrcodeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
