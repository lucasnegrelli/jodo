
import styles from "@/styles/ui.module.css";

export default async function LoadingTransition() {
  return (
    <div>
        <div className={styles.loader}></div> 
    </div>
  );
}