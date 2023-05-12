import { TabsPage } from 'src/app/pages/tabs-page/tabs-page';

export interface MenuTab {
  tabName?: string;
  label: string;
  click?: { method: keyof TabsPage; params: any[] };
  icon: { name?: string; src?: string };
  className?: string;
}
