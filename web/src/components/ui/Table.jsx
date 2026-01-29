// src/components/ui/Table.jsx
import './Table.css';

const Table = ({
  children,
  className = '',
  variant = 'default',
  striped = false,
  hoverable = true,
  bordered = false,
  ...props
}) => {
  const variantClass = `modern-table--${variant}`;
  const stripedClass = striped ? 'modern-table--striped' : '';
  const hoverableClass = hoverable ? 'modern-table--hoverable' : '';
  const borderedClass = bordered ? 'modern-table--bordered' : '';

  return (
    <div className="modern-table-wrapper">
      <table
        className={`modern-table ${variantClass} ${stripedClass} ${hoverableClass} ${borderedClass} ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

// Table Head Component
export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <thead className={`modern-table__head ${className}`} {...props}>
      {children}
    </thead>
  );
};

// Table Body Component
export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`modern-table__body ${className}`} {...props}>
      {children}
    </tbody>
  );
};

// Table Row Component
export const TableRow = ({ children, className = '', onClick, ...props }) => {
  const clickableClass = onClick ? 'modern-table__row--clickable' : '';

  return (
    <tr
      className={`modern-table__row ${clickableClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
};

// Table Header Cell Component
export const TableHeader = ({
  children,
  className = '',
  sortable = false,
  sorted,
  onSort,
  align = 'left',
  ...props
}) => {
  const sortableClass = sortable ? 'modern-table__header--sortable' : '';
  const sortedClass = sorted ? `modern-table__header--sorted-${sorted}` : '';
  const alignClass = `modern-table__header--align-${align}`;

  return (
    <th
      className={`modern-table__header ${sortableClass} ${sortedClass} ${alignClass} ${className}`}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="modern-table__header-content">
        <span>{children}</span>
        {sortable && (
          <span className="modern-table__sort-icon">
            {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </div>
    </th>
  );
};

// Table Cell Component
export const TableCell = ({
  children,
  className = '',
  align = 'left',
  ...props
}) => {
  const alignClass = `modern-table__cell--align-${align}`;

  return (
    <td className={`modern-table__cell ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  );
};

// Empty State Component for Tables
export const TableEmptyState = ({ message = "Aucune donnée disponible", icon: Icon }) => {
  return (
    <TableRow>
      <TableCell colSpan="100" className="modern-table__empty-state">
        {Icon && (
          <div className="modern-table__empty-icon">
            <Icon />
          </div>
        )}
        <p className="modern-table__empty-message">{message}</p>
      </TableCell>
    </TableRow>
  );
};

// Loading State Component for Tables
export const TableLoadingState = ({ columns = 5, rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="modern-table__skeleton" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

// Table Actions Component (for action buttons in table rows)
export const TableActions = ({ children, className = '' }) => {
  return (
    <div className={`modern-table__actions ${className}`}>
      {children}
    </div>
  );
};

// Table Badge Component (for status indicators)
export const TableBadge = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const variantClass = `modern-table__badge--${variant}`;

  return (
    <span className={`modern-table__badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
};

export default Table;
