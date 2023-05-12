export interface Note {
  storageKey: string;
  refId: string;
  refTitle: string;
  idDate?: number | string;
  value: string;
  html: string | null;
  isChecked?: boolean;
  updatedAt: number;
}
