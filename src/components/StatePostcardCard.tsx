import React from 'react';
import { EditorialCard, EditorialCardProps } from './EditorialCard';

export type StatePostcardCardProps = EditorialCardProps;
export const StatePostcardCard: React.FC<EditorialCardProps> = (props) => {
  return <EditorialCard {...props} />;
};
