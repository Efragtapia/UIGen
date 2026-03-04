"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current && typeof window !== 'undefined') {
        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
          console.log('Audio context not supported');
        }
      }
    };
    initAudio();
  }, []);

  // Create click sound effect
  const playClickSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Create a pleasant click sound
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }, []);

  // Enhanced toggle handler with animation and sound
  const handleToggle = useCallback((newValue: string) => {
    if (newValue === activeView) return;
    
    setIsAnimating(true);
    playClickSound();
    
    // Slight delay for visual feedback
    setTimeout(() => {
      setActiveView(newValue as "preview" | "code");
      setTimeout(() => setIsAnimating(false), 150);
    }, 50);
  }, [activeView, playClickSound]);

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
                    onValueChange={handleToggle}
                  >
                    <TabsList className={`bg-white/60 border border-neutral-200/60 p-0.5 h-9 shadow-sm transition-all duration-150 ${isAnimating ? 'scale-95 shadow-md' : 'scale-100'}`}>
                      <TabsTrigger 
                        value="preview" 
                        className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-600 px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-50 active:scale-95 active:bg-neutral-100"
                      >
                        Preview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="code" 
                        className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-600 px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-50 active:scale-95 active:bg-neutral-100"
                      >
                        Code
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <HeaderActions user={user} projectId={project?.id} />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-neutral-50 relative">
                  <div className={`absolute inset-0 transition-all duration-300 ${activeView === "preview" ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                    <div className="relative h-full bg-white">
                      <IterationTimeline />
                      <PreviewFrame />
                    </div>
                  </div>
                  <div className={`absolute inset-0 transition-all duration-300 ${activeView === "code" ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
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
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ChatProvider>
    </FileSystemProvider>
  );
}
