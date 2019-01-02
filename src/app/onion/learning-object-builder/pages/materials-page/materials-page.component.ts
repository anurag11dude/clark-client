import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { BuilderStore, BUILDER_ACTIONS } from '../../builder-store.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import { Url } from '@cyber4all/clark-entity/dist/learning-object';

@Component({
  selector: 'clark-materials-page',
  templateUrl: './materials-page.component.html',
  styleUrls: ['./materials-page.component.scss']
})
export class MaterialsPageComponent implements OnInit, OnDestroy {
  saving$: Subject<boolean> = new Subject<boolean>();
  error$: Subject<string> = new Subject<string>();
  learningObject$: Observable<LearningObject>;
  destroyed$: Subject<void> = new Subject();

  constructor(private store: BuilderStore) {}

  ngOnInit() {
    this.learningObject$ = this.store.learningObjectEvent.pipe(
      takeUntil(this.destroyed$)
    );
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  async handleFileDeletion(fileId: string) {
    // Refresh object or materials
    try {
      await this.store.execute(BUILDER_ACTIONS.DELETE_FILE, { fileId });
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleUploadComplete() {
    // Refresh object or materials
    try {
      await this.store.fetchMaterials();
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleUrlAdded() {
    try {
      await this.store.execute(BUILDER_ACTIONS.ADD_URL);
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleUrlUpdated(data: { index: number; url: Url }) {
    try {
      await this.store.execute(BUILDER_ACTIONS.UPDATE_URL, data);
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleUrlRemoved(index: number) {
    try {
      await this.store.execute(BUILDER_ACTIONS.REMOVE_URL, index);
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleFileDescriptionUpdate(fileMeta: {
    id: string;
    description: string;
  }) {
    try {
      await this.store.execute(
        BUILDER_ACTIONS.UPDATE_FILE_DESCRIPTION,
        fileMeta
      );
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleFolderDescriptionUpdate(folderMeta: {
    path?: string;
    index?: number;
    description: string;
  }) {
    try {
      await this.store.execute(
        BUILDER_ACTIONS.UPDATE_FOLDER_DESCRIPTION,
        folderMeta
      );
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleNotesUpdate(notes: string) {
    try {
      await this.store.execute(BUILDER_ACTIONS.UPDATE_MATERIAL_NOTES, notes);
    } catch (e) {
      this.error$.next(e);
    }
  }
}