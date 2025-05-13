import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, CollectionReference, Timestamp } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Media } from '../core/interfaces/media';


@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private collectionPath = 'media';
  private mediaCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.mediaCollection = collection(this.firestore, this.collectionPath) as CollectionReference;
  }

  addMedia(description: string, imageUrl: string): Promise<void> {
    const newRecord: Omit<Media, 'id'> = {
      description,
      imageUrl,
      createdAt: new Date(),
    };
    return addDoc(this.mediaCollection, newRecord).then(() => {});
  }

  getMediaRecords(): Observable<Media[]> {
    return collectionData(this.mediaCollection, { idField: 'id' }) as Observable<Media[]>;
  }

    getMediaList(): Observable<Media[]> {
    return collectionData(this.mediaCollection, { idField: 'id' }).pipe(
      map((mediaArray: any[]) => mediaArray.map(media => ({
        ...media as Media,
        createdAt: (media.createdAt as Timestamp).toDate()
      })))
    );
  }



}