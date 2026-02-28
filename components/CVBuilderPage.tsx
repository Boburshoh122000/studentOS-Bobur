import React from 'react';
import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import CVBuilder from './cv-builder/CVBuilder';

export default function CVBuilderPage({ navigateTo }: NavigationProps) {
  return (
    <DashboardLayout currentScreen={Screen.CV_BUILDER} navigateTo={navigateTo}>
      <div className="flex-1 flex overflow-hidden">
        <CVBuilder />
      </div>
    </DashboardLayout>
  );
}
