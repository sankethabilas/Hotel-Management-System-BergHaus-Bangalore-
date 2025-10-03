import { ReactNode } from 'react';

// Base component props
export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
}

// Card components
export interface CardProps extends BaseComponentProps {}
export interface CardHeaderProps extends BaseComponentProps {}
export interface CardContentProps extends BaseComponentProps {}
export interface CardDescriptionProps extends BaseComponentProps {}
export interface CardTitleProps extends BaseComponentProps {}

// Form components
export interface LabelProps extends BaseComponentProps {
  htmlFor?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Alert components
export interface AlertProps extends BaseComponentProps {
  variant?: 'default' | 'destructive';
}

export interface AlertDescriptionProps extends BaseComponentProps {}

// Badge component
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

// Avatar components
export interface AvatarProps extends BaseComponentProps {}
export interface AvatarImageProps {
  src?: string;
  alt?: string;
}
export interface AvatarFallbackProps extends BaseComponentProps {}

// Table components
export interface TableProps extends BaseComponentProps {}
export interface TableHeaderProps extends BaseComponentProps {}
export interface TableBodyProps extends BaseComponentProps {}
export interface TableRowProps extends BaseComponentProps {}
export interface TableHeadProps extends BaseComponentProps {}
export interface TableCellProps extends BaseComponentProps {}

// Separator component
export interface SeparatorProps extends BaseComponentProps {
  orientation?: 'horizontal' | 'vertical';
}

// Tabs components
export interface TabsProps extends BaseComponentProps {}
export interface TabsListProps extends BaseComponentProps {}
export interface TabsTriggerProps extends BaseComponentProps {
  value: string;
}
export interface TabsContentProps extends BaseComponentProps {
  value: string;
}
