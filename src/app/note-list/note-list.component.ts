import { Component } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { NoteListService } from '../firebase-services/note-list.service'

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent {
  noteList: Note[] = [];
  favFilter: "all" | "fav" = "all";
  status: "notes" | "trash" = "notes";

  constructor(private noteService: NoteListService) {

  }

  getList(): Note[] {
    let notesToDisplay: Note[] = [];

    if (this.status === "trash") {
      notesToDisplay = this.noteService.trashNotes;
    } else {
      const allNotes = this.noteService.normalNotes;

      if (this.favFilter === "all") {
        notesToDisplay = allNotes;
      } else if (this.favFilter === "fav") {
        // Nur die Notizen mit marked === true filtern
        notesToDisplay = allNotes.filter(note => note.marked === true);
      }
    }
    return notesToDisplay;
  }


  changeFavFilter(filter:"all" | "fav"){
    this.favFilter = filter;
  }

  changeTrashStatus(){
    if(this.status == "trash"){
      this.status = "notes";
    } else {
      this.status = "trash";
      this.favFilter = "all";
    }
    this.getList();
  }


}
