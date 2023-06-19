import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 } from "uuid";

/**
 * Сохранение вложенных файлов в storage firebase
 * @param {FileList} files объект-псевдомассив файлов
 * @returns {Promise<{id: string, name: string, url: string}[]>} массив объектов, хранящих id, имя и url добавленных файлов
 */
export const saveFilesToStorage = (files) => {
  const storeFile = (file) => {
    return new Promise((resolve, reject) => {
      const id = v4();
      const storage = getStorage();
      const storageRef = ref(storage, `files/${id}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            resolve({ id, name: file.name, url });
          });
        }
      );
    });
  };

  return Promise.all([...files].map((file) => storeFile(file)));
};

/**
 * Удаление вложенных файлов из storage firebase
 * @param {string[]} urls массив с url удаляемых файлов
 * @returns {Promise<void[]>}
 */
export const deleteFilesFromStorage = (urls) => {
  const deleteFile = (fileUrl) => {
    const storage = getStorage();
    const httpsReference = ref(storage, fileUrl);
    return deleteObject(httpsReference);
  };

  return Promise.all(urls.map((fileUrl) => deleteFile(fileUrl)));
};
