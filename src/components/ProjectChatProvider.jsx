import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import FloatingProjectChat from './FloatingProjectChat';

const ProjectChatProvider = () => {
  const location = useLocation();
  
  // Robust project ID extraction from URL
  const getProjectId = () => {
    const path = location.pathname;
    const parts = path.split('/');
    
    // Check various common routes containing projectId
    const routesWithId = ['project', 'ideation', 'planning', 'shooting'];
    
    for (const route of routesWithId) {
      const index = parts.indexOf(route);
      if (index !== -1 && parts[index + 1]) {
        // Return the next part which should be the UUID
        return parts[index + 1];
      }
    }
    return null;
  };

  const projectId = getProjectId();

  // Don't show on dashboard or join page
  if (!projectId || location.pathname === '/' || location.pathname.startsWith('/join')) {
    return null;
  }

  return <FloatingProjectChat projectId={projectId} />;
};

export default ProjectChatProvider;