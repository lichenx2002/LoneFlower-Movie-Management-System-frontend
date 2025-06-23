import React from 'react';
// @ts-ignore
import styles from './index.module.css'

interface FilterGroupProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  label: string;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ options, value, onChange, label }) => (
  <div className={styles.group}>
    <div className={styles.label}>{label}：</div>
    <div className={styles.options}>
      {options.map(opt => (
        <button
          key={opt}
          className={`${styles.option} ${value === opt ? styles.selected : ''}`}
          onClick={() => onChange(opt)}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default FilterGroup; 