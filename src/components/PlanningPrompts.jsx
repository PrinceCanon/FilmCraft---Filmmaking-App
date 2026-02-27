import React, { lazy, Suspense } from 'react';
import ScriptManager from './ScriptManager';
import EnhancedShotListBuilder from './EnhancedShotListBuilder';
import ProductionScheduler from './ProductionScheduler';
import ResourcesManager from './ResourcesManager';

const PlanningPrompts = ({ step, project, onDataUpdate }) => {
  const renderContent = () => {
    switch(step) {
      case 0:
        return <ScriptManager project={project} onScriptUpdate={onDataUpdate} />;
      case 1:
        return <EnhancedShotListBuilder project={project} onDataUpdate={onDataUpdate} />;
      case 2:
        return <ResourcesManager project={project} onDataUpdate={onDataUpdate} />;
      case 3:
        return <ProductionScheduler project={project} onDataUpdate={onDataUpdate} />;
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading...</div>}>
      {renderContent()}
    </Suspense>
  );
};

export default PlanningPrompts;