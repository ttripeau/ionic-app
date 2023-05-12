import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NotesService } from 'src/app/core/services/notes.service';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
  @Input() colorBtn: string = 'light';
  @Input() colorBg?: string = '';
  @Input() account: boolean = true;
  @Input() title: string = '';
  @Input() colorTitle: string = 'dark';
  @Input() positionAbsolute: boolean = true;
  @Input() noteDelete: boolean = false;

  public isDeleteModeEnabled: boolean = false;

  constructor(private notesService: NotesService, private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url !== '/app/tabs/notes') {
          this.notesService.isDeleteModeEnabled.next(false);
        }
      }
    });

    this.notesService.isDeleteModeEnabled.subscribe((state) => {
      if (!state) {
        this.isDeleteModeEnabled = false;
      }
    });
  }


  public toggleDeleteMode(): void {
    this.isDeleteModeEnabled = !this.notesService.isDeleteModeEnabled.value;
    this.notesService.isDeleteModeEnabled.next(!this.notesService.isDeleteModeEnabled.value);
  }
}
