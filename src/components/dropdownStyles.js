const dropdownStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--accent-bg)',
    borderColor: state.isFocused ? 'var(--accent)' : 'var(--border)',
    borderWidth: '2px',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 2px var(--accent)' : 'none',
    '&:hover': {
      borderColor: 'var(--accent-border)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--accent-bg)',
    border: '2px solid var(--border)',
    borderRadius: '0.5rem',
    boxShadow: 'var(--shadow)',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--accent)'
      : state.isFocused
      ? 'var(--accent-border)'
      : 'transparent',
    color: 'var(--text-h)',
    cursor: 'pointer',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--text-h)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--text-2, #6b7280)',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--text-h)',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'var(--border)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--accent)',
    '&:hover': {
      color: 'var(--accent-border)',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'var(--accent)',
    '&:hover': {
      color: '#ef4444',
    },
  }),
};

export default dropdownStyles;