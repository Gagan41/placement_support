// --------------------
// AVAILABLE ROLES
// --------------------
export const availableRoles = [
  {
    id: 'frontend-dev',
    title: 'Frontend Developer',
    category: 'Development',
    description:
      'Build beautiful, responsive, and performant user interfaces using modern web technologies.',
    averageSalary: '$80k - $140k',
    requiredSkills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript']
  },
  {
    id: 'backend-dev',
    title: 'Backend Developer',
    category: 'Development',
    description:
      'Design and implement scalable server-side logic, databases, and APIs.',
    averageSalary: '$85k - $150k',
    requiredSkills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS']
  },
  {
    id: 'fullstack-dev',
    title: 'Full Stack Developer',
    category: 'Development',
    description:
      'Master both frontend and backend technologies to build complete web applications.',
    averageSalary: '$90k - $160k',
    requiredSkills: ['React', 'Node.js', 'Database Design', 'System Architecture']
  }
];

// --------------------
// BASE 12-WEEK MASTER PLAN
// --------------------
const BASE_MILESTONES = [
  {
    title: 'Foundations & Environment Mastery',
    overview:
      'This phase removes beginner friction permanently and builds professional discipline.',
    dailyPlan: [
      'Install runtime, editor, extensions',
      'ESLint & Prettier',
      'Git basics',
      'GitHub push',
      'Folder structure',
      'Environment variables',
      'Revision',
      'Rebuild from scratch',
      'Improve README',
      'Clean configs',
      'Simulate onboarding',
      'Debug setup',
      'Explain setup aloud',
      'Buffer'
    ]
  },
  {
    title: 'Core Concepts & Mini Project',
    overview:
      'You stop learning concepts in isolation and start building real features.',
    dailyPlan: [
      'Feature planning',
      'Implementation',
      'Implementation',
      'Refactor',
      'Edge cases',
      'Validation',
      'Review',
      'Improve UX',
      'Clean code',
      'Debug',
      'Explain logic',
      'Optimize',
      'Interview explanation',
      'Buffer'
    ]
  },
  {
    title: 'Advanced Features',
    overview: 'You move from “it works” to “it scales”.',
    dailyPlan: [
      'Architecture design',
      'API planning',
      'API integration',
      'Error handling',
      'Modularity',
      'Refactor',
      'Review',
      'Simulate failures',
      'Resilience',
      'Optimize',
      'Remove duplication',
      'Code review',
      'Interview explanation',
      'Buffer'
    ]
  },
  {
    title: 'Performance & Best Practices',
    overview: 'Optimize performance and architecture.',
    dailyPlan: [
      'Identify bottlenecks',
      'Refactor',
      'Reduce re-renders',
      'Clean architecture',
      'Optimize state',
      'Review',
      'Test',
      'Improvements',
      'Improvements',
      'Improvements',
      'Improvements',
      'Improvements',
      'Improvements',
      'Buffer'
    ]
  },
  {
    title: 'Capstone Project',
    overview: 'Build a complete real-world project.',
    dailyPlan: [
      'Architecture',
      'Feature build',
      'Feature build',
      'Feature build',
      'Feature build',
      'Feature build',
      'Review',
      'Polish',
      'Polish',
      'Polish',
      'Polish',
      'Polish',
      'Interview explanation',
      'Buffer'
    ]
  },
  {
    title: 'Deployment & Job Readiness',
    overview: 'Deploy and prepare for interviews.',
    dailyPlan: [
      'Deployment',
      'CI/CD basics',
      'Docs',
      'Resume',
      'Mock interviews',
      'Mock interviews',
      'Mock interviews',
      'Mock interviews',
      'Mock interviews',
      'Mock interviews',
      'Fix gaps',
      'Fix gaps',
      'Fix gaps',
      'Buffer'
    ]
  }
];

// --------------------
// CAREER ROADMAP GENERATOR (FINAL)
// --------------------
export const generateCareerRoadmap = async (roleId, durationWeeks) => {
  await new Promise(resolve => setTimeout(resolve, 700));

  const role = availableRoles.find(r => r.id === roleId);
  if (!role) throw new Error('Role not found');

  /**
   * RULES:
   * 4 weeks  → first 2 milestones
   * 12 weeks → all 6 milestones
   * 24 weeks → repeat depth (advanced pass)
   */
  let milestoneCount = 6;

  if (durationWeeks === 4) milestoneCount = 2;
  if (durationWeeks === 12) milestoneCount = 6;
  if (durationWeeks === 24) milestoneCount = 12;

  const milestones = [];

  for (let i = 0; i < milestoneCount; i++) {
    const base = BASE_MILESTONES[i % BASE_MILESTONES.length];
    const weekStart = i * 2 + 1;
    const weekEnd = weekStart + 1;

    milestones.push({
      id: `m${i + 1}`,
      week: `Week ${weekStart}–${weekEnd}`,
      title:
        durationWeeks === 24
          ? `${base.title} (Advanced)`
          : base.title,
      overview: base.overview,

      tasks: [
        {
          title: base.title,
          dailyPlan: base.dailyPlan.map(
            (d, idx) => `Day ${idx + 1}: ${d}`
          )
        }
      ],

      skills: role.requiredSkills.map(skill => ({
        name: skill,
        whyItMatters: 'Critical for real-world roles'
      })),

      resources: ['Official Docs', 'Hands-on Practice']
    });
  }

  return {
    role: role.title,
    duration: durationWeeks,
    milestones
  };
};