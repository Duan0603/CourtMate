import React from 'react';
import { UserRole } from '@courtmate/shared';
import { OrganizerDashboard, RoleGuard } from '../../src/dashboard';

export default function OrganizerRoute() {
  return (
    <RoleGuard allowedRoles={[UserRole.ORGANIZER]}>
      <OrganizerDashboard />
    </RoleGuard>
  );
}
