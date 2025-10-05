import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { slideshowConfig, slideBackgrounds } from '../config/slideshowData';

const PresentationSlideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const slides = [
    // Title Slide
    {
      id: 1,
      type: "title",
      ...slideshowConfig.title,
      background: slideBackgrounds.title
    },
    
    // Technical Architecture Overview
    {
      id: 2,
      type: "architecture",
      ...slideshowConfig.architecture,
      background: slideBackgrounds.architecture
    },

    // Real-Time Data Processing
    {
      id: 3,
      type: "dataflow",
      ...slideshowConfig.dataflow,
      background: slideBackgrounds.dataflow
    },

    // Interactive Features Demo
    {
      id: 4,
      type: "features",
      ...slideshowConfig.features,
      background: slideBackgrounds.features
    },

    // Technical Achievements
    {
      id: 5,
      type: "achievements",
      ...slideshowConfig.achievements,
      background: slideBackgrounds.achievements
    },

    // Code Implementation Details
    {
      id: 6,
      type: "implementation",
      ...slideshowConfig.implementation,
      background: slideBackgrounds.implementation
    },

    // Impact & Future Vision
    {
      id: 7,
      type: "impact",
      ...slideshowConfig.impact,
      background: slideBackgrounds.impact
    },

    // Challenges & Solutions
    {
      id: 8,
      type: "challenges",
      ...slideshowConfig.challenges,
      background: slideBackgrounds.challenges
    },

    // Platform Analytics & Performance
    {
      id: 9,
      type: "analytics",
      ...slideshowConfig.analytics,
      background: slideBackgrounds.analytics
    },

    // Features & Benefits Showcase
    {
      id: 10,
      type: "showcase",
      ...slideshowConfig.showcase,
      background: slideBackgrounds.showcase
    },

    // Growth & Impact Visualization
    {
      id: 11,
      type: "growth",
      ...slideshowConfig.growth,
      background: slideBackgrounds.growth
    },

    // Thank You & Contact
    {
      id: 12,
      type: "thankyou",
      ...slideshowConfig.thankyou,
      background: slideBackgrounds.thankyou
    }
  ];

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };


  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'Escape') navigate('/dashboard');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const currentSlideData = slides[currentSlide];

  const renderSlideContent = () => {
    const slide = currentSlideData as any;
    
    switch (slide.type) {
      case 'title':
        return (
          <div className="text-center max-w-6xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center items-center mb-12">
              <img 
                src="/kraken-octopus.svg" 
                alt="Kraken Logo" 
                className="w-24 h-24 object-contain"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-kraken-beige font-mono mb-6 leading-tight">
              {slide.title}
            </h1>
            <h2 className="text-xl md:text-2xl text-kraken-light font-mono mb-8 opacity-90 leading-relaxed">
              {slide.subtitle}
            </h2>
            <p className="text-lg text-kraken-beige opacity-80 font-mono">
              {slide.content}
            </p>
          </div>
        );

      case 'architecture':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {slide.sections?.map((section: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-kraken-beige font-mono mb-4">{section.title}</h3>
                  <p className="text-kraken-light font-mono mb-4 text-sm">{section.content}</p>
                  
                  {/* Code Block */}
                  <div className="bg-gray-900 border border-kraken-beige/10 rounded-lg p-4 mb-4">
                    <pre className="text-green-400 font-mono text-xs overflow-x-auto">
                      {section.code}
                    </pre>
                  </div>
                  
                  {/* Metrics */}
                  <div className="space-y-2">
                    {section.metrics?.map((metric: string, idx: number) => (
                      <div key={idx} className="flex items-center text-kraken-beige font-mono text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'dataflow':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="space-y-8">
              {slide.pipeline?.map((stage: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stage Info */}
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-kraken-beige rounded-full flex items-center justify-center text-kraken-dark font-bold mr-4">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-bold text-kraken-beige font-mono">{stage.stage}</h3>
                      </div>
                      <p className="text-kraken-light font-mono text-sm mb-4">{stage.description}</p>
                    </div>
                    
                    {/* Details */}
                    <div>
                      <h4 className="text-kraken-beige font-mono font-bold mb-3">Technical Details</h4>
                      <div className="space-y-2">
                        {stage.details?.map((detail: string, idx: number) => (
                          <div key={idx} className="flex items-start text-kraken-light font-mono text-sm">
                            <div className="w-2 h-2 bg-kraken-beige rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Code */}
                    <div>
                      <h4 className="text-kraken-beige font-mono font-bold mb-3">Implementation</h4>
                      <div className="bg-gray-900 border border-kraken-beige/10 rounded-lg p-4">
                        <pre className="text-green-400 font-mono text-xs overflow-x-auto">
                          {stage.code}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slide.featureGrid?.map((feature: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6 hover:border-kraken-beige/40 transition-all">
                  <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">{feature.title}</h3>
                  <p className="text-kraken-light font-mono text-sm mb-4">{feature.description}</p>
                  
                  {/* Highlights */}
                  <div className="space-y-2 mb-4">
                    {feature.highlights?.map((highlight: string, idx: number) => (
                      <div key={idx} className="flex items-center text-kraken-beige font-mono text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                  
                  {/* Code Block */}
                  <div className="bg-gray-900 border border-kraken-beige/10 rounded-lg p-3">
                    <pre className="text-green-400 font-mono text-xs overflow-x-auto">
                      {feature.code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="space-y-8">
              {slide.achievements?.map((achievement: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Description & Details */}
                    <div>
                      <div className="mb-4">
                        <span className="text-kraken-beige/60 font-mono text-sm uppercase tracking-wider">{achievement.category}</span>
                        <h3 className="text-2xl font-bold text-kraken-beige font-mono">{achievement.title}</h3>
                      </div>
                      <p className="text-kraken-light font-mono mb-6">{achievement.description}</p>
                      
                      <h4 className="text-kraken-beige font-mono font-bold mb-3">Technical Implementation</h4>
                      <div className="space-y-2">
                        {achievement.technicalDetails?.map((detail: string, idx: number) => (
                          <div key={idx} className="flex items-start text-kraken-light font-mono text-sm">
                            <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-kraken-beige flex-shrink-0" />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right: Metrics */}
                    <div>
                      <h4 className="text-kraken-beige font-mono font-bold mb-4">Key Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(achievement.metrics || {}).map(([key, value]: [string, any], idx: number) => (
                          <div key={idx} className="bg-kraken-dark/40 border border-kraken-beige/10 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-kraken-beige font-mono mb-1">{value}</div>
                            <div className="text-kraken-light font-mono text-sm">{key}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'implementation':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="space-y-8">
              {slide.codeBlocks?.map((block: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Code */}
                    <div>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-kraken-beige font-mono mb-2">{block.title}</h3>
                        <div className="text-kraken-light/60 font-mono text-sm">
                          <span className="text-kraken-beige">{block.file}</span> (Lines {block.lines})
                        </div>
                      </div>
                      
                      <div className="bg-gray-900 border border-kraken-beige/10 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                          <span className="text-kraken-light font-mono text-sm">{block.file}</span>
                        </div>
                        <pre className="text-green-400 font-mono text-xs overflow-x-auto leading-relaxed">
                          {block.code}
                        </pre>
                      </div>
                    </div>
                    
                    {/* Right: Explanation */}
                    <div className="flex flex-col justify-center">
                      <div className="bg-kraken-beige/10 border border-kraken-beige/20 rounded-xl p-6">
                        <h4 className="text-kraken-beige font-mono font-bold mb-3">Technical Highlight</h4>
                        <p className="text-kraken-light font-mono text-sm leading-relaxed">
                          {block.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'impact':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {slide.impactAreas?.map((area: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <div className="mb-4">
                    <span className="text-kraken-beige/60 font-mono text-sm uppercase tracking-wider">{area.category}</span>
                    <h3 className="text-xl font-bold text-kraken-beige font-mono">{area.title}</h3>
                  </div>
                  <p className="text-kraken-light font-mono mb-4 text-sm">{area.description}</p>
                  
                  <h4 className="text-kraken-beige font-mono font-bold mb-3">Key Benefits</h4>
                  <div className="space-y-2 mb-4">
                    {area.benefits?.map((benefit: string, idx: number) => (
                      <div key={idx} className="flex items-start text-kraken-light font-mono text-sm">
                        <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-kraken-beige flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  
                  <h4 className="text-kraken-beige font-mono font-bold mb-3">Impact Metrics</h4>
                  <div className="space-y-1">
                    {area.metrics?.map((metric: string, idx: number) => (
                      <div key={idx} className="text-kraken-beige font-mono text-sm bg-kraken-beige/10 rounded px-3 py-1">
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'challenges':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="space-y-8">
              {slide.challengesList?.map((challenge: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Challenge & Solution */}
                    <div className="lg:col-span-2">
                      <div className="mb-6">
                        <span className="text-kraken-red/80 font-mono text-sm uppercase tracking-wider">{challenge.category}</span>
                        <h3 className="text-2xl font-bold text-kraken-beige font-mono mb-3">{challenge.challenge}</h3>
                        <p className="text-kraken-light font-mono mb-4">{challenge.description}</p>
                        
                        <div className="bg-kraken-beige/10 border border-kraken-beige/20 rounded-lg p-4 mb-4">
                          <h4 className="text-kraken-beige font-mono font-bold mb-2">Solution</h4>
                          <p className="text-kraken-light font-mono text-sm">{challenge.solution}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-kraken-beige font-mono font-bold mb-3">Technical Approach</h4>
                          <div className="space-y-2">
                            {challenge.technicalApproach?.map((approach: string, idx: number) => (
                              <div key={idx} className="flex items-start text-kraken-light font-mono text-sm">
                                <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-kraken-beige flex-shrink-0" />
                                {approach}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-green-900/20 border border-green-400/20 rounded-lg p-4">
                          <h4 className="text-green-400 font-mono font-bold mb-2">Impact Achieved</h4>
                          <p className="text-green-300 font-mono text-sm">{challenge.impact}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Code Example */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-900 border border-kraken-beige/10 rounded-xl p-4 h-full">
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                          <span className="text-kraken-light font-mono text-sm">Solution Code</span>
                        </div>
                        <pre className="text-green-400 font-mono text-xs overflow-x-auto leading-relaxed">
                          {challenge.code}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Mock Website */}
              <div className="lg:col-span-1">
                <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                      <div className="text-kraken-light font-mono text-xs">{slide.mockWebsite?.url}</div>
                    </div>
                    <div className="bg-kraken-dark border border-kraken-beige/10 rounded p-4">
                      <h3 className="text-kraken-beige font-mono font-bold text-lg mb-4">{slide.mockWebsite?.title}</h3>
                      <div className="space-y-3">
                        {slide.performanceMetrics?.map((metric: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-kraken-light font-mono text-sm">{metric.label}</span>
                            <div className="text-right">
                              <div className={`font-mono font-bold ${metric.color}`}>{metric.value}</div>
                              <div className="text-xs text-kraken-beige">{metric.trend}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Center: Chart */}
              <div className="lg:col-span-1">
                <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <h3 className="text-kraken-beige font-mono font-bold mb-2">{slide.chartData?.title}</h3>
                  <p className="text-kraken-light font-mono text-sm mb-4">{slide.chartData?.subtitle}</p>
                  
                  {/* Mock Chart */}
                  <div className="space-y-4">
                    {slide.chartData?.datasets?.map((dataset: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-kraken-light font-mono text-sm">{dataset.name}</span>
                          <span className="text-kraken-beige font-mono text-sm">
                            {dataset.values[dataset.values.length - 1]}{dataset.unit || ''}
                          </span>
                        </div>
                        <div className="flex space-x-1 h-8">
                          {dataset.values.map((value: number, idx: number) => (
                            <div key={idx} className="flex-1 bg-kraken-beige/20 rounded-t relative">
                              <div 
                                className={`absolute bottom-0 w-full rounded-t ${
                                  dataset.color === 'kraken-beige' ? 'bg-kraken-beige' : 'bg-kraken-red'
                                }`}
                                style={{ height: `${(value / Math.max(...dataset.values)) * 100}%` }}
                              ></div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-kraken-light/60 font-mono mt-1">
                          <span>{slide.chartData?.periods[0]}</span>
                          <span>{slide.chartData?.periods[slide.chartData?.periods.length - 1]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right: User Insights */}
              <div className="lg:col-span-1">
                <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <h3 className="text-kraken-beige font-mono font-bold mb-4">User Demographics</h3>
                  <div className="space-y-4">
                    {slide.userInsights?.map((insight: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-kraken-light font-mono text-sm">{insight.category}</span>
                          <span className="text-kraken-beige font-mono font-bold">{insight.percentage}%</span>
                        </div>
                        <div className="w-full bg-kraken-beige/20 rounded-full h-2 mb-2">
                          <div 
                            className="bg-kraken-beige h-2 rounded-full" 
                            style={{ width: `${insight.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-kraken-light/70 font-mono text-xs">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'showcase':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Mock Phone */}
              <div className="lg:col-span-1 flex justify-center">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="w-64 h-96 bg-gray-900 rounded-3xl p-4 border-4 border-gray-700">
                    <div className="w-full h-full bg-kraken-dark rounded-2xl p-4 relative overflow-hidden">
                      {/* Phone Screen Content */}
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center mb-2">
                          <img src="/kraken-octopus.svg" alt="Kraken" className="w-8 h-8 mr-2" />
                          <span className="text-kraken-beige font-mono font-bold">{slide.mockPhone?.appName}</span>
                        </div>
                      </div>
                      
                      {/* Mock Dashboard */}
                      <div className="space-y-3">
                        <div className="bg-kraken-beige/10 border border-kraken-beige/20 rounded-lg p-3">
                          <div className="text-kraken-beige font-mono text-sm font-bold">AQI Status</div>
                          <div className="text-2xl font-bold text-green-400 font-mono">42</div>
                          <div className="text-xs text-kraken-light font-mono">Good Air Quality</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-kraken-beige/5 border border-kraken-beige/10 rounded p-2">
                            <div className="text-xs text-kraken-beige font-mono">PM2.5</div>
                            <div className="text-sm font-bold text-kraken-light font-mono">12.3</div>
                          </div>
                          <div className="bg-kraken-beige/5 border border-kraken-beige/10 rounded p-2">
                            <div className="text-xs text-kraken-beige font-mono">NO₂</div>
                            <div className="text-sm font-bold text-kraken-light font-mono">8.7</div>
                          </div>
                        </div>
                        
                        {/* Mock Map */}
                        <div className="bg-kraken-beige/5 border border-kraken-beige/10 rounded-lg h-24 flex items-center justify-center">
                          <span className="text-kraken-light/50 font-mono text-xs">Interactive Map</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Center: Features */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  {slide.featureHighlights?.map((feature: any, index: number) => (
                    <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-4">
                      <h3 className="text-kraken-beige font-mono font-bold mb-3">{feature.title}</h3>
                      <div className="space-y-2">
                        {feature.benefits?.map((benefit: string, idx: number) => (
                          <div key={idx} className="flex items-center text-kraken-light font-mono text-sm">
                            <CheckCircle className="w-4 h-4 mr-2 text-kraken-beige" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right: Technical Specs */}
              <div className="lg:col-span-1">
                <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <h3 className="text-kraken-beige font-mono font-bold mb-4">{slide.technicalSpecs?.title}</h3>
                  <div className="space-y-4">
                    {slide.technicalSpecs?.specs?.map((spec: any, index: number) => (
                      <div key={index} className="border-b border-kraken-beige/10 pb-3">
                        <div className="text-kraken-beige font-mono text-sm font-bold mb-1">{spec.label}</div>
                        <div className="text-kraken-light font-mono text-xs">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'growth':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-kraken-beige mb-4 font-mono text-center">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono text-center opacity-90">
              {slide.subtitle}
            </h2>
            
            {/* Impact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {slide.impactStats?.map((stat: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-kraken-beige font-mono mb-2">{stat.value}</div>
                  <div className="text-kraken-light font-mono font-bold mb-2">{stat.title}</div>
                  <div className="text-kraken-light/70 font-mono text-xs mb-2">{stat.description}</div>
                  <div className="text-green-400 font-mono text-sm font-bold">{stat.growth}</div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Global Map */}
              <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                <h3 className="text-kraken-beige font-mono font-bold mb-4">{slide.globalMap?.title}</h3>
                <div className="space-y-3">
                  {slide.globalMap?.regions?.map((region: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-kraken-beige/5 rounded-lg">
                      <div>
                        <div className="text-kraken-light font-mono font-bold">{region.name}</div>
                        <div className="text-kraken-light/70 font-mono text-sm">{region.users} users</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono text-sm font-bold ${
                          region.status === 'Live' ? 'text-green-400' : 
                          region.status === 'Beta' ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {region.status}
                        </div>
                        <div className="text-kraken-beige font-mono text-sm">{region.coverage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trend Analysis */}
              <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                <h3 className="text-kraken-beige font-mono font-bold mb-2">{slide.trendAnalysis?.title}</h3>
                <p className="text-kraken-light font-mono text-sm mb-4">{slide.trendAnalysis?.subtitle}</p>
                <div className="space-y-3">
                  {slide.trendAnalysis?.insights?.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start text-kraken-light font-mono text-sm">
                      <div className="w-2 h-2 bg-kraken-beige rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'thankyou':
        return (
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-kraken-beige mb-4 font-mono">
              {slide.title}
            </h1>
            <h2 className="text-2xl text-kraken-light mb-8 font-mono opacity-90">
              {slide.subtitle}
            </h2>
            
            {/* Project Info */}
            <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-kraken-beige font-mono mb-2">{slide.teamInfo?.projectName}</h3>
              <p className="text-kraken-light font-mono mb-2">{slide.teamInfo?.challenge}</p>
              <p className="text-kraken-beige font-mono text-sm">{slide.teamInfo?.category}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Achievements */}
              <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                <h3 className="text-kraken-beige font-mono font-bold mb-4">Key Achievements</h3>
                <div className="space-y-3 text-left">
                  {slide.achievements?.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-start text-kraken-light font-mono text-sm">
                      <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-kraken-beige flex-shrink-0" />
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                <h3 className="text-kraken-beige font-mono font-bold mb-4">{slide.nextSteps?.title}</h3>
                <div className="space-y-3 text-left">
                  {slide.nextSteps?.items?.map((item: string, index: number) => (
                    <div key={index} className="flex items-start text-kraken-light font-mono text-sm">
                      <div className="w-2 h-2 bg-kraken-beige rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="bg-kraken-beige/10 border border-kraken-beige/30 rounded-xl p-6">
              <h3 className="text-kraken-beige font-mono font-bold mb-4">Resources & Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slide.contactInfo?.map((contact: any, index: number) => (
                  <div key={index} className="bg-kraken-dark/40 border border-kraken-beige/20 rounded-lg p-3">
                    <div className="text-kraken-beige font-mono text-sm font-bold mb-1">{contact.label}</div>
                    <div className="text-kraken-light font-mono text-xs">{contact.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Slide content not found</div>;
    }
  };

  return (
    <div className={`min-h-screen ${currentSlideData.background} transition-all duration-1000 ease-in-out relative overflow-hidden`}>
      {/* Close Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 right-6 z-50 p-3 bg-kraken-dark/80 border border-kraken-beige/30 rounded-full hover:bg-kraken-dark hover:border-kraken-beige/50 transition-all duration-300"
      >
        <X className="w-6 h-6 text-kraken-beige" />
      </button>

      {/* Main Slide Content */}
      <div className="flex items-center justify-center min-h-screen px-8 py-16">
        <div className={`w-full transform transition-all duration-500 ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          {renderSlideContent()}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-8 flex space-x-4">
        <button
          onClick={prevSlide}
          disabled={isAnimating}
          className="p-4 bg-kraken-dark/80 border-2 border-kraken-beige/30 rounded-full hover:bg-kraken-dark hover:border-kraken-beige/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6 text-kraken-beige" />
        </button>
        <button
          onClick={nextSlide}
          disabled={isAnimating}
          className="p-4 bg-kraken-dark/80 border-2 border-kraken-beige/30 rounded-full hover:bg-kraken-dark hover:border-kraken-beige/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6 text-kraken-beige" />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 left-8">
        <div className="bg-kraken-dark/80 border border-kraken-beige/30 rounded-full px-4 py-2">
          <span className="text-kraken-beige font-mono text-sm">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-kraken-beige/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-kraken-red/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default PresentationSlideshow;
