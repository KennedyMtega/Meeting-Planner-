import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TimelineView } from './components/TimelineView';
import { ChatWidget } from './components/ChatWidget';
import { generateAgendaFromFile, ChatSession } from './services/geminiService';
import { MeetingAgenda, UploadedFile } from './types';

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [agenda, setAgenda] = useState<MeetingAgenda | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];
      const newFile: UploadedFile = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: base64Data,
        size: file.size
      };

      setFiles(prev => [...prev, newFile]);

      try {
        // Generate Agenda
        const generatedAgenda = await generateAgendaFromFile(base64Data, newFile.type);
        setAgenda(generatedAgenda);

        // Initialize Chat Session
        const session = new ChatSession(base64Data, newFile.type);
        setChatSession(session);
        
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the document. Please ensure it's a valid file and try again.");
        // Remove the failed file
        setFiles(prev => prev.filter(f => f.name !== file.name));
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
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
        isProcessing={isProcessing}
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