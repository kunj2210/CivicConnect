export const mockIssues = [
    {
        id: 'ISS-001',
        title: 'Deep Pothole on Main Street',
        description: 'A very large pothole causing traffic slowdowns near the market.',
        category: 'Pothole',
        priority: 'High',
        status: 'In Progress',
        submittedBy: 'Rahul Sharma',
        date: '2023-10-25',
        location: 'Sector 14, MG Road'
    },
    {
        id: 'ISS-002',
        title: 'Streetlight Not Working',
        description: 'Streetlight pole #45 is flickering and mostly off at night.',
        category: 'Streetlight',
        priority: 'Medium',
        status: 'Submitted',
        submittedBy: 'Priya Singh',
        date: '2023-10-26',
        location: 'Park Avenue, Block B'
    },
    {
        id: 'ISS-003',
        title: 'Garbage Dump Overflow',
        description: 'Garbage bin has not been collected for 3 days.',
        category: 'Garbage',
        priority: 'High',
        status: 'Submitted',
        submittedBy: 'Amit Patel',
        date: '2023-10-26',
        location: 'Near City School'
    },
    {
        id: 'ISS-004',
        title: 'Water Pipe Leakage',
        description: 'Clean water is wasting due to a leak in the main supply pipe.',
        category: 'Water Leakage',
        priority: 'Critical',
        status: 'Assigned',
        submittedBy: 'Suresh Kumar',
        date: '2023-10-24',
        location: 'Sector 4, Housing Board'
    },
    {
        id: 'ISS-005',
        title: 'Blocked Drainage',
        description: 'Drainage water overflowing on the street.',
        category: 'Drainage',
        priority: 'High',
        status: 'Resolved',
        submittedBy: 'Anita Desai',
        date: '2023-10-20',
        location: 'Market Road'
    },
];

export const mockStats = [
    { name: 'Total Issues', value: 125, color: 'blue' },
    { name: 'Resolved', value: 45, color: 'green' },
    { name: 'In Progress', value: 30, color: 'yellow' },
    { name: 'Pending', value: 50, color: 'red' },
];

export const categoryData = [
    { name: 'Pothole', value: 40 },
    { name: 'Garbage', value: 30 },
    { name: 'Water', value: 20 },
    { name: 'Light', value: 15 },
    { name: 'Drainage', value: 20 },
];
