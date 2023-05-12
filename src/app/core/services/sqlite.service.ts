import { Injectable } from '@angular/core';

import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
  CapacitorSQLitePlugin,
  capSQLiteUpgradeOptions,
} from '@capacitor-community/sqlite';

@Injectable()
export class SQLiteService {
  sqliteConnection!: SQLiteConnection;
  isService = false;
  platform!: string;
  sqlitePlugin!: CapacitorSQLitePlugin;
  native = false;

  /**
   * Plugin Initialization
   */
  async initializePlugin(): Promise<boolean> {
    this.platform = Capacitor.getPlatform();
    if (this.platform === 'ios' || this.platform === 'android') {
      this.native = true;
    }
    this.sqlitePlugin = CapacitorSQLite;
    this.sqliteConnection = new SQLiteConnection(this.sqlitePlugin);
    this.isService = true;
    return true;
  }

  async initWebStore(): Promise<void> {
    try {
      await this.sqliteConnection.initWebStore();
    } catch (err: any) {
      const msg = err.message ? err.message : err;
      console.log('msg: ', msg);
      return Promise.reject(`initWebStore: ${err}`);
    }
  }

  async openDatabase(dbName: string, encrypted: boolean, mode: string, version: number, readonly: boolean): Promise<SQLiteDBConnection> {
    let db: SQLiteDBConnection;
    const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
    const isConn = (await this.sqliteConnection.isConnection(dbName, readonly)).result;
    if (retCC && isConn) {
      db = await this.sqliteConnection.retrieveConnection(dbName, readonly);
    } else {
      db = await this.sqliteConnection.createConnection(dbName, encrypted, mode, version, readonly);
    }
    await db.open();
    return db;
  }
  async addUpgradeStatement(options: capSQLiteUpgradeOptions): Promise<void> {
    await this.sqlitePlugin.addUpgradeStatement(options);
    return;
  }

  async findOneBy(mDb: SQLiteDBConnection, table: string, where: any): Promise<any> {
    try {
      const key: string = Object.keys(where)[0];
      const stmt = `SELECT * FROM ${table} WHERE ${key}=${where[key]};`;
      const retValues = (await mDb.query(stmt)).values;
      const ret = retValues!.length > 0 ? retValues![0] : null;
      return ret;
    } catch (err: any) {
      const msg = err.message ? err.message : err;
      throw new Error(`findOneBy err: ${msg}`);
    }
  }
  async save(mDb: SQLiteDBConnection, table: string, mObj: any, where?: any): Promise<void> {
    const isUpdate: boolean = where ? true : false;
    const keys: string[] = Object.keys(mObj);
    let stmt = '';
    const values: any[] = [];
    for (const key of keys) {
      values.push(mObj[key]);
    }
    if (!isUpdate) {
      // INSERT
      const qMarks: string[] = [];
      for (const key of keys) {
        console.log('key: ', key);
        qMarks.push('?');
      }
      stmt = `INSERT INTO ${table} (${keys.toString()}) VALUES (${qMarks.toString()});`;
    } else {
      // UPDATE
      const wKey: string = Object.keys(where)[0];

      const setString: string = await this.setNameForUpdate(keys);
      if (setString.length === 0) {
        return Promise.reject(`save: update no SET`);
      }
      stmt = `UPDATE ${table} SET ${setString} WHERE ${wKey}=${where[wKey]}`;
    }
    const ret = await mDb.run(stmt, values);
    // eslint-disable-next-line eqeqeq
    if (ret.changes!.changes != 1) {
      return Promise.reject(`save: insert changes != 1`);
    }
    return;
  }
  async remove(mDb: SQLiteDBConnection, table: string, where: any): Promise<void> {
    const key: string = Object.keys(where)[0];
    const stmt = `DELETE FROM ${table} WHERE ${key}=${where[key]};`;
    const ret = await mDb.run(stmt);
    console.log('ret: ', ret);
    return;
  }
  /**
   * SetNameForUpdate
   *
   * @param names
   */
  private async setNameForUpdate(names: string[]): Promise<string> {
    let retString = '';
    for (const name of names) {
      retString += `${name} = ? ,`;
    }
    if (retString.length > 1) {
      retString = retString.slice(0, -1);
      return retString;
    } else {
      return Promise.reject('SetNameForUpdate: length = 0');
    }
  }
}
