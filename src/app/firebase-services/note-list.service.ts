import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc, limit, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Note } from '../interfaces/note.interface';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  unsubTrash;
  unsubNotes;

  firestore: Firestore = inject(Firestore);
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();
  }

  async addNote(note: Note, colId: "notes" | "trash") {
    if (colId == "notes") {
      await addDoc(this.getNotesRef(), note).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("Document written with ID: ", docRef?.id); }
      )
    } else {
      await addDoc(this.getTrashRef(), note).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("Document written with ID: ", docRef?.id); }
      )
    }
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleNoteRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.log(err) }
      ).then(
        () => { }
      );
    }
  }

  async deleteNote(colId: "notes" | "trash", docId: string) {
    await deleteDoc(this.getSingleNoteRef(colId, docId)).catch(
      (err) => { console.log(err) }
    )
  }

  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }

  ngonDestroy() {
    this.unsubTrash();
    this.unsubNotes();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
        console.log(this.trashNotes);
      });
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  subNotesList() {
    const q = query(this.getNotesRef(), orderBy("title"), limit(20));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed note: ", change.doc.data());
        }
      });
    });
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleNoteRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);

  }
}
