// // src/components/ui/Button.jsx
// import './Button.css';

// const Button = ({
//   children,
//   variant = 'primary',
//   size = 'default',
//   icon: Icon,
//   iconPosition = 'left',
//   loading = false,
//   disabled = false,
//   fullWidth = false,
//   onClick,
//   type = 'button',
//   className = '',
//   ...props
// }) => {
//   const baseClass = 'modern-btn';
//   const variantClass = `modern-btn--${variant}`;
//   const sizeClass = `modern-btn--${size}`;
//   const fullWidthClass = fullWidth ? 'modern-btn--full-width' : '';
//   const loadingClass = loading ? 'modern-btn--loading' : '';
//   const iconOnlyClass = Icon && !children ? 'modern-btn--icon-only' : '';

//   return (
//     <button
//       type={type}
//       className={`${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${loadingClass} ${iconOnlyClass} ${className}`}
//       onClick={onClick}
//       disabled={disabled || loading}
//       {...props}
//     >
//       {loading ? (
//         <>
//           <span className="modern-btn__spinner" />
//           <span className="modern-btn__text">Chargement...</span>
//         </>
//       ) : (
//         <>
//           {Icon && iconPosition === 'left' && (
//             <span className="modern-btn__icon modern-btn__icon--left">
//               <Icon />
//             </span>
//           )}
//           {children && <span className="modern-btn__text">{children}</span>}
//           {Icon && iconPosition === 'right' && (
//             <span className="modern-btn__icon modern-btn__icon--right">
//               <Icon />
//             </span>
//           )}
//         </>
//       )}
//     </button>
//   );
// };

// // Icon Button Component (circular button with just an icon)
// export const IconButton = ({
//   icon: Icon,
//   variant = 'ghost',
//   size = 'default',
//   ...props
// }) => {
//   return (
//     <Button
//       variant={variant}
//       size={size}
//       icon={Icon}
//       className="modern-btn--icon-button"
//       {...props}
//     />
//   );
// };

// // Button Group Component
// export const ButtonGroup = ({ children, className = '', ...props }) => {
//   return (
//     <div className={`modern-btn-group ${className}`} {...props}>
//       {children}
//     </div>
//   );
// };

// export default Button;
