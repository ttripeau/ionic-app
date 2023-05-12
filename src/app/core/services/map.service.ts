import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public polygonId: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
  public polygonName: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  public view: BehaviorSubject<'PLAN' | 'LIST'> = new BehaviorSubject<'PLAN' | 'LIST'>('LIST');
}
