export interface VerticalButton {
  className: string;
  title: string;
  text: string;
  click?: { method: string; params: any[] };
  icon: { name?: string; src?: string };
}
