// src/utils/aiAlgorithms.js

// 1. PRODUCTIVITY SCORE - FIXED for better calculation
export const calculateProductivityScore = (employeeId, tasks) => {
  console.log('Calculating productivity for:', employeeId, 'Tasks:', tasks?.length);
  
  // Handle both string ID and object ID
  const employeeTasks = tasks.filter(t => {
    // Check if assignedTo is an object with _id or just a string
    if (typeof t.assignedTo === 'object' && t.assignedTo !== null) {
      return t.assignedTo._id === employeeId || t.assignedTo === employeeId;
    } else {
      return t.assignedTo === employeeId;
    }
  });
  
  console.log('Employee tasks found:', employeeTasks.length);
  
  if (employeeTasks.length === 0) {
    return {
      score: 0,
      level: 'No Tasks',
      completedTasks: 0,
      totalTasks: 0,
      completionRate: 0,
      efficiencyScore: 0
    };
  }
  
  const totalTasks = employeeTasks.length;
  const completedTasks = employeeTasks.filter(t => t.status === 'completed').length;
  
  // FIXED: Calculate percentage correctly
  // If there are completed tasks, score should reflect that
  if (completedTasks > 0) {
    // Base score on completion rate (100% if all tasks completed)
    const baseScore = (completedTasks / totalTasks) * 100;
    
    return {
      score: Math.round(baseScore),
      level: baseScore >= 80 ? 'Expert' : 
             baseScore >= 60 ? 'Advanced' : 
             baseScore >= 40 ? 'Intermediate' : 'Beginner',
      completedTasks,
      totalTasks,
      completionRate: Math.round((completedTasks / totalTasks) * 100),
      efficiencyScore: 40 // Default good efficiency
    };
  }
  
  // If no completed tasks, score is 0
  return {
    score: 0,
    level: 'Beginner',
    completedTasks,
    totalTasks,
    completionRate: 0,
    efficiencyScore: 0
  };
};

// 2. SKILL GAP DETECTION - FIXED
export const detectSkillGaps = (employeeSkills = [], employeeRole = '') => {
  const roleRequirements = {
    'Frontend Developer': ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'TypeScript'],
    'Backend Developer': ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Python', 'REST API'],
    'Full Stack Developer': ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'REST API'],
    'UI/UX Designer': ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'User Research'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'CI/CD'],
    'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Pandas', 'NumPy'],
    'Project Manager': ['Agile', 'Scrum', 'JIRA', 'Communication', 'Leadership']
  };
  
  // Default requirements if role not found
  const requirements = roleRequirements[employeeRole] || 
    ['Problem Solving', 'Communication', 'Team Work', 'Time Management'];
  
  // Ensure employeeSkills is array
  const skills = Array.isArray(employeeSkills) ? employeeSkills : [];
  const employeeSkillsLower = skills.map(s => String(s).toLowerCase());
  
  const missingSkills = requirements.filter(req => 
    !employeeSkillsLower.includes(req.toLowerCase())
  );
  
  const matchPercentage = requirements.length > 0 
    ? Math.round(((requirements.length - missingSkills.length) / requirements.length) * 100)
    : 0;
  
  return {
    matchPercentage,
    totalRequired: requirements.length,
    skillsPossessed: skills.length,
    missingSkills,
    missingCount: missingSkills.length,
    recommendedSkills: missingSkills.slice(0, 5),
    isReadyForRole: missingSkills.length === 0,
    roleLevel: matchPercentage > 80 ? 'Ready' : 
               matchPercentage > 50 ? 'Almost Ready' : 
               matchPercentage > 30 ? 'Learning' : 'Needs Training'
  };
};

// 3. SMART TASK ASSIGNMENT
export const findBestEmployeeForTask = (task, employees, tasks) => {
  if (!task || !employees || !tasks) {
    return { bestMatch: null, alternatives: [], requiredSkills: [] };
  }

  const extractRequiredSkills = (text) => {
    const commonSkills = [
      'react', 'node', 'javascript', 'python', 'html', 'css',
      'mongodb', 'sql', 'aws', 'docker', 'git', 'ui', 'ux',
      'frontend', 'backend', 'fullstack', 'design', 'testing'
    ];
    
    const description = (task.title + ' ' + (task.description || '')).toLowerCase();
    return commonSkills.filter(skill => description.includes(skill));
  };
  
  const requiredSkills = extractRequiredSkills();
  
  const scoredEmployees = employees.map(employee => {
    const employeeSkills = (employee.skills || []).map(s => s.toLowerCase());
    const matchedSkills = requiredSkills.filter(skill => 
      employeeSkills.includes(skill)
    );
    
    const skillScore = requiredSkills.length > 0 
      ? (matchedSkills.length / requiredSkills.length) * 60
      : 40;
    
    const employeeTasks = tasks.filter(t => {
      const assignedToId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
      return assignedToId === employee._id && t.status !== 'completed';
    });
    const workloadScore = Math.max(0, 30 - (employeeTasks.length * 5));
    
    const completedTasks = tasks.filter(t => {
      const assignedToId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
      return assignedToId === employee._id && t.status === 'completed';
    }).length;
    const performanceScore = completedTasks > 0 ? 10 : 5;
    
    return {
      ...employee,
      matchScore: Math.round(skillScore + workloadScore + performanceScore),
      matchDetails: {
        matchedSkills: matchedSkills.length,
        requiredSkills: requiredSkills.length,
        currentTasks: employeeTasks.length,
        completedTasks
      }
    };
  });
  
  const sorted = scoredEmployees.sort((a, b) => b.matchScore - a.matchScore);
  
  return {
    bestMatch: sorted[0] || null,
    alternatives: sorted.slice(1, 4),
    requiredSkills
  };
};

// 4. PERFORMANCE TREND PREDICTION - FIXED
export const predictPerformanceTrend = (employeeId, tasks) => {
  const employeeTasks = tasks
    .filter(t => {
      if (typeof t.assignedTo === 'object' && t.assignedTo !== null) {
        return t.assignedTo._id === employeeId || t.assignedTo === employeeId;
      } else {
        return t.assignedTo === employeeId;
      }
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  if (employeeTasks.length === 0) {
    return {
      trend: 'No Data',
      confidence: 'Low',
      message: 'No tasks assigned',
      currentRate: 0,
      predictedNextRate: 0,
      insight: 'Assign tasks to see trends'
    };
  }
  
  const completedCount = employeeTasks.filter(t => t.status === 'completed').length;
  const completionRate = (completedCount / employeeTasks.length) * 100;
  
  // Check if most recent task was completed
  const lastTask = employeeTasks[employeeTasks.length - 1];
  const lastTaskCompleted = lastTask?.status === 'completed';
  
  let trend = 'Stable';
  let confidence = 'Medium';
  
  if (completedCount === employeeTasks.length) {
    trend = 'Perfect Record 🏆';
    confidence = 'High';
  } else if (lastTaskCompleted && completionRate > 50) {
    trend = 'Improving 📈';
    confidence = 'High';
  } else if (!lastTaskCompleted && completionRate < 50) {
    trend = 'Needs Attention ⚠️';
    confidence = 'Medium';
  }
  
  return {
    trend,
    confidence,
    currentRate: Math.round(completionRate),
    predictedNextRate: Math.min(100, Math.round(completionRate + 10)),
    dataPoints: employeeTasks.length,
    insight: `${completedCount} of ${employeeTasks.length} tasks completed`
  };
};