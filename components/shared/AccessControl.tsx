import type { Action, Resource } from '@/lib/permissions';
import useCanAccess from 'hooks/useCanAccess';

interface AccessControlProps {
  children: React.ReactNode;
  resource: Resource;
  actions: Action[];
  slug?: string;
}

export const AccessControl = ({
  children,
  resource,
  actions,
  slug,
}: AccessControlProps) => {
  const { canAccess } = useCanAccess(slug);

  if (!canAccess(resource, actions)) {
    return null;
  }

  return <>{children}</>;
};
