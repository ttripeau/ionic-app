import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { Storage } from '@ionic/storage-angular';
import { Session } from '../models/session.interface';

export interface RateBySession {
  date: number;
  idSession: string | number;
  dateLisible: string;
  note: string;
  pathNode: string;
  reference: string;
  remoteid: string;
  type: string;
  user: string;
  device: string;
}

@Injectable({
  providedIn: 'root',
})
export class RateService {
  private storageRates: RateBySession[] = [];
  private deviceId = 'test-browser';

  constructor(private storage: Storage) {
    this.getIdDevice();
  }

  public async getIdDevice(): Promise<void> {
    try {
      const { uuid } = await Device.getId();
      this.deviceId = uuid;
    } catch (error) {
      console.log(error);
      this.deviceId = 'test-browser';
    }
  }

  public async init() {
    await this.syncRateSessions();
  }

  public async syncRateSessions() {
    // get rates from databases
    const localRates: RateBySession[] = (await this.storage.get('rated_sessions')) ?? [];
    const onlineRates: RateBySession[] = [];

    const syncRatedSessions: RateBySession[] = [...onlineRates];
    for (const localRate of localRates) {
      let foundRate = syncRatedSessions.find((v) => parseInt(`${v.idSession}`, 10) === parseInt(`${localRate.idSession}`, 10));
      if (!foundRate) {
        syncRatedSessions.push(localRate);
      } else {
        if (localRate.date > foundRate.date) {
          foundRate = localRate;
        }
      }
    }

    this.storageRates = syncRatedSessions;
    await this.storage.set('rated_sessions', syncRatedSessions);
  }

  public async getRateSession(sessionId: number): Promise<any | null> {
    if (sessionId === null || sessionId === undefined) {
      return null;
    }

    return this.storageRates.find((rate) => parseInt(`${rate.idSession}`, 10) === parseInt(`${sessionId}`, 10))?.note ?? 0;
  }

  public async setRateSession(session: Session | { idSession: number | string }, rating: number | string): Promise<void | null> {
    this.updateRateSessionStorage(session, rating);
  }

  private buildRate(session: Session | { idSession: number | string }, rating: number | string): RateBySession | null {
    if (session === null || session === undefined) {
      return null;
    }

    return {
      date: new Date().getTime(),
      dateLisible: new Date().toISOString(),
      idSession: parseInt(`${session.idSession}`, 10),
      note: `${rating}`,
      pathNode: '',
      reference: 'undefined',
      remoteid: 'undefined',
      device: this.deviceId ?? 'undefined',
      type: 'app',
      user: `undefined`,
    };
  }

  private async updateRateSessionStorage(session: Session | { idSession: number | string }, rating: number | string): Promise<void | null> {
    if (session === null || session === undefined) {
      return null;
    }

    const rate = this.buildRate(session, rating);
    if (rate) {
      this.storageRates = this.storageRates.filter((r) => r.idSession !== rate.idSession);
      this.storageRates.push(rate);
      this.storage.set('rated_sessions', this.storageRates);
    }
  }
}
