import { 
  collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { SavedAgendaItem } from '../types';

const AGENDAS_COLLECTION = 'agendas';

/**
 * Saves or updates a saved agenda item in Firestore.
 */
export async function saveAgendaToDb(item: SavedAgendaItem): Promise<void> {
  const path = `${AGENDAS_COLLECTION}/${item.id}`;
  try {
    const docRef = doc(db, AGENDAS_COLLECTION, item.id);
    
    // Check if the document already exists in Firestore to distinguish create vs update
    const docSnap = await getDoc(docRef);
    const exists = docSnap.exists();
    
    // Prepare data conforming strictly to firestore.rules and firebase-blueprint.json
    const payload: any = {
      id: item.id,
      userId: item.userId,
      templateId: item.templateId,
      agenda: {
        title: item.agenda.title || '',
        summary: item.agenda.summary || '',
        startTime: item.agenda.startTime || '09:00',
        stakeholders: item.agenda.stakeholders || [],
        items: item.agenda.items || [],
      },
      files: item.files || [],
      completedItemIds: item.completedItemIds || [],
      updatedAt: serverTimestamp(),
    };

    // Only set createdAt on first save (create). On update, omitting it preserves the existing value via merge.
    if (!exists) {
      payload.createdAt = serverTimestamp();
    }

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes an agenda document from Firestore.
 */
export async function deleteAgendaFromDb(id: string): Promise<void> {
  const path = `${AGENDAS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, AGENDAS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Loads all saved agendas for a specific authenticated user.
 */
export async function loadUserAgendas(userId: string): Promise<SavedAgendaItem[]> {
  try {
    const q = query(
      collection(db, AGENDAS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const list: SavedAgendaItem[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Convert Firestore Timestamp to JS Date
      let dateValue = new Date();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        dateValue = data.createdAt.toDate();
      } else if (data.timestamp) {
        dateValue = new Date(data.timestamp);
      }

      list.push({
        id: data.id,
        userId: data.userId,
        agenda: data.agenda,
        templateId: data.templateId,
        files: data.files || [],
        completedItemIds: data.completedItemIds || [],
        timestamp: dateValue,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    // Sort client-side to avoid compound index requirements in Firestore
    list.sort((a, b) => {
      const valA = a.createdAt && typeof a.createdAt.toMillis === 'function' 
        ? a.createdAt.toMillis() 
        : a.timestamp.getTime();
      const valB = b.createdAt && typeof b.createdAt.toMillis === 'function' 
        ? b.createdAt.toMillis() 
        : b.timestamp.getTime();
      return valB - valA; // Descending
    });
    
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, AGENDAS_COLLECTION);
  }
}
