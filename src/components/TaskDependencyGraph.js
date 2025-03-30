import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/TaskDependencyGraph.css';

const TaskDependencyGraph = ({ tasks }) => {
  // Convert tasks to nodes and dependencies to edges
  const nodes = useMemo(() => {
    return tasks.map(task => ({
      id: task.id.toString(),
      data: { 
        label: `${task.title} (#${task.id})`, 
        status: task.status 
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random initial positions
      style: {
        background: getNodeColor(task.status),
        color: '#fff',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      },
    }));
  }, [tasks]);

  const edges = useMemo(() => {
    const edgeList = [];
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        edgeList.push({
          id: `e${depId}-${task.id}`,
          source: depId.toString(),
          target: task.id.toString(),
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        });
      });
    });
    return edgeList;
  }, [tasks]);

  return (
    <div className="task-dependency-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

const getNodeColor = (status) => {
  switch (status) {
    case 'Pending': return '#ef4444'; // Red
    case 'In Progress': return '#f59e0b'; // Orange
    case 'Completed': return '#10b981'; // Green
    default: return '#6b7280'; // Gray
  }
};

export default TaskDependencyGraph;