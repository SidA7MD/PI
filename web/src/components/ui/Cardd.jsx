// src/components/ui/Card.jsx
import './Card.css';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  padding = 'default',
  onClick,
  ...props
}) => {
  const baseClass = 'modern-card';
  const variantClass = `modern-card--${variant}`;
  const hoverClass = hover ? 'modern-card--hover' : '';
  const paddingClass = `modern-card--padding-${padding}`;
  const clickableClass = onClick ? 'modern-card--clickable' : '';

  return (
    <div
      className={`${baseClass} ${variantClass} ${hoverClass} ${paddingClass} ${clickableClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`modern-card__header ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Title Component
export const CardTitle = ({ children, className = '', size = 'default', ...props }) => {
  return (
    <h3 className={`modern-card__title modern-card__title--${size} ${className}`} {...props}>
      {children}
    </h3>
  );
};

// Card Description Component
export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`modern-card__description ${className}`} {...props}>
      {children}
    </p>
  );
};

// Card Content Component
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`modern-card__content ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`modern-card__footer ${className}`} {...props}>
      {children}
    </div>
  );
};

// Stats Card Component (for dashboard statistics)
export const StatsCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'primary',
  onClick
}) => {
  const colors = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  };

  return (
    <Card
      className="stats-card"
      variant="elevated"
      hover={!!onClick}
      onClick={onClick}
    >
      <div className="stats-card__layout">
        <div
          className="stats-card__icon"
          style={{ background: colors[color] }}
        >
          {Icon && <Icon />}
        </div>
        <div className="stats-card__content">
          <p className="stats-card__title">{title}</p>
          <p className="stats-card__value">{value}</p>
          {(subtitle || trend) && (
            <div className="stats-card__footer">
              {subtitle && <span className="stats-card__subtitle">{subtitle}</span>}
              {trend && (
                <span className={`stats-card__trend stats-card__trend--${trend}`}>
                  {trend === 'up' ? '↑' : '↓'} {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Action Card Component (for quick actions)
export const ActionCard = ({ icon: Icon, title, description, onClick }) => {
  return (
    <Card
      className="action-card"
      variant="interactive"
      hover
      onClick={onClick}
    >
      <div className="action-card__icon">
        {Icon && <Icon />}
      </div>
      <div className="action-card__content">
        <h4 className="action-card__title">{title}</h4>
        {description && <p className="action-card__description">{description}</p>}
      </div>
    </Card>
  );
};

export default Card;
