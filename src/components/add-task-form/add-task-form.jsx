import { useState } from "react";
import styles from "./add-task-form.module.css";

/**
 * Компонет формы добавления задачи
 * @param {{
 *  onSubmit: (taskInfo: {title: string, date: string, description: string, files: FileList | null}) => Promise<undefined>,
 * }} param0
 */
function AddTaskForm({ onSubmit }) {
  const [formData, setFormData] = useState({ title: "", date: "", description: "", files: null });

  /**
   * Обработчик изменения полей формы
   * @param {Event} e
   */
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.id]: e.target.id === "files" ? e.target.files : e.target.value,
    });
  }

  /**
   * Обработчик submit формы
   * @param {Event} e
   */
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData)
      .then(() => setFormData({ title: "", date: "", description: "", files: null }))
      .catch(() => alert("Ошибка при сохранении задачи"));
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} encType="multipart/form-data">
      <fieldset>
        <legend className={styles.legend}>&nbsp;Создать новую задачу&nbsp;</legend>
        <label>
          <span>Заголовок</span>
          <input
            id="title"
            type="text"
            placeholder="Введите название задачи"
            onChange={handleChange}
            value={formData.title}
            required
          />
        </label>
        <label>
          <span>Дата завершения</span>
          <input id="date" type="date" onChange={handleChange} value={formData.date} required />
        </label>
        <label>
          <span>Описание</span>
          <textarea
            id="description"
            placeholder="Введите описание задачи"
            onChange={handleChange}
            value={formData.description}
            cols="30"
            rows="5"
          ></textarea>
        </label>
        <label>
          <span>Прикрепить файлы</span>
          <input type="file" id="files" onChange={handleChange} multiple />
        </label>
        <button className={styles.submit} type="submit">
          Создать
        </button>
      </fieldset>
    </form>
  );
}

export default AddTaskForm;
