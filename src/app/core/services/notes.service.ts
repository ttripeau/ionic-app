import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { AppConfig, DataConfig } from '../models/config.interface';
import { Note } from '../models/note.interface';
import { StrapiStateInterface } from '../store/reducers/strapi.reducer';

export interface Notes {
  abstracts: Note[];
  sessions: Note[];
  exhibitors: Note[];
}

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  public isDeleteModeEnabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private deviceId: string = 'test-browser';
  private appConfig: AppConfig;
  private dataConfig: DataConfig;

  constructor(private storage: Storage, private store: Store<{ strapi: StrapiStateInterface }>) {
    this.getIdDevice();

    this.store.select('strapi').subscribe((strapi) => {
      this.appConfig = strapi.config.appConfig;
      this.dataConfig = strapi.config.dataConfig;
    });
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

  /**
   * Calls a function in the backend to export all the user's notes by email
   */
  public async exportNotesByEmail(email: string): Promise<HttpResponse> {
    const URL = `${this.appConfig.notesExportSendMailUrl}&email=${email}&id=${this.deviceId}&lang=${this.dataConfig.language}`;
    return CapacitorHttp.get({ url: URL });
  }

  /**
   * Returns a note based on its storageId
   */
  public async getNote(id: string, type: 'sessions' | 'abstracts' | 'exhibitors'): Promise<Note | null> {
    const noteFromStorage: Note | null = await this.getNoteFromStorage(id, type);

    const lastUpdatedNoteOrigin: 'FIREBASE' | 'STORAGE' | 'SAME' | null = this.getLastUpdatedNote(null, noteFromStorage);

    return lastUpdatedNoteOrigin === 'FIREBASE' ? null : noteFromStorage;
  }

  /**
   * Returns every last notes based on both origins
   */
  public async getNotes(): Promise<Notes> {
    const notesFromStorage: Notes = await this.getNotesFromStorage();

    return await this.getLastUpdatedNotes({ abstracts: [], sessions: [], exhibitors: [] }, notesFromStorage);
  }

  /**
   * Create or Update a note
   */
  public async addOrEditNote(note: Note, type: 'sessions' | 'abstracts' | 'exhibitors'): Promise<void> {
    console.log('type: ', type);
    try {
      note.updatedAt = new Date().getTime();
      await this.addOrEditNoteToStorage(note);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Delete a note
   */
  public async deleteNote(note: Note, type: 'sessions' | 'abstracts' | 'exhibitors'): Promise<void> {
    console.log('type: ', type);
    try {
      await this.deleteNoteInStorage(note);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Delete all notes from Storage
   */
  public async clearNotesInStorage(): Promise<void> {
    // await this.storage.remove();
  }

  /**
   * Fetch a specific note from Storage
   */
  private async getNoteFromStorage(id: string, type: 'sessions' | 'abstracts' | 'exhibitors'): Promise<Note | null> {
    return this.storage.get(`notes_${type}_${id}`);
  }

  /**
   * Fetch every notes from Storage
   */
  private async getNotesFromStorage(): Promise<Notes> {
    const notes: Notes = { abstracts: [], sessions: [], exhibitors: [] };

    await this.storage.forEach((value, key) => {
      if (key.startsWith('notes_sessions_')) {
        notes.sessions.push(value);
      }
      if (key.startsWith('notes_abstracts_')) {
        notes.abstracts.push(value);
      }
      if (key.startsWith('notes_exhibitors_')) {
        notes.exhibitors.push(value);
      }
    });

    return notes;
  }

  /**
   * Create or edit a note in Storage
   */
  private async addOrEditNoteToStorage(note: Note): Promise<void> {
    await this.storage.set(note.storageKey, note);
  }

  /**
   * Delete a note from Storage
   */
  private async deleteNoteInStorage(note: Note): Promise<void> {
    await this.storage.remove(note.storageKey);
  }

  /**
   * Compares two notes and returns the last one that has been updated
   */
  private getLastUpdatedNote(firebaseNote: Note | null, storageNote: Note | null): 'FIREBASE' | 'STORAGE' | 'SAME' | null {
    if (firebaseNote === null && storageNote === null) {
      return null;
    } else if (firebaseNote === null && storageNote !== null) {
      return 'STORAGE';
    } else if (firebaseNote !== null && storageNote === null) {
      return 'FIREBASE';
    } else if (firebaseNote !== null && storageNote !== null && firebaseNote.updatedAt > storageNote.updatedAt) {
      return 'FIREBASE';
    } else if (firebaseNote !== null && storageNote !== null && firebaseNote.updatedAt < storageNote.updatedAt) {
      return 'STORAGE';
    } else {
      return 'SAME';
    }
  }

  /**
   * Check and prepare notes from Sessions, Abstracts and Exhibitors
   */
  private async getLastUpdatedNotes(firebaseNotes: Notes, storageNotes: Notes): Promise<Notes> {
    const notes: Notes = { abstracts: [], sessions: [], exhibitors: [] };

    const sessionsNotes = await this.synchronizeNotes(firebaseNotes.sessions, storageNotes.sessions);
    const abstractsNotes = await this.synchronizeNotes(firebaseNotes.abstracts, storageNotes.abstracts);
    const exhibitorsNotes = await this.synchronizeNotes(firebaseNotes.exhibitors, storageNotes.exhibitors);

    notes.sessions = sessionsNotes;
    notes.abstracts = abstractsNotes;
    notes.exhibitors = exhibitorsNotes;

    return notes;
  }

  /**
   * Compare both notes origins and return a unique array with the last updated notes
   */
  private synchronizeNotes(originOne: Note[], originTwo: Note[]): Promise<Note[]> {
    return new Promise((resolve) => {
      const notes: Note[] = [];

      for (const note of originOne) {
        const storageNote: Note | undefined = originTwo.find((n) => n.storageKey === note.storageKey);

        if (storageNote) {
          const lastUpdatedNoteOrigin: 'FIREBASE' | 'STORAGE' | 'SAME' | null = this.getLastUpdatedNote(storageNote, note);

          if (lastUpdatedNoteOrigin === 'STORAGE') {
            notes.push(storageNote);
          } else if (lastUpdatedNoteOrigin === 'FIREBASE') {
            this.addOrEditNoteToStorage(note);
            notes.push(note);
          } else {
            notes.push(note);
          }
        } else {
          notes.push(note);
          this.addOrEditNoteToStorage(note);
        }
      }

      for (const note of originTwo) {
        const noteAlreadyAdded: Note | undefined = notes.find((n) => n.storageKey === note.storageKey);

        if (noteAlreadyAdded === undefined) {
          const firebaseNote: Note | undefined = originOne.find((n) => n.storageKey === note.storageKey);

          if (firebaseNote) {
            const lastUpdatedNoteOrigin: 'FIREBASE' | 'STORAGE' | 'SAME' | null = this.getLastUpdatedNote(firebaseNote, note);

            if (lastUpdatedNoteOrigin === 'STORAGE') {
              notes.push(note);
            } else if (lastUpdatedNoteOrigin === 'FIREBASE') {
              this.addOrEditNoteToStorage(firebaseNote);
              notes.push(firebaseNote);
            } else {
              notes.push(note);
            }
          } else {
            notes.push(note);
          }
        }
      }

      resolve(notes);
    });
  }
}
