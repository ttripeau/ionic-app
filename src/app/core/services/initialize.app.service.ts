import { Injectable } from '@angular/core';

import { SQLiteService } from './sqlite.service';
import { SqliteDatabaseService } from './sqlite-database.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class InitializeAppService {
  isAppInit: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  platform!: string;

  constructor(private sqliteService: SQLiteService, private sqliteDatabaseService: SqliteDatabaseService) {}

  async initializeApp() {
    try {
      await this.sqliteService.initializePlugin();
      this.platform = this.sqliteService.platform;

      if (this.sqliteService.platform === 'web') {
        await this.sqliteService.initWebStore();
      }
      await this.sqliteDatabaseService.initDatabase();

      this.isAppInit.next(true);
    } catch (error) {
      console.log(`initializeAppError: ${error}`);
    }
  }

  async waitAppInit(): Promise<boolean> {
    return new Promise((resolve) => {
      this.isAppInit.subscribe((init) => {
        if (init) {
          resolve(init);
        }
      });
    });
  }
}
