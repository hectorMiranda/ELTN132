// Tool Configuration - Auto-generates from pages
export interface Tool {
    title: string;
    description: string;
    icon: string;
    path: string;
    color: string;
    category?: 'converter' | 'logic' | 'analysis' | 'circuit' | 'other';
}

export const TOOLS: Tool[] = [
    {
        title: 'Binary ↔ Decimal',
        description: 'Convert between binary and decimal numbers',
        icon: '🔢',
        path: '/binary-to-decimal',
        color: 'from-blue-500 to-cyan-500',
        category: 'converter'
    },
    {
        title: 'Decimal to Binary',
        description: 'Convert decimal to binary with step-by-step',
        icon: '🔀',
        path: '/decimal-to-binary',
        color: 'from-cyan-500 to-blue-500',
        category: 'converter'
    },
    {
        title: 'Boolean Expressions',
        description: 'Interactive logic gate simulator',
        icon: '⚡',
        path: '/boolean-expressions',
        color: 'from-purple-500 to-pink-500',
        category: 'logic'
    },
    {
        title: 'Boolean Algebra',
        description: 'Explore Boolean algebra identities',
        icon: '🧮',
        path: '/boolean-algebra',
        color: 'from-green-500 to-teal-500',
        category: 'logic'
    },
    {
        title: 'Associative Rules',
        description: 'Understand associative properties',
        icon: '🔗',
        path: '/associative-rules',
        color: 'from-teal-500 to-green-500',
        category: 'logic'
    },
    {
        title: 'Logic Gates',
        description: 'Learn about digital logic gates',
        icon: '🔌',
        path: '/logic-gates',
        color: 'from-orange-500 to-red-500',
        category: 'circuit'
    },
    {
        title: 'K-Map Solver',
        description: 'Karnaugh map simplification',
        icon: '🗺️',
        path: '/k-map',
        color: 'from-indigo-500 to-blue-500',
        category: 'analysis'
    },
    {
        title: 'MSI Components',
        description: 'Medium-Scale Integration circuits',
        icon: '⚙️',
        path: '/msi',
        color: 'from-yellow-500 to-orange-500',
        category: 'circuit'
    },
    {
        title: 'SPI Protocol',
        description: 'Serial Peripheral Interface simulator',
        icon: '📡',
        path: '/spi',
        color: 'from-pink-500 to-purple-500',
        category: 'circuit'
    },
    {
        title: 'Circuit Viewer',
        description: 'Analyze Digital .dig files with AI',
        icon: '🔍',
        path: '/dig-viewer',
        color: 'from-violet-500 to-indigo-500',
        category: 'analysis'
    },
];

// Helper function to get tools by category
export const getToolsByCategory = (category: Tool['category']) => {
    return TOOLS.filter(tool => tool.category === category);
};

// Get all categories
export const CATEGORIES = [
    { key: 'converter', label: 'Converters', icon: '🔄' },
    { key: 'logic', label: 'Boolean Logic', icon: '🧠' },
    { key: 'circuit', label: 'Circuits', icon: '⚡' },
    { key: 'analysis', label: 'Analysis Tools', icon: '📊' },
] as const;