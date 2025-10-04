import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface DataInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: number;
  unit: string;
  type: 'pm25' | 'pm10' | 'no2' | 'o3' | 'so2' | 'co' | 'aqi';
  icon: React.ReactNode;
  color: string;
}

const DataInfoModal: React.FC<DataInfoModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  unit,
  type,
  icon,
  color
}) => {
  if (!isOpen) return null;

  const getDetailedInfo = () => {
    switch (type) {
      case 'pm25':
        return {
          description: "Think of PM2.5 as invisible dust particles that are super tiny - about 30 times smaller than the width of your hair! They're so small they can sneak deep into your lungs and even get into your blood.",
          sources: "Car exhaust, smoke from fires, factory smokestacks, and dust kicked up by construction",
          healthEffects: value <= 12 ? "The air is really clean! Like breathing in a mountain forest." :
                        value <= 35.4 ? "Pretty good air. Most people won't notice anything, but if you have asthma, just keep an eye on how you feel." :
                        value <= 55.4 ? "The air is a bit hazy. If you have breathing problems or heart issues, maybe take it easy outside today." :
                        "The air is pretty dirty today. Everyone might feel it - like being in a smoky room. Time to stay inside!",
          recommendation: value <= 12 ? "Perfect day for a jog, bike ride, or playing outside with the kids!" :
                         value <= 35.4 ? "Go ahead and enjoy the outdoors! If you have asthma or allergies, just listen to your body." :
                         value <= 55.4 ? "Maybe do shorter activities outside, or exercise indoors instead. Kids and elderly folks should probably stay in." :
                         "Best to stay inside today. Close the windows, turn on the air purifier if you have one, and maybe skip that outdoor workout.",
          scale: "Clean air: 0-12, Pretty good: 12-35, Getting hazy: 35-55, Stay inside: 55+"
        };
      
      case 'pm10':
        return {
          description: "PM10 is like fine sand or dust particles floating in the air - bigger than PM2.5 but still tiny enough to get into your lungs. Think of it as the dust you might see in a sunbeam.",
          sources: "Dusty construction sites, dirt roads, farm fields, and windy desert areas",
          healthEffects: value <= 54 ? "The air is nice and clear! You probably won't even notice these particles." :
                        value <= 154 ? "There's a bit of dust in the air, but most people feel fine. If you're sensitive to dust, you might notice." :
                        value <= 254 ? "It's getting dusty out there. People with asthma or allergies might start coughing or sneezing." :
                        "Very dusty air today - like being in a dust storm. Everyone will probably feel it in their throat and eyes.",
          recommendation: value <= 54 ? "Great day to be outside! Go for that hike or bike ride." :
                         value <= 154 ? "Still good for most outdoor activities. If you're sensitive to dust, maybe keep it shorter." :
                         value <= 254 ? "Try to stay inside if you have breathing problems. Everyone else, maybe skip the long outdoor workout." :
                         "Stay indoors today. Close windows and wait for the dust to settle.",
          scale: "Clear: 0-54, A bit dusty: 55-154, Getting dusty: 155-254, Very dusty: 255+"
        };
      
      case 'no2':
        return {
          description: "NO₂ is that brownish gas you sometimes see in city smog. It's what gives polluted air that hazy brown color. Think of it as the 'exhaust smell' from cars and trucks that can make your throat scratchy.",
          sources: "Car and truck exhaust, power plants, and gas stoves",
          healthEffects: value <= 53 ? "The air smells fresh! No worries about exhaust fumes today." :
                        value <= 100 ? "There's a bit of exhaust in the air, but most people won't notice. If you have asthma, just pay attention to how you feel." :
                        value <= 360 ? "You might smell exhaust or notice the air looks a bit hazy. People with breathing problems might feel irritated." :
                        "Heavy exhaust fumes today - like standing behind a bus. Your throat and lungs will probably feel it.",
          recommendation: value <= 53 ? "Perfect for outdoor activities! The air is nice and clean." :
                         value <= 100 ? "Go ahead with your outdoor plans. If you have asthma, maybe avoid super busy streets." :
                         value <= 360 ? "Try to stay away from heavy traffic areas. Maybe exercise in a park instead of along a busy road." :
                         "Avoid busy roads and highways today. If you must go outside, try to stay away from car exhaust.",
          scale: "Fresh air: 0-53, Light exhaust: 54-100, Getting smoggy: 101-360, Heavy exhaust: 361+"
        };
      
      case 'o3':
        return {
          description: "Ozone down here at ground level is like nature's bleach - it's created when car exhaust and factory pollution 'cook' in the sunshine. It's the main ingredient in that thick, hazy smog you see on hot sunny days.",
          sources: "Car exhaust and factory pollution that gets 'cooked' by sunlight - that's why smog is worse on hot, sunny days",
          healthEffects: value <= 54 ? "Nice clean air! The sunshine isn't creating much smog today." :
                        value <= 70 ? "Just a little bit of smog forming. Most people feel fine, but if you're really sensitive to air pollution, you might notice." :
                        value <= 85 ? "It's getting smoggy out there. People with asthma or lung problems might feel like the air is 'sharp' or irritating." :
                        "Heavy smog day! The air feels thick and harsh - like breathing in a chemical smell. Everyone will probably feel it.",
          recommendation: value <= 54 ? "Great day to be outside! No smog to worry about." :
                         value <= 70 ? "Still good for outdoor fun. If you're super sensitive to pollution, just listen to your body." :
                         value <= 85 ? "If you have asthma or breathing problems, maybe stay inside during the hottest part of the day when smog is worst." :
                         "Stay indoors today, especially during the afternoon when the sun makes smog worse. If you must go out, early morning is better.",
          scale: "Clean: 0-54, Light smog: 55-70, Getting smoggy: 71-85, Heavy smog: 86+"
        };
      
      case 'so2':
        return {
          description: "SO₂ smells like rotten eggs or burnt matches. It's that sharp, stinky smell that comes from burning coal and oil. Think of it as the smell near old factories or when someone lights too many matches.",
          sources: "Coal power plants, oil refineries, and sometimes volcanoes (nature can be stinky too!)",
          healthEffects: value <= 35 ? "The air smells normal - no rotten egg smell today!" :
                        value <= 75 ? "There might be a slight chemical smell in the air. Most people won't notice, but if you have asthma, you might." :
                        value <= 185 ? "You might smell something like rotten eggs or chemicals. People with breathing problems will definitely notice." :
                        "Strong chemical smell in the air - like being near a factory. Everyone will smell it and feel it in their throat.",
          recommendation: value <= 35 ? "No worries about smelly air today - go enjoy the outdoors!" :
                         value <= 75 ? "Still fine for outdoor activities. If you have asthma, just pay attention to any throat irritation." :
                         value <= 185 ? "If you have asthma or breathing problems, maybe stay inside. The air might make you cough." :
                         "Stay indoors today - the air smells bad and will irritate everyone's throat and lungs.",
          scale: "No smell: 0-35, Slight smell: 36-75, Getting stinky: 76-185, Really stinky: 186+"
        };
      
      case 'co':
        return {
          description: "Carbon Monoxide is the sneaky, invisible gas that has no smell - it's what makes car exhaust dangerous in closed spaces. Think of it as the 'silent' part of car exhaust that can make you feel dizzy or sleepy.",
          sources: "Car exhaust, gas heaters, generators, and anything that burns fuel without enough air",
          healthEffects: value <= 4.4 ? "Very low levels - like being in fresh mountain air. No worries at all!" :
                        value <= 9.4 ? "Still pretty low. Most people feel fine, but if you have heart problems, just be aware." :
                        value <= 12.4 ? "Getting a bit higher. People with heart disease might feel tired or get headaches more easily." :
                        "High levels - like being in a garage with a car running. Everyone might feel dizzy or get headaches.",
          recommendation: value <= 4.4 ? "Perfect air for everyone! Go enjoy your outdoor activities." :
                         value <= 9.4 ? "Great for most people. If you have heart problems, just take it easy and listen to your body." :
                         value <= 12.4 ? "If you have heart disease, maybe stick to lighter activities today and avoid busy traffic areas." :
                         "Stay away from busy roads and parking garages today. Everyone should avoid heavy exercise outdoors.",
          scale: "Very safe: 0-4.4, Pretty safe: 4.5-9.4, Getting higher: 9.5-12.4, Too high: 12.5+"
        };
      
      case 'aqi':
        return {
          description: "The AQI is like a daily weather report, but for air pollution instead of rain or sunshine. Just like you check if you need an umbrella, you can check the AQI to see if you need to worry about the air quality today.",
          sources: "It's calculated by looking at all the different types of pollution in the air - dust, exhaust, smog, and chemical smells all mixed together",
          healthEffects: value <= 50 ? "The air is really clean today - like a fresh spring morning! Everyone can breathe easy." :
                        value <= 100 ? "Pretty good air quality. Most people feel great, but if you have asthma or allergies, just pay attention to how you feel." :
                        value <= 150 ? "The air is getting a bit polluted. People with breathing problems, heart issues, or kids and elderly folks might start to notice." :
                        value <= 200 ? "The air is definitely polluted today. Even healthy people might feel it - maybe a scratchy throat or tired feeling." :
                        value <= 300 ? "Really bad air day! Everyone will probably feel it - like being in a smoky room. Time to stay inside." :
                        "Emergency-level bad air! The air is dangerous for everyone - like being in heavy smoke. Stay inside and call a doctor if you feel sick.",
          recommendation: value <= 50 ? "Perfect day to go outside! Great for jogging, playing with kids, or having a picnic." :
                         value <= 100 ? "Good day for outdoor fun! If you have asthma or allergies, just listen to your body and come inside if you don't feel well." :
                         value <= 150 ? "If you have breathing problems, heart disease, or you're over 65, maybe stay inside today. Everyone else, try to keep outdoor activities shorter." :
                         value <= 200 ? "Everyone should limit time outside today. Maybe exercise indoors instead of going for that run." :
                         value <= 300 ? "Stay inside today! Close windows, use air purifiers if you have them, and definitely skip outdoor exercise." :
                         "This is an emergency air quality day - stay inside, keep windows closed, and call your doctor if you have trouble breathing.",
          scale: "Great air: 0-50, Pretty good: 51-100, Getting bad: 101-150, Bad air: 151-200, Really bad: 201-300, Emergency: 301+"
        };
      
      default:
        return {
          description: "Air quality measurement data",
          sources: "Various environmental monitoring sources",
          healthEffects: "Monitor air quality levels for health impacts",
          recommendation: "Stay informed about air quality conditions",
          scale: "Refer to EPA standards for interpretation"
        };
    }
  };

  const info = getDetailedInfo();
  
  const getStatusIcon = () => {
    if (type === 'aqi') {
      if (value <= 50) return <CheckCircle className="w-6 h-6 text-green-400" />;
      if (value <= 100) return <Info className="w-6 h-6 text-blue-400" />;
      if (value <= 150) return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      return <AlertTriangle className="w-6 h-6 text-red-400" />;
    }
    
    // For other pollutants, use general thresholds
    const isGood = (type === 'pm25' && value <= 12) || 
                   (type === 'pm10' && value <= 54) || 
                   (type === 'no2' && value <= 53) || 
                   (type === 'o3' && value <= 54) || 
                   (type === 'so2' && value <= 35) || 
                   (type === 'co' && value <= 4.4);
    
    const isModerate = (type === 'pm25' && value <= 35.4) || 
                       (type === 'pm10' && value <= 154) || 
                       (type === 'no2' && value <= 100) || 
                       (type === 'o3' && value <= 70) || 
                       (type === 'so2' && value <= 75) || 
                       (type === 'co' && value <= 9.4);
    
    if (isGood) return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (isModerate) return <Info className="w-6 h-6 text-blue-400" />;
    return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-kraken-beige border-opacity-20">
          <div className="flex items-center space-x-4">
            <div className={`${color} flex items-center space-x-3`}>
              {icon}
              <div>
                <h2 className="text-2xl font-bold text-kraken-light font-mono">{title}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-3xl font-bold text-kraken-beige font-mono">{value.toFixed(1)}</span>
                  <span className="text-lg text-kraken-light opacity-70 font-mono">{unit}</span>
                  {getStatusIcon()}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-kraken-light hover:text-kraken-beige transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">What is {title}?</h3>
            <p className="text-kraken-light font-mono text-sm leading-relaxed">{info.description}</p>
          </div>

          {/* Sources */}
          <div>
            <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">Common Sources</h3>
            <p className="text-kraken-light font-mono text-sm leading-relaxed">{info.sources}</p>
          </div>

          {/* Health Effects */}
          <div>
            <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">Current Level Health Impact</h3>
            <div className="bg-kraken-dark bg-opacity-50 rounded-lg p-4 border-l-4 border-kraken-beige">
              <p className="text-kraken-light font-mono text-sm leading-relaxed">{info.healthEffects}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">What Should You Do?</h3>
            <div className="bg-kraken-beige bg-opacity-10 rounded-lg p-4">
              <p className="text-kraken-light font-mono text-sm leading-relaxed font-medium">{info.recommendation}</p>
            </div>
          </div>

          {/* Scale Reference */}
          <div>
            <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">Reference Scale</h3>
            <p className="text-kraken-light font-mono text-xs leading-relaxed opacity-80">{info.scale}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-kraken-beige border-opacity-20">
          <div className="flex items-center justify-between">
            <p className="text-kraken-light font-mono text-xs opacity-60">
              Data sourced from NASA TEMPO satellite and EPA standards
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded font-mono text-sm hover:bg-opacity-30 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInfoModal;
