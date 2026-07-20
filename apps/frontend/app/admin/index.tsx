import React from 'react';
import { UserRole } from '@courtmate/shared';
import { AdminDashboard, RoleGuard } from '../../src/dashboard';

export default function AdminRoute() {
  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.REGIONAL_ADMIN]}>
      <AdminDashboard />
    </RoleGuard>
  );
}
