"use client";

import { useState, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileSystemProvider } from "@/lib/contexts/file-system-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { FileTree } from "@/components/editor/FileTree";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderActions } from "@/components/HeaderActions";
import { IterationTimeline } from "@/components/IterationTimeline";

interface MainContentProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: any[];
    data: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function MainContent({ user, project }: MainContentProps) {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");
  const [isAnimating, setIsAnimating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (!audioContextRef.current && typeof window !== "undefined") {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  };

  // Play click sound
  const playClickSound = () => {
    initAudioContext();
    if (!audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContextRef.current.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  };

  // Enhanced toggle handler with animation and sound
  const handleToggle = (newView: "preview" | "code") => {
    if (newView === activeView || isAnimating) return;
    
    setIsAnimating(true);
    playClickSound();
    setActiveView(newView);
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <FileSystemProvider initialData={project?.data}>
      <ChatProvider projectId={project?.id} initialMessages={project?.messages}>
        <div className="h-screen w-screen overflow-hidden bg-neutral-50">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Chat */}
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <div className="h-full flex flex-col bg-white">
                {/* Chat Header */}
                <div className="h-14 flex items-center px-6 border-b border-neutral-200/60">
                  <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">React Component Generator</h1>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-hidden">
                  <ChatInterface />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[1px] bg-neutral-200 hover:bg-neutral-300 transition-colors" />

            {/* Right Panel - Preview/Code */}
            <ResizablePanel defaultSize={65}>
              <div className="h-full flex flex-col bg-white">
                {/* Top Bar */}
                <div className="h-14 border-b border-neutral-200/60 px-6 flex items-center justify-between bg-neutral-50/50">
                  <Tabs
                    value={activeView}
                    onValueChange={(v) => handleToggle(v as "preview" | "code")}
                  >
                    <TabsList className={`bg-white/60 border border-neutral-200/60 p-0.5 h-9 shadow-sm transition-all duration-300 hover:shadow-md ${isAnimating ? 'scale-[0.98]' : 'hover:scale-[1.02]'}`}>
                      <TabsTrigger 
                        value="preview" 
                        disabled={isAnimating}
                        className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.12)] text-neutral-600 px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:text-neutral-800 active:scale-95 data-[state=active]:scale-100"
                      >
                        Preview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="code" 
                        disabled={isAnimating}
                        className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.12)] text-neutral-600 px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:text-neutral-800 active:scale-95 data-[state=active]:scale-100"
                      >
                        Code
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <HeaderActions user={user} projectId={project?.id} />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-neutral-50">
                  <div className={`transition-all duration-300 ${isAnimating ? 'opacity-90 scale-[0.99]' : 'opacity-100 scale-100'}`}>
                    {activeView === "preview" ? (
                      <div className="relative h-full bg-white animate-in slide-in-from-right-2 duration-300">
                        <IterationTimeline />
                        <PreviewFrame />
                      </div>
                    ) : (
                      <div className="h-full animate-in slide-in-from-left-2 duration-300">
                        <ResizablePanelGroup
                          direction="horizontal"
                          className="h-full"
                        >
                          {/* File Tree */}
                          <ResizablePanel
                            defaultSize={30}
                            minSize={20}
                            maxSize={50}
                          >
                            <div className="h-full bg-neutral-50 border-r border-neutral-200">
                              <FileTree />
                            </div>
                          </ResizablePanel>

                          <ResizableHandle className="w-[1px] bg-neutral-200 hover:bg-neutral-300 transition-colors" />

                          {/* Code Editor */}
                          <ResizablePanel defaultSize={70}>
                            <div className="h-full bg-white">
                              <CodeEditor />
                            </div>
                          </ResizablePanel>
                        </ResizablePanelGroup>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ChatProvider>
    </FileSystemProvider>
  );
}
