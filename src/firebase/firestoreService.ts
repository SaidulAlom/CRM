import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Company, Contact, Deal, Event, Task, Call, Case, AuditLogItem, User } from '../types';

export const firestoreService = {
  // Collection listeners with mandatory error handling
  subscribeToCollection<T>(
    collectionName: string,
    onData: (items: T[]) => void
  ): () => void {
    return onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({ ...docSnap.data() } as T));
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionName);
      }
    );
  },

  // Save single document (upsert)
  async saveDocument<T extends { id: string }>(
    collectionName: string,
    item: T
  ): Promise<void> {
    const docPath = `${collectionName}/${item.id}`;
    try {
      await setDoc(doc(db, collectionName, item.id), item, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Delete single document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    const docPath = `${collectionName}/${id}`;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Batch seed if remote is empty
  async seedCollectionIfEmpty<T extends { id: string }>(
    collectionName: string,
    initialItems: T[]
  ): Promise<void> {
    try {
      const snap = await getDocs(collection(db, collectionName));
      if (snap.empty && initialItems.length > 0) {
        const batch = writeBatch(db);
        initialItems.forEach((item) => {
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, collectionName);
    }
  },
};
