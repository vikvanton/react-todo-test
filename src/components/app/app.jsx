import { useRef } from "react";
import AddTaskForm from "../add-task-form/add-task-form";
import TaskItem from "../task-item/task-item";
import Spinner from "../spinner/spinner";
import useFirestore from "../../hooks/use-firestore";
import styles from "./app.module.css";

function App() {
  const ref = useRef();
  const { tasks, loading, addTask, delTask, updateTask, editTask } = useFirestore();

  return (
    <>
      <header ref={ref}>
        <h1 className={styles.header}>Список задач</h1>
      </header>
      <main className={styles.main}>
        <AddTaskForm onSubmit={addTask} />
        <ul className={styles.tasklist}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              delTask={delTask}
              editTask={editTask}
              updateTask={updateTask}
            />
          ))}
        </ul>
        {tasks.length > 0 && (
          <button
            onClick={() => ref.current?.scrollIntoView({ behavior: "smooth" })}
            className={styles.topNubex}
          >
            Наверх
          </button>
        )}
      </main>
      {loading && <Spinner />}
    </>
  );
}

export default App;
