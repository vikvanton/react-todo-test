import { useState, memo } from "react";
import dayjs from "dayjs";
import styles from "./task-item.module.css";

/**
 * Компонент задачи
 * @param {{
 *  task: {id: string, title: string, date: string, description: string, done: boolean, files: {id: string, name: string, url: string}[], timestamp: FieldValue},
 *  delTask: (taskId: string, filesUrls: string[]) => Promise<undefined>,
 *  editTask: (taskId: string, taskData: {title: string, date: string, description: string, files: {id: string, name: string, url: string}[], newFiles: FileList | null, delFiles: string[]}) => Promise<undefined>,
 *  updateTask: (taskId: string, taskData: {title: string, date: string, description: string, files: {id: string, name: string, url: string}[] | undefined} | {done: boolean}) => Promise<undefined>,
 * }} param0
 */
function TaskItem({ task, delTask, editTask, updateTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const isExpired = !task.done && dayjs().isAfter(dayjs(task.date), "date");

  /**
   * Обработчик кнопки "Изменить" и "Отменить".
   * Включает/отключает режим редактирования задачи
   */
  function handleEdit() {
    if (!isEditing)
      setEditingValue({
        title: task.title,
        date: task.date,
        description: task.description,
        files: task.files,
        newFiles: null,
        delFiles: [],
      });
    else setEditingValue(null);
    setIsEditing(!isEditing);
  }

  /**
   * Обработчик кнопки "Сохранить" - редактирование полей задачи
   */
  function handleSave() {
    editTask(task.id, editingValue)
      .then(() => {
        setIsEditing(!isEditing);
        setEditingValue(null);
      })
      .catch(() => alert("Ошибка при изменении задачи"));
  }

  /**
   * Обработчик кнопки "Удалить" - удаление задачи
   */
  function handleDel() {
    delTask(
      task.id,
      task.files.map((file) => file.url)
    ).catch((e) => {
      alert("Ошибка при удалении задачи");
      console.log(e);
    });
  }

  /**
   * Обработчик checkbox изменения статуса задачи - выполненена или нет
   */
  function handleCheck() {
    updateTask(task.id, { done: !task.done }).catch(() =>
      alert("Ошибка при изменении статуса задачи")
    );
  }

  /**
   * Обработчик изменения редактируемого поля
   * @param {Event} e
   */
  function handleChange(e) {
    setEditingValue({
      ...editingValue,
      [e.target.id]: e.target.id === "newFiles" ? e.target.files : e.target.value,
    });
  }

  /**
   * Обрабтчик нажатия иконки удаления вложенного файла при редактировании задачи
   * @param {Event} e
   */
  function onDelFileClick(e) {
    setEditingValue({
      ...editingValue,
      files: editingValue.files.filter((file) => file.url !== e.target.id),
      delFiles: [...editingValue.delFiles, e.target.id],
    });
  }

  return (
    <li className={styles.item}>
      {isEditing ? (
        <>
          <div>
            <input id="title" type="text" onChange={handleChange} value={editingValue.title} />
            <input id="date" type="date" onChange={handleChange} value={editingValue.date} />
            <textarea
              id="description"
              onChange={handleChange}
              value={editingValue.description}
              rows="5"
            />
            <input type="file" id="newFiles" onChange={handleChange} multiple />
            {editingValue.files?.length > 0 && (
              <div className={styles.filesContainer}>
                <h4 className={styles.filesTitle}>Удалить прикрепленные файлы:</h4>
                <ul className={styles.files}>
                  {editingValue.files?.map((file) => (
                    <li key={file.id}>
                      <span className={styles.fileContainer}>
                        <span>{file.name}</span>
                        <span className={styles.del} id={file.url} onClick={onDelFileClick}>
                          X
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className={styles.btnContainer}>
            <button className={styles.btn} type="button" onClick={handleEdit}>
              Отменить
            </button>
            <button className={styles.btn} type="button" onClick={handleSave}>
              Сохранить
            </button>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className={styles.titleContainer}>
              <h2>{task.title}</h2>
              {!isExpired && (
                <input
                  type="checkbox"
                  id={task.id}
                  defaultChecked={task.done}
                  onClick={handleCheck}
                />
              )}
            </div>
            <p
              className={`${
                isExpired
                  ? `${styles.date} ${styles.expired}`
                  : task.done
                  ? `${styles.date} ${styles.done}`
                  : `${styles.date}`
              }`}
            >
              Выполнить до: {dayjs(task.date).format("DD.MM.YYYY")}
            </p>
            <p className={styles.description}>{task.description}</p>
            {task.files.length > 0 && (
              <div className={styles.filesContainer}>
                <h4 className={styles.filesTitle}>Прикрепленные файлы:</h4>
                <ul className={styles.files}>
                  {task.files.map((file) => (
                    <li key={file.id}>
                      <a href={file.url} target="_blank" rel="noreferrer">
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className={styles.btnContainer}>
            {!task.done && (
              <button className={styles.btn} type="button" onClick={handleEdit}>
                Изменить
              </button>
            )}
            <button className={styles.btn} type="button" onClick={handleDel}>
              Удалить
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default memo(TaskItem);
