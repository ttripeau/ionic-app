import { AppComponent } from 'src/app/app.component';

export interface Link {
  label: string;
  routerLink?: string;
  click?: { method: keyof AppComponent; params: any[] };
  icon: { name?: string; src?: string };
}
