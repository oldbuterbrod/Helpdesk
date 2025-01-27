import { useEffect, useState } from "react";

export const useIndexedDB = (dbName, storeName, version) => {
  const [db, setDb] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const openDB = () => {
      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        const dbInstance = event.target.result;
        setDb(dbInstance);
        setDbReady(true); 
        console.log("База данных открыта успешно!");
      };

      request.onerror = (event) => {
        console.error("Ошибка открытия базы:", event.target.error);
        setDbReady(false);
      };
    };

    openDB();
  }, [dbName, storeName, version]);

  const addData = (data) =>
    new Promise((resolve, reject) => {
      if (!dbReady) {
        console.error("База данных не готова для добавления данных");
        return reject("База данных не готова");
      }

      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (error) => reject(error.target.error);
    });

  const getAllData = () =>
    new Promise((resolve, reject) => {
      if (!dbReady) {
        console.error("База данных не готова для получения данных");
        return reject("База данных не готова");
      }

      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (error) => reject(error.target.error);
    });

  const deleteData = (id) =>
    new Promise((resolve, reject) => {
      if (!dbReady) {
        console.error("База данных не готова для удаления данных");
        return reject("База данных не готова");
      }

      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (error) => reject(error.target.error);
    });

  const getDataById = async (id) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
    });
  };

  // Добавляем метод для обновления данных
  const updateData = (id, updatedData) =>
    new Promise((resolve, reject) => {
      if (!dbReady) {
        console.error("База данных не готова для обновления данных");
        return reject("База данных не готова");
      }

      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = (event) => {
        const data = event.target.result;
        if (!data) {
          return reject(`Данные с ID ${id} не найдены`);
        }

        const updatedRecord = { ...data, ...updatedData }; 
        const updateRequest = store.put(updatedRecord);

        updateRequest.onsuccess = () => resolve(updatedRecord);
        updateRequest.onerror = (error) => reject(error.target.error);
      };

      request.onerror = (error) => reject(error.target.error);
    });

  return { addData, getAllData, deleteData, getDataById, updateData, dbReady };
};
