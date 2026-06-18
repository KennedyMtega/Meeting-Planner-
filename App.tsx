import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TimelineView } from './components/TimelineView';
import { ChatWidget } from './components/ChatWidget';
import { generateAgenda, ChatSession } from './services/geminiService';
import { MeetingAgenda, UploadedFile } from './types';

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [agenda, setAgenda] = useState<MeetingAgenda | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('auto');

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];
      const newFile: UploadedFile = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: base64Data,
        size: file.size
      };
      setFiles(prev => [...prev, newFile]);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAgenda = async () => {
    // Check if we can generate: either files exist, OR a template other than 'auto' is selected
    if (files.length === 0 && selectedTemplateId === 'auto') return;
    
    setIsProcessing(true);
    setAgenda(null); // Clear previous agenda while loading
    
    try {
      // Generate Agenda
      const generatedAgenda = await generateAgenda(files, selectedTemplateId);
      setAgenda(generatedAgenda);

      // Initialize Chat Session with files and the generated agenda as context
      const session = new ChatSession(files, generatedAgenda);
      setChatSession(session);
      
    } catch (error) {
      console.error("Error generating agenda:", error);
      alert("Failed to generate agenda. Please check the inputs and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1 && selectedTemplateId === 'auto') { 
        // If we remove the last file and no template is forced, clear agenda
        setAgenda(null);
        setChatSession(null);
    }
  };
  
  const handleUpdateAgenda = (updatedAgenda: MeetingAgenda) => {
    setAgenda(updatedAgenda);
  };

  return (
    <div className="flex h-full w-full bg-slate-50">
      <Sidebar 
        files={files} 
        onFileUpload={handleFileUpload} 
        onRemoveFile={handleRemoveFile}
        onGenerate={handleGenerateAgenda}
        isProcessing={isProcessing}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
      />
      <main className="flex-1 h-full relative">
        <TimelineView 
          agenda={agenda} 
          isLoading={isProcessing} 
          onUpdateAgenda={handleUpdateAgenda}
        />
        <ChatWidget chatSession={chatSession} hasFile={!!agenda} />
      </main>
    </div>
  );
}