import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, docData, DocumentData, Firestore } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Media } from '../core/interfaces/media';


@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private pictureCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.pictureCollection = collection(this.firestore, 'media');
  }

  async save(picture: Omit<Media, 'id' | 'createdAt'>): Promise<void> {
    const data = {
      ...picture,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(this.pictureCollection, data);
      console.log('Documento agregado con ID:', docRef.id);
    } catch (error) {
      console.error('Error al agregar documento:', error);
      throw error;
    }
  }

  getAll(): Observable<Media[]> {
    const multimediaRef = collection(this.firestore, 'media');
    return collectionData(multimediaRef, { idField: 'id' }) as Observable<Media[]>;
  }

  getById(id: string): Observable<Media> {
    const docRef = doc(this.firestore, `media/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<Media>;
  }

  delete(id: string): Observable<void> {
    const docRef = doc(this.firestore, `media/${id}`);
    return from(deleteDoc(docRef));
  }
}