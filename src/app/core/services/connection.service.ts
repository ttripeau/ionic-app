import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  public appIsOnline$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private interval: NodeJS.Timeout;

  constructor() {
    this.initConnectivityMonitoring();

    this.appIsOnline$.subscribe(async (state) => {
      if (this.interval) {
        clearInterval(this.interval);
      }
      if (!state) {
        try {
          this.interval = setInterval(async () => {
            try {
              const response = await CapacitorHttp.request({ url: 'https://ismyinternetworking.com/', method: 'HEAD' });
              if (response.status === 200) {
                this.appIsOnline$.next(true);
                clearInterval(this.interval);
              } else {
                this.appIsOnline$.next(false);
              }
            } catch (error) {
              console.log('error: ', error);
              this.appIsOnline$.next(false);
            }
          }, 3000);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  private async initConnectivityMonitoring() {
    const s = await Network.getStatus();
    this.appIsOnline$.next(s.connected);

    Network.addListener('networkStatusChange', (status) => {
      setTimeout(async () => {
        if (!status.connected) {
          this.appIsOnline$.next(false);
          // try {
          //   const response: { status: number } = await CapacitorHttp.request({ url: 'https://ismyinternetworking.com/', method: 'HEAD' });
          //   console.log('response.status: ', response.status);
          //   if (response.status === 200) {
          //     this.appIsOnline$.next(true);
          //   } else {
          //     this.appIsOnline$.next(false);
          //   }
          // } catch(error) {
          //   console.log('error: ', error);
          //   this.appIsOnline$.next(false);
          // }
        } else {
          this.appIsOnline$.next(true);
        }
      }, 2000);
    });
  }
}
