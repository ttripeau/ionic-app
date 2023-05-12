import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddNoteModal } from './add-note.modal';

describe('AddNoteComponent', () => {
  let component: AddNoteModal;
  let fixture: ComponentFixture<AddNoteModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddNoteModal],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddNoteModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
