/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Login from '@/views/Login';
import SuperAdmin from '@/views/SuperAdmin';
import Secretary from '@/views/Secretary';
import Guard from '@/views/Guard';
import Resident from '@/views/Resident';
import Housekeeping from '@/views/Housekeeping';
import Settings from '@/views/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes Wrapper */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/super-admin/*" element={<DashboardLayout><SuperAdmin /></DashboardLayout>} />
        <Route path="/secretary/*" element={<DashboardLayout><Secretary /></DashboardLayout>} />
        <Route path="/guard/*" element={<DashboardLayout><Guard /></DashboardLayout>} />
        <Route path="/resident/*" element={<DashboardLayout><Resident /></DashboardLayout>} />
        <Route path="/housekeeping/*" element={<DashboardLayout><Housekeeping /></DashboardLayout>} />
        <Route path="/settings/*" element={<DashboardLayout><Settings /></DashboardLayout>} />
        
      </Routes>
    </Router>
  );
}
