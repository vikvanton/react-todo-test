import styles from "./spinner.module.css";

/**
 * Компонент спиннер
 */
function Spinner() {
  return (
    <div className={styles.loadingSpinnerContainer}>
      <div className={styles.loadingSpinner}></div>
    </div>
  );
}

export default Spinner;
