import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { saveFilesToStorage, deleteFilesFromStorage } from "../services/storage";

/**
 * Хук для использования firestore
 * Возвращает объект с полями:
 * tasks - список задач,
 * loading - статус загрузки,
 * addTask - ф-ция сохранения задачи в firestore,
 * delTask - ф-ция удаления задачи из firestore,
 * updateTask - ф-ция обновления задачи в firestore,
 * editTask - ф-ция редактирования задачи в firestore,
 */
function useFirestore() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Получение задач из firestore при первой загрузке приложения
   */
  useEffect(() => {
    const getTasks = async () => {
      try {
        setLoading(true);
        const collectionRef = collection(db, "tasks");
        const q = query(collectionRef, orderBy("timestamp", "desc"));
        const tasks = await getDocs(q);
        const tasksData = tasks.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setTasks(tasksData);
      } catch (err) {
        return Promise.reject(err);
      } finally {
        setLoading(false);
      }
    };
    getTasks();
  }, []);

  /**
   * Сохранение задачи в firestore
   * @param {{title: string, date: string, description: string, files: FileList | null}} taskInfo
   * @returns {Promise<undefined>}
   */
  const addTask = useCallback(async (taskInfo) => {
    try {
      setLoading(true);
      let filesData = [];

      if (taskInfo.files) {
        filesData = await saveFilesToStorage(taskInfo.files);
      }

      const newTask = {
        ...taskInfo,
        files: filesData,
        done: false,
        timestamp: serverTimestamp(),
      };

      const collectionRef = collection(db, "tasks");
      const docRef = await addDoc(collectionRef, newTask);

      setTasks((prevState) => [{ ...newTask, id: docRef.id }, ...prevState]);
    } catch (err) {
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Удаление задачи из firestore
   * @param {string} taskId
   * @param {string[]} filesUrls
   * @returns {Promise<undefined>}
   */
  const delTask = useCallback(async (taskId, filesUrls) => {
    if (window.confirm("Вы уверены, что хотите удалить задачу?")) {
      try {
        setLoading(true);
        if (filesUrls) {
          await deleteFilesFromStorage(filesUrls);
        }

        const docRef = doc(db, "tasks", taskId);
        await deleteDoc(docRef);

        setTasks((prevState) => prevState.filter((task) => task.id !== taskId));
      } catch (err) {
        return Promise.reject(err);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Обновление задачи в firestore
   * @param {string} taskId
   * @param {{title: string, date: string, description: string, files: {id: string, name: string, url: string}[] | undefined} | {done: boolean}} taskData
   * @returns {Promise<undefined>}
   */
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      setLoading(true);
      const docRef = doc(db, "tasks", taskId);
      await updateDoc(docRef, taskData);

      setTasks((prevState) =>
        prevState.map((task) => {
          if (task.id === taskId) {
            return { ...task, ...taskData };
          } else return task;
        })
      );
    } catch (err) {
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Редактирование задачи с добавлением новых файлов в storage и удалением уже сохраненных
   * @param {string} taskId
   * @param {{title: string, date: string, description: string, files: {id: string, name: string, url: string}[], newFiles: FileList | null, delFiles: string[]}} taskData
   * @returns {Promise<undefined>}
   */
  const editTask = useCallback(
    async (taskId, taskData) => {
      try {
        setLoading(true);
        const dataToDb = {
          title: taskData.title,
          date: taskData.date,
          description: taskData.description,
        };

        if (taskData.delFiles?.length > 0) {
          await deleteFilesFromStorage(taskData.delFiles);
          dataToDb.files = taskData.files;
        }

        if (taskData.newFiles) {
          const filesData = await saveFilesToStorage(taskData.newFiles);
          dataToDb.files = [...taskData.files, ...filesData];
        }

        await updateTask(taskId, dataToDb);
      } catch (err) {
        return Promise.reject(err);
      } finally {
        setLoading(false);
      }
    },
    [updateTask]
  );

  return {
    tasks,
    loading,
    addTask,
    delTask,
    updateTask,
    editTask,
  };
}

export default useFirestore;
