import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAppContext } from '../contexts/AppContext';
import { agentTemplates } from '../data/agentTemplates';

const CreateAgentPage = () => {
  const navigate = useNavigate();
  const { createAgent } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [agentName, setAgentName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  
  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'CONSERVATIVE':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'AGGRESSIVE':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'CHAOTIC':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'INFORMATIVE':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  const handleTemplateSelect = (type: string) => {
    const template = agentTemplates.find(t => t.type === type);
    if (template) {
      setSelectedTemplate(type);
      setPrompt(template.prompt);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedTemplate || !agentName || !prompt) return;
    
    setLoading(true);
    
    const template = agentTemplates.find(t => t.type === selectedTemplate);
    if (!template) return;
    
    const newAgent = {
      name: agentName,
      avatar: `/avatars/${selectedTemplate.toLowerCase()}.png`,
      balance: 1000,
      holdings: [],
      winRate: 0,
      prompt: prompt,
      level: 1,
      xp: 0,
      skills: [],
      type: selectedTemplate
    };
    
    // Simulate API call
    setTimeout(() => {
      createAgent(newAgent);
      navigate('/agents');
      setLoading(false);
    }, 2000);
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/agents')}
          className="mr-4 p-2 hover:bg-gray-800 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold">Create New Agent</h1>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
            step >= 1 ? 'bg-primary' : 'bg-gray-700'
          } text-white font-bold`}>
            1
          </div>
          <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`}></div>
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
            step >= 2 ? 'bg-primary' : 'bg-gray-700'
          } text-white font-bold`}>
            2
          </div>
          <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-gray-700'}`}></div>
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
            step >= 3 ? 'bg-primary' : 'bg-gray-700'
          } text-white font-bold`}>
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-primary font-medium">Select Template</span>
          <span className={step >= 2 ? 'text-primary font-medium' : 'text-gray-500'}>
            Customize
          </span>
          <span className={step >= 3 ? 'text-primary font-medium' : 'text-gray-500'}>
            Generate Wallet & NFT
          </span>
        </div>
      </div>
      
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <h2 className="text-xl font-bold mb-4">Choose a Strategy Template</h2>
          <p className="text-gray-400 mb-6">
            Select a starting strategy for your agent. You can customize this further in the next step.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentTemplates.map((template) => (
              <Card 
                key={template.type}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  selectedTemplate === template.type ? 'border-2 border-primary' : ''
                }`}
                onClick={() => handleTemplateSelect(template.type)}
              >
                <div className="flex gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${template.color} h-fit`}>
                    {getTemplateIcon(template.type)}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-1">{template.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                    
                    <Button 
                      text={selectedTemplate === template.type ? 'Selected' : 'Select'} 
                      variant={selectedTemplate === template.type ? 'primary' : 'outline'}
                      size="sm"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button
              text="Continue"
              variant="primary"
              disabled={!selectedTemplate}
              onClick={() => selectedTemplate && setStep(2)}
            />
          </div>
        </motion.div>
      )}
      
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <h2 className="text-xl font-bold mb-4">Customize Your Agent</h2>
          <p className="text-gray-400 mb-6">
            Give your agent a name and customize its strategy prompt.
          </p>
          
          <Card className="p-6">
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Agent Name
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-primary focus:outline-none"
                placeholder="Enter a name for your agent..."
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Strategy Prompt
              </label>
              <textarea
                className="w-full h-40 p-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-primary focus:outline-none"
                placeholder="Describe your agent's trading strategy and behavior..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <p className="text-gray-500 text-sm mt-2">
                This prompt will guide your agent's behavior and decision-making process during games.
              </p>
            </div>
          </Card>
          
          <div className="mt-8 flex justify-between">
            <Button
              text="Back"
              variant="outline"
              onClick={() => setStep(1)}
            />
            <Button
              text="Continue"
              variant="primary"
              disabled={!agentName || !prompt}
              onClick={() => setStep(3)}
            />
          </div>
        </motion.div>
      )}
      
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <h2 className="text-xl font-bold mb-4">Generate Wallet & NFT</h2>
          <p className="text-gray-400 mb-6">
            We'll automatically generate a blockchain wallet and mint a unique NFT for your agent.
          </p>
          
          <Card className="p-6">
            <div className="text-center py-8">
              <motion.div
                className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-accent/50 animate-pulse" />
                {selectedTemplate && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {selectedTemplate && getTemplateIcon(selectedTemplate)}
                  </div>
                )}
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">{agentName || "Your Agent"}</h3>
              <p className="text-gray-400 mb-6">
                {selectedTemplate && agentTemplates.find(t => t.type === selectedTemplate)?.name} Strategy
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-400">Wallet Address</p>
                  <p className="font-mono">0x71C...a9F2</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-400">Agent NFT</p>
                  <p className="font-mono">AGENT#{Math.floor(Math.random() * 10000)}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-400">Initial Balance</p>
                  <p className="font-mono">1,000 USDT</p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="mt-8 flex justify-between">
            <Button
              text="Back"
              variant="outline"
              onClick={() => setStep(2)}
            />
            <Button
              text={loading ? "Creating Agent..." : "Create Agent"}
              variant="primary"
              isLoading={loading}
              onClick={handleSubmit}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CreateAgentPage;
