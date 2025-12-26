'use client'
import React, { useState } from 'react';
import { Search, Star, Download, Code, Filter, Zap, Shield, Clock, User, Tag, Heart, Eye } from 'lucide-react';

const CodeSnippetMarketplace = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Snippets', count: 2847 },
    { id: 'react', name: 'React', count: 892 },
    { id: 'javascript', name: 'JavaScript', count: 743 },
    { id: 'python', name: 'Python', count: 621 },
    { id: 'typescript', name: 'TypeScript', count: 456 },
    { id: 'css', name: 'CSS', count: 335 }
  ];

  const snippets = [
    {
      id: 1,
      title: 'Advanced React Hook Form Validation',
      description: 'Comprehensive form validation with custom hooks, real-time validation, and error handling patterns.',
      author: 'Sarah Chen',
      authorAvatar: '👩‍💻',
      price: '$12.99',
      rating: 4.9,
      downloads: 2847,
      language: 'TypeScript',
      tags: ['React', 'Forms', 'Validation', 'Hooks'],
      featured: true,
      preview: `const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  const validate = useCallback((data) => {
    // Validation logic here
  }, [schema]);
}`
    },
    {
      id: 2,
      title: 'Animated Dashboard Components',
      description: 'Beautiful dashboard widgets with smooth animations, responsive design, and customizable themes.',
      author: 'Alex Rodriguez',
      authorAvatar: '👨‍💻',
      price: '$18.99',
      rating: 4.8,
      downloads: 1923,
      language: 'React',
      tags: ['Animation', 'Dashboard', 'UI', 'Framer Motion'],
      featured: false,
      preview: `const AnimatedCard = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { delay }
    });
  }, []);`
    },
    {
      id: 3,
      title: 'Python Data Pipeline Toolkit',
      description: 'Complete data processing pipeline with error handling, logging, and performance optimization.',
      author: 'Maria Santos',
      authorAvatar: '👩‍🔬',
      price: '$15.99',
      rating: 4.7,
      downloads: 1456,
      language: 'Python',
      tags: ['Data Processing', 'Pipeline', 'ETL', 'Performance'],
      featured: true,
      preview: `class DataPipeline:
    def __init__(self, config):
        self.config = config
        self.logger = self._setup_logger()
    
    async def process(self, data):
        # Pipeline processing logic`
    },
    {
      id: 4,
      title: 'Advanced CSS Grid Layouts',
      description: 'Modern CSS Grid layouts with responsive breakpoints, animation effects, and accessibility features.',
      author: 'Jordan Kim',
      authorAvatar: '🎨',
      price: '$9.99',
      rating: 4.6,
      downloads: 3201,
      language: 'CSS',
      tags: ['CSS Grid', 'Responsive', 'Layout', 'Animation'],
      featured: false,
      preview: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  animation: fadeInGrid 0.6s ease-out;
}`
    },
    {
      id: 5,
      title: 'JWT Authentication System',
      description: 'Secure JWT authentication with refresh tokens, role-based access control, and session management.',
      author: 'David Park',
      authorAvatar: '🔐',
      price: '$22.99',
      rating: 4.9,
      downloads: 987,
      language: 'Node.js',
      tags: ['Authentication', 'JWT', 'Security', 'Backend'],
      featured: true,
      preview: `const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: '15m'
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET);`
    },
    {
      id: 6,
      title: 'Machine Learning Model Optimizer',
      description: 'Automated hyperparameter tuning and model optimization toolkit with visualization dashboards.',
      author: 'Dr. Emily Watson',
      authorAvatar: '🤖',
      price: '$29.99',
      rating: 4.8,
      downloads: 654,
      language: 'Python',
      tags: ['ML', 'Optimization', 'TensorFlow', 'Visualization'],
      featured: false,
      preview: `class ModelOptimizer:
    def __init__(self, model, param_space):
        self.model = model
        self.param_space = param_space
        self.best_params = None
    
    def optimize(self, X_train, y_train):`
    }
  ];

  const filteredSnippets = snippets.filter(snippet => {
    const matchesCategory = activeCategory === 'all' || 
      snippet.language.toLowerCase() === activeCategory || 
      snippet.tags.some(tag => tag.toLowerCase() === activeCategory);
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-900/50 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-purple-400">CodeVault</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Browse</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Sell</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Community</a>
              <button className="bg-purple-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-purple-700 transition-all">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-purple-400 mb-4">
            Premium Code Snippets
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover, buy, and sell high-quality code snippets crafted by professional developers worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search code snippets, libraries, frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/70 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-purple-600 text-gray-200'
                    : 'bg-gray-900/70 text-gray-400 hover:bg-gray-800/70 hover:text-gray-300'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Badge */}
        <div className="flex items-center space-x-2 mb-6">
          <Zap className="h-5 w-5 text-yellow-400" />
          <span className="text-purple-400 font-medium">Featured Snippets</span>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="bg-black border border-gray-900/70 rounded-xl p-6 hover:border-purple-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/20 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {snippet.featured && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs font-medium text-gray-900 rounded-full">
                        FEATURED
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-900 text-gray-400 text-xs rounded-full">
                      {snippet.language}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2 group-hover:text-purple-300 transition-colors">
                    {snippet.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {snippet.description}
                  </p>
                </div>
              </div>

              {/* Code Preview */}
              <div className="bg-gray-950/60 rounded-lg p-3 mb-4 font-mono text-sm text-gray-400 border border-gray-900/50">
                <pre className="whitespace-pre-wrap overflow-hidden">{snippet.preview}</pre>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {snippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-900/70 text-gray-400 text-xs rounded-md hover:bg-purple-900/30 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Author and Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{snippet.authorAvatar}</span>
                  <span className="text-gray-400 text-sm">{snippet.author}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{snippet.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{snippet.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-purple-400">{snippet.price}</span>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-300 rounded-lg transition-all">
                    <Heart className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-300 rounded-lg transition-all">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-gray-200 rounded-lg hover:bg-purple-700 transition-all font-medium">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg transition-all font-medium">
            Load More Snippets
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900/70 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-purple-400">CodeVault</h3>
              </div>
              <p className="text-gray-400 text-sm">
                The premier marketplace for professional code snippets and development resources.
              </p>
            </div>
            <div>
              <h4 className="text-purple-400 font-medium mb-3">Marketplace</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-400 transition-colors">Browse Snippets</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">Top Sellers</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">New Releases</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">Categories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-purple-400 font-medium mb-3">Developers</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-400 transition-colors">Start Selling</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-purple-400 font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900/70 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 CodeVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodeSnippetMarketplace;