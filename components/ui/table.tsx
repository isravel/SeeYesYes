import type { ReactNode, Ref } from 'react';
import styles from './Table.module.css';
export type TableColumn = { id: string; label: string; rowHeader?: boolean };
export type TableRow = { id: string; cells: Record<string, ReactNode> };
export type TableProps = { caption: string; columns: TableColumn[]; rows: TableRow[]; emptyMessage?: string; className?: string; ref?: Ref<HTMLTableElement> };
export function Table({ caption, columns, rows, emptyMessage = 'No rows to show.', className = '', ref }: TableProps) {
  return <div className={styles.scroll} role="region" tabIndex={0} aria-label={`${caption} table`}>
    <table ref={ref} className={`${styles.root} ${className}`}>
      <caption>{caption}</caption>
      <thead><tr>{columns.map(column => <th key={column.id} scope="col">{column.label}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map(row => <tr key={row.id}>{columns.map(column => column.rowHeader
        ? <th key={column.id} scope="row">{row.cells[column.id]}</th>
        : <td key={column.id}>{row.cells[column.id]}</td>)}</tr>) : <tr><td colSpan={Math.max(1, columns.length)} className={styles.empty}>{emptyMessage}</td></tr>}</tbody>
    </table>
  </div>;
}
