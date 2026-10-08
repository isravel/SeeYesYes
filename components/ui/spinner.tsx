import styles from './Spinner.module.css';
export function Spinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  return <span className={styles.root} data-size={size} aria-hidden="true" />;
}
