import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { slideshowConfig, slideBackgrounds } from '../config/slideshowData';

const PresentationSlideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imagePopup, setImagePopup] = useState<{ src: string; alt: string } | null>(null);
  const navigate = useNavigate();

  const slides = [
    // Title Slide
    {
      id: 1,
      type: "title",
      ...slideshowConfig.title,
      background: slideBackgrounds.title
    },
    
    // The Challenge
    {
      id: 2,
      type: "challenge",
      ...slideshowConfig.challenge,
      background: slideBackgrounds.challenge
    },

    // The Solution
    {
      id: 3,
      type: "solution",
      ...slideshowConfig.solution,
      background: slideBackgrounds.solution
    },

    // Datasets & APIs
    {
      id: 4,
      type: "datasets",
      ...slideshowConfig.datasets,
      background: slideBackgrounds.datasets
    },

    // Tech Stack & How It Works Combined
    {
      id: 5,
      type: "techStackWorkflow",
      combinedTitle: "Tech Stack & How It Works",
      techStack: slideshowConfig.techStack,
      workflow: slideshowConfig.workflow,
      background: slideBackgrounds.techStack
    },

    // Dataset Details - Why We Use Each
    {
      id: 6,
      type: "datasetDetails",
      ...slideshowConfig.datasetDetails,
      background: slideBackgrounds.datasetDetails
    },

    // Users & Impact
    {
      id: 7,
      type: "usersImpact",
      ...slideshowConfig.usersImpact,
      background: slideBackgrounds.usersImpact
    },

    // The Future of Kraken
    {
      id: 8,
      type: "future",
      ...slideshowConfig.future,
      background: slideBackgrounds.future
    },

    // Thank You
    {
      id: 9,
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
    if (e.key === 'Escape') {
      if (imagePopup) {
        closeImagePopup();
      } else {
        navigate('/dashboard');
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [imagePopup, navigate]);

  const currentSlideData = slides[currentSlide];

  const handleImageClick = (src: string, alt: string) => {
    setImagePopup({ src, alt });
  };

  const closeImagePopup = () => {
    setImagePopup(null);
  };

  const renderSlideContent = () => {
    const slide = currentSlideData as any;
    
    switch (slide.type) {
      case 'title':
        return (
          <div className="text-center max-w-6xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center items-center mb-12">
              <img 
                src="/main-krak.svg" 
                alt="Main Kraken Logo" 
                className="w-64 h-64 object-contain"
              />
            </div>
            
            <h2 className="text-2xl md:text-3xl text-kraken-light font-mono mb-8 opacity-90 leading-relaxed">
              {slide.subtitle}
            </h2>
            <p className="text-lg text-kraken-beige opacity-80 font-mono underline">
              {slide.content}
            </p>
            <div className="mt-8 text-right text-kraken-beige/60 font-mono text-sm">
              1
            </div>
          </div>
        );

      case 'challenge':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-kraken-beige mb-8 font-mono">
              {slide.title}
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Challenge Points */}
              <div className="space-y-4">
                {slide.challenges?.map((challenge: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-kraken-beige rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <p className="text-xl text-kraken-light font-mono leading-relaxed">
                      {challenge}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Right: Air Quality Images */}
              <div className="space-y-6">
                <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-4">
                  <div className="rounded-lg h-48 overflow-hidden mb-3">
                    <img 
                      src="/air qual 1.jpeg" 
                      alt="Air Quality Coverage Map 1" 
                      className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick('/air qual 1.jpeg', 'Air Quality Coverage Map 1')}
                    />
                  </div>
                  <p className="text-kraken-light font-mono text-sm">Current Air Quality Coverage - Limited ground sensor coverage leaves gaps in monitoring</p>
                </div>
                
                <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-4">
                  <div className="rounded-lg h-48 overflow-hidden mb-3">
                    <img 
                      src="/air qual 2.jpeg" 
                      alt="Air Quality Coverage Map 2" 
                      className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick('/air qual 2.jpeg', 'Air Quality Coverage Map 2')}
                    />
                  </div>
                  <p className="text-kraken-light font-mono text-sm">Pollution Heat Map - Shows areas with high pollution concentrations</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'solution':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-kraken-beige mb-8 font-mono">
              {slide.title}
            </h1>
            
            {/* Mock Dashboard Interface */}
            <div className="bg-kraken-dark/80 border border-kraken-beige/30 rounded-2xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: AQI Display */}
                <div className="space-y-6">
                  {/* AQI Main Display */}
                  <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6 text-center">
                    <h3 className="text-kraken-beige font-mono font-bold mb-2">{slide.features?.aqiDisplay?.title}</h3>
                    <div className="text-6xl font-bold text-green-400 font-mono mb-2">{slide.features?.aqiDisplay?.value}</div>
                    <div className="text-green-400 font-mono font-bold mb-3">{slide.features?.aqiDisplay?.status}</div>
                    <p className="text-kraken-light font-mono text-sm">{slide.features?.aqiDisplay?.description}</p>
                  </div>
                  
                  {/* Pollutant Levels */}
                  <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                    <h3 className="text-kraken-beige font-mono font-bold mb-4">{slide.features?.pollutantLevels?.title}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {slide.features?.pollutantLevels?.data?.map((pollutant: any, index: number) => (
                        <div key={index} className="bg-kraken-beige/10 border border-kraken-beige/10 rounded p-3 text-center">
                          <div className="text-kraken-beige font-mono text-sm font-bold">{pollutant.name}</div>
                          <div className="text-kraken-light font-mono text-lg">{pollutant.value}</div>
                          <div className="text-kraken-light/60 font-mono text-xs">{pollutant.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Center Column: Health Alerts & Historical */}
                <div className="space-y-6">
                  {/* Health Alerts */}
                  <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                    <h3 className="text-kraken-beige font-mono font-bold mb-4">{slide.features?.healthAlerts?.title}</h3>
                    <div className="rounded-lg overflow-hidden mb-4">
                      <img 
                        src="/alerts.jpg" 
                        alt="Health Alerts Interface" 
                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick('/alerts.jpg', 'Health Alerts Interface')}
                      />
                    </div>
                    <div className="space-y-3">
                      {slide.features?.healthAlerts?.alerts?.map((alert: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-3 mt-1 text-green-400 flex-shrink-0" />
                          <p className="text-kraken-light font-mono text-sm">{alert}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Historical Trends */}
                  <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                    <h3 className="text-kraken-beige font-mono font-bold mb-4">{slide.features?.historicalTrends?.title}</h3>
                    <div className="rounded-lg h-32 overflow-hidden">
                      <img 
                        src="/historical trends.jpg" 
                        alt="Historical Trends Chart" 
                        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick('/historical trends.jpg', 'Historical Trends Chart')}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Right Column: NASA Map */}
                <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <h3 className="text-kraken-beige font-mono font-bold mb-4">{slide.features?.nasaMap?.title}</h3>
                  <div className="rounded-lg h-64 overflow-hidden mb-4">
                    <img 
                      src="/main.jpg" 
                      alt="Main Dashboard Interface" 
                      className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick('/main.jpg', 'Main Dashboard Interface')}
                    />
                  </div>
                  <p className="text-kraken-light font-mono text-sm">{slide.features?.nasaMap?.description}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'techStackWorkflow':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-kraken-beige mb-8 font-mono">
              {slide.combinedTitle}
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side: Tech Stack */}
              <div>
                <h2 className="text-3xl font-bold text-kraken-beige mb-6 font-mono">
                  {slide.techStack?.title}
                </h2>
                <div className="space-y-6">
                  {/* Frontend */}
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-kraken-beige font-mono mb-2">
                      Frontend: <span className="text-kraken-light font-normal">{slide.techStack?.technologies?.frontend}</span>
                    </h3>
                  </div>
                  
                  {/* Styling & UI */}
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-kraken-beige font-mono mb-2">
                      Styling & UI: <span className="text-kraken-light font-normal">{slide.techStack?.technologies?.styling}</span>
                    </h3>
                  </div>
                  
                  {/* Visualization */}
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-kraken-beige font-mono mb-2">
                      Visualization: <span className="text-kraken-light font-normal">{slide.techStack?.technologies?.visualization}</span>
                    </h3>
                  </div>
                  
                  {/* Backend */}
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-kraken-beige font-mono mb-2">
                      Backend: <span className="text-kraken-light font-normal">{slide.techStack?.technologies?.backend}</span>
                    </h3>
                  </div>
                  
                  {/* Deployment */}
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-kraken-beige font-mono mb-2">
                      Deployment: <span className="text-kraken-light font-normal">{slide.techStack?.technologies?.deployment}</span>
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Right Side: How It Works */}
              <div>
                <h2 className="text-3xl font-bold text-kraken-beige mb-6 font-mono">
                  {slide.workflow?.title}
                </h2>
                {/* Workflow Diagram */}
                <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-2xl p-6">
                  <div className="flex justify-center">
                    <img 
                      src="/flow.PNG" 
                      alt="How It Works Flow Diagram" 
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick('/flow.PNG', 'How It Works Flow Diagram')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'datasets':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-kraken-beige mb-8 font-mono">
              {slide.title}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {slide.dataSources?.map((source: any, index: number) => {
                const getImageSrc = (sourceName: string): string | undefined => {
                  if (sourceName.includes('TEMPO')) return '/tempo data.jpg';
                  if (sourceName.includes('EPA')) return '/epa image.jpg';
                  if (sourceName.includes('Weather')) return '/weather image.jpg';
                  return undefined;
                };
                
                const imageSrc = getImageSrc(source.name);
                
                return (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <div className="rounded-lg h-32 overflow-hidden mb-4">
                    {imageSrc ? (
                      <img 
                        src={imageSrc} 
                        alt={`${source.name} Interface`} 
                        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(imageSrc, `${source.name} Interface`)}
                      />
                    ) : (
                      <div className="bg-blue-900/40 rounded-lg h-full flex items-center justify-center">
                        <span className="text-kraken-beige font-mono font-bold">{source.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-kraken-beige font-mono font-bold mb-3">{source.name}</h3>
                  <p className="text-kraken-light font-mono text-sm mb-4">{source.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-kraken-beige/70 font-mono text-sm">Type:</span>
                      <span className="text-kraken-light font-mono text-sm">{source.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kraken-beige/70 font-mono text-sm">Coverage:</span>
                      <span className="text-kraken-light font-mono text-sm">{source.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kraken-beige/70 font-mono text-sm">Frequency:</span>
                      <span className="text-kraken-light font-mono text-sm">{source.frequency}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-kraken-beige font-mono font-bold mb-2 text-sm">
                      {source.pollutants ? 'Pollutants:' : 'Parameters:'}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(source.pollutants || source.parameters)?.map((item: string, idx: number) => (
                        <span key={idx} className="bg-kraken-beige/10 text-kraken-beige font-mono text-xs px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            
            <div className="mt-8 text-right text-kraken-beige/60 font-mono text-sm">
              4
            </div>
          </div>
        );

      case 'datasetDetails':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-kraken-beige mb-4 font-mono">
              {slide.title}
            </h1>
            <h2 className="text-xl text-kraken-light mb-8 font-mono opacity-90">
              {slide.subtitle}
            </h2>
            
            <div className="space-y-6">
              {slide.dataSources?.map((source: any, index: number) => (
                <div key={index} className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-xl p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Dataset Name & Why */}
                    <div>
                      <h3 className="text-2xl font-bold text-kraken-beige font-mono mb-3">{source.name}</h3>
                      <div className="mb-4">
                        <h4 className="text-kraken-beige font-mono font-bold mb-2 text-sm uppercase tracking-wider">Why We Use It:</h4>
                        <p className="text-kraken-light font-mono text-sm leading-relaxed">{source.why}</p>
                      </div>
                      {source.description && (
                        <p className="text-kraken-light/70 font-mono text-xs italic">{source.description}</p>
                      )}
                    </div>
                    
                    {/* Center: What It Gives Us */}
                    <div>
                      <h4 className="text-kraken-beige font-mono font-bold mb-3 text-sm uppercase tracking-wider">What It Gives Us:</h4>
                      <div className="space-y-2">
                        {source.whatItGives?.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start">
                            <div className="w-2 h-2 bg-kraken-beige rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-kraken-light font-mono text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right: How We Use It */}
                    <div>
                      <h4 className="text-kraken-beige font-mono font-bold mb-3 text-sm uppercase tracking-wider">How We Use It:</h4>
                      <div className="space-y-2">
                        {source.howWeUse?.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-kraken-light font-mono text-sm leading-relaxed">{item}</p>
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

      case 'usersImpact':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-kraken-beige mb-8 font-mono">
              {slide.title}
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left Side: User Groups & Impact Points */}
              <div className="space-y-8">
                {/* User Groups */}
                <div>
                  <div className="space-y-4">
                    {slide.userGroups?.map((group: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 bg-kraken-beige rounded-full mr-4 flex-shrink-0"></div>
                        <p className="text-2xl text-kraken-light font-mono">{group}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Impact Points */}
                <div className="mt-12">
                  <div className="space-y-6">
                    {slide.impacts?.map((impact: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="w-3 h-3 bg-kraken-beige rounded-full mt-3 mr-6 flex-shrink-0"></div>
                        <p className="text-xl text-kraken-light font-mono leading-relaxed">{impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Side: Overlapping Images */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Main Emergency Image */}
                  <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-2xl p-4">
                    <img 
                      src="/emergency.jpeg" 
                      alt="Emergency Response and Impact" 
                      className="w-80 h-60 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick('/emergency.jpeg', 'Emergency Response and Impact')}
                    />
                  </div>
                  
                  {/* Overlapping Fire Image */}
                  <div className="absolute -bottom-4 -right-4 bg-kraken-dark/80 border border-kraken-beige/30 rounded-xl p-3 shadow-2xl">
                    <img 
                      src="/fire.jpeg" 
                      alt="Environmental Emergency - Fire Impact" 
                      className="w-64 h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick('/fire.jpeg', 'Environmental Emergency - Fire Impact')}
                    />
                  </div>
                </div>
              </div>
              
            </div>
            
            <div className="mt-8 text-right text-kraken-beige/60 font-mono text-sm">
              6
            </div>
          </div>
        );

      case 'future':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-kraken-beige mb-8 font-mono">
              {slide.title}
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left Side: Future Goals */}
              <div className="space-y-6">
                {slide.futureGoals?.map((goal: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-3 h-3 bg-kraken-beige rounded-full mt-3 mr-6 flex-shrink-0"></div>
                    <p className="text-xl text-kraken-light font-mono leading-relaxed">{goal}</p>
                  </div>
                ))}
              </div>
              
              {/* Right Side: Satellite Images */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Main Satellite Image */}
                  <div className="bg-kraken-dark/60 border border-kraken-beige/20 rounded-2xl p-4">
                    <img 
                      src="/satlite.jpeg" 
                      alt="Satellite Technology" 
                      className="w-80 h-60 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick('/satlite.jpeg', 'Satellite Technology')}
                    />
                  </div>
                  
                  {/* Overlapping Second Satellite Image */}
                  <div className="absolute -bottom-4 -right-4 bg-kraken-dark/80 border border-kraken-beige/30 rounded-xl p-3 shadow-2xl">
                    <img 
                      src="/sat.jpeg" 
                      alt="Future Satellite Vision" 
                      className="w-48 h-36 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick('/sat.jpeg', 'Future Satellite Vision')}
                    />
                  </div>
                </div>
              </div>
              
            </div>
            
            <div className="mt-8 text-right text-kraken-beige/60 font-mono text-sm">
              7
            </div>
          </div>
        );


      // Legacy slide types (keeping for reference)
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

      {/* Image Popup Modal */}
      {imagePopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8" onClick={closeImagePopup}>
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImagePopup}
              className="absolute -top-4 -right-4 p-2 bg-kraken-dark/80 border border-kraken-beige/30 rounded-full hover:bg-kraken-dark hover:border-kraken-beige/50 transition-all duration-300 z-10"
            >
              <X className="w-6 h-6 text-kraken-beige" />
            </button>
            <img
              src={imagePopup.src}
              alt={imagePopup.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <p className="text-kraken-beige font-mono text-center">{imagePopup.alt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationSlideshow;
