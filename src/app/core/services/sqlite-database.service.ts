import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { environment } from 'src/environments/environment';
import { createSchema, deleteSchema } from '../utils/sqlite.utils';
import { SQLiteService } from './sqlite.service';

@Injectable({
  providedIn: 'root',
})
export class SqliteDatabaseService {
  private mDb!: SQLiteDBConnection;

  constructor(private sqlite: SQLiteService) {}

  async initDatabase(): Promise<void> {
    try {
      this.mDb = await this.sqlite.openDatabase(environment.databaseName, false, 'no-encryption', 1, false);
      await this.mDb.execute(createSchema, true);
    } catch (err) {
      console.log('err: ', err);
    }
  }
  async set(name: string, data: any) {
    if (!data || JSON.stringify(data) === '[]' || JSON.stringify(data) === '{}') {
      return;
    }
    const dataFormated = encodeURIComponent(JSON.stringify(data));

    await this.mDb.execute(`DELETE FROM ${name} WHERE 1;`, true);
    const size = 1000000;
    const numberOfChunks = Math.ceil(dataFormated.length / size);
    for (let i = 1; i <= numberOfChunks; i++) {

      await this.mDb.execute(`INSERT INTO ${name} VALUES (${i}, "${dataFormated.substring((i - 1) * size, i * size)}");`, true);
    }
  }

  async get(name: string) {
    let data;
    try {
      data = await this.mDb.query(`SELECT * FROM ${name};`);
    } catch (error) {
      data = { values: [] };
    }

    const values = data.values;
    if (values && values.length > 0) {
      let res = '';
      for (const value of values) {
        res += value.data;
      }
      return JSON.parse(decodeURIComponent(res));
    }

    return undefined;
  }

  async clear() {
    try {
      await this.mDb.run(deleteSchema);
    } catch (err) {
      console.log('err: ', err);
    }
  }
}
