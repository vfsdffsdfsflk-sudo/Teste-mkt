/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Target, 
  Timer, 
  BookOpen, 
  Swords, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  History, 
  Globe, 
  Calculator, 
  Book, 
  Languages, 
  Atom, 
  Upload, 
  Settings,
  Trophy,
  Info,
  Lightbulb,
  ArrowRight,
  Check,
  Brain,
  Eye,
  EyeOff,
  RotateCcw,
  Play,
  Pause,
  X,
  FileText,
  Maximize2,
  LayoutDashboard,
  MessageSquare,
  Send,
  Dumbbell,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
type Screen = 'onboarding' | 'hq' | 'mission' | 'arena' | 'profile' | 'flashcards' | 'focus' | 'map' | 'chat' | 'simulator';

interface UserProfile {
  warName: string;
  exam: string;
  level: string;
  studyHours: number;
  difficulties: string[];
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
}

interface MapNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: number;
}

interface MapLink extends d3.SimulationLinkDatum<MapNode> {
  source: string;
  target: string;
  value: number;
}

// --- Components ---

const Header = React.memo(({ screen, setScreen, onFocusToggle, warName }: { screen: Screen, setScreen: (s: Screen) => void, onFocusToggle?: () => void, warName?: string }) => (
  <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-xl z-50 border-b border-primary/10">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-surface-variant border border-primary/20 flex items-center justify-center overflow-hidden">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGAehJ1a3vPGngxw39F7BF3LRUlbhVrSgxMibiyTBvFRjtu0qheXr6RHdOs4hMQULfgDatDEWGZoPMIdI-2sSY-47KbeIq-qf4APQvsyPk3G9Mf4TfZhRCbHHGhQZPryFrLSxNjGwXbTaPsWNGW7g4XBc0Qz1O5JJcwXgtOtZ6x5LQ76es0NBUEoDlSEujOI5rk6D8dCCe_zDoKKEiRcPixXv78iqyBRetm9KM3_qZwl4ziiREqFPEpbjXZIPGVYqT07hts5GCGQM" 
          alt="Insígnia" 
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
      </div>
      <div>
        <h1 className="font-headline font-black tracking-tighter text-primary text-lg uppercase">CENTRO DE COMANDO</h1>
        <p className="font-label text-[10px] tracking-widest uppercase text-outline">SOLDADO • {warName || 'RECRUTA 01'}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      {screen !== 'focus' && (
        <button 
          onClick={onFocusToggle}
          className="flex items-center gap-2 px-3 py-1.5 bg-tertiary/10 border border-tertiary/20 rounded-lg text-tertiary hover:bg-tertiary/20 transition-all"
        >
          <Eye className="w-4 h-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">MODO FOCO</span>
        </button>
      )}
      <button className="p-2 rounded-xl hover:bg-primary/10 transition-colors">
        <Settings className="text-primary w-5 h-5" />
      </button>
    </div>
  </header>
));

const BottomNav = React.memo(({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => (
  <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-primary/15 flex justify-around items-center h-20 pb-4 px-2 shadow-2xl">
    <button 
      onClick={() => setScreen('hq')}
      className={`flex flex-col items-center justify-center transition-all ${currentScreen === 'hq' ? 'text-tertiary scale-110' : 'text-secondary/50 hover:text-primary'}`}
    >
      <LayoutDashboard className="w-6 h-6" />
      <span className="text-[10px] font-bold tracking-widest uppercase mt-1">HQ</span>
    </button>
    <button 
      onClick={() => setScreen('flashcards')}
      className={`flex flex-col items-center justify-center transition-all ${currentScreen === 'flashcards' ? 'text-tertiary scale-110' : 'text-secondary/50 hover:text-primary'}`}
    >
      <Brain className="w-6 h-6" />
      <span className="text-[10px] font-bold tracking-widest uppercase mt-1">CARDS</span>
    </button>
    <button 
      onClick={() => setScreen('arena')}
      className={`flex flex-col items-center justify-center transition-all ${currentScreen === 'arena' ? 'text-tertiary scale-110' : 'text-secondary/50 hover:text-primary'}`}
    >
      <Swords className="w-6 h-6" />
      <span className="text-[10px] font-bold tracking-widest uppercase mt-1">ARENA</span>
    </button>
    <button 
      onClick={() => setScreen('chat')}
      className={`flex flex-col items-center justify-center transition-all ${currentScreen === 'chat' ? 'text-tertiary scale-110' : 'text-secondary/50 hover:text-primary'}`}
    >
      <MessageSquare className="w-6 h-6" />
      <span className="text-[10px] font-bold tracking-widest uppercase mt-1">ASSISTENTE</span>
    </button>
    <button 
      onClick={() => setScreen('profile')}
      className={`flex flex-col items-center justify-center transition-all ${currentScreen === 'profile' ? 'text-tertiary scale-110' : 'text-secondary/50 hover:text-primary'}`}
    >
      <User className="w-6 h-6" />
      <span className="text-[10px] font-bold tracking-widest uppercase mt-1">PERFIL</span>
    </button>
  </nav>
));


// --- Screens ---

const Onboarding = React.memo(({ onComplete }: { onComplete: (p: UserProfile) => void }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    warName: '',
    exam: 'ESA',
    level: 'Iniciante',
    studyHours: 4,
    difficulties: ['Matemática', 'Física']
  });


  const exams = [
    { id: 'ESA', label: 'Sargento' },
    { id: 'EsPCEx', label: 'Oficial' },
    { id: 'EEAR', label: 'Especialista' },
    { id: 'EN', label: 'Naval' }
  ];

  const levels = ['Recruta', 'Iniciante', 'Intermediário', 'Avançado'];
  
  const subjects = [
    { name: 'Matemática', icon: <Calculator className="w-5 h-5" /> },
    { name: 'Português', icon: <Book className="w-5 h-5" /> },
    { name: 'Inglês', icon: <Languages className="w-5 h-5" /> },
    { name: 'História', icon: <History className="w-5 h-5" /> },
    { name: 'Geografia', icon: <Globe className="w-5 h-5" /> },
    { name: 'Física', icon: <Atom className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center camo-overlay">
      <div className="max-w-5xl w-full grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 flex flex-col items-start space-y-8">
          <div className="space-y-4">
            <span className="font-label text-primary tracking-[0.2em] text-xs font-black uppercase">Fase de Preparação</span>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-background leading-tight tracking-tight">
              MISSÃO INICIAL: <br/>
              <span className="text-primary italic">DEFINE SEU PERFIL</span>
            </h1>
            <p className="text-outline text-lg max-w-md border-l-2 border-primary/30 pl-4 py-2">
              A disciplina é a alma de um exército. Para vencer, o seu plano deve ser tão preciso quanto um disparo de elite.
            </p>
          </div>
          <div className="relative w-full aspect-square max-w-[320px] group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-tertiary/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10 w-full h-full glass-panel border border-outline/30 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkQVfA2YfR89HAJ3E6DRllBx2HZs_WG0zx7SzzkYGFdwUku6S1hIB88y2MbVirnViHrmcdxRWd_wPKgFPadBGUHYqaozvrPIDbqhfue-kj0J0ujNOmuXximCqAB5Ldw3liQ2Yc0eCEblu36y4a0Jd-3C1IrF4hisM4S8foApHl49LCwE3P2AB35tJDir7Ts8LEaOaQ9vKl12MaviA2hqhFep8XsqNidj88Zhqn_-hP0kMJ4AVqLbOUiqe6LSV5sziXmTVp4kTG5V0" 
                alt="Military Insignia" 
                className="w-4/5 h-4/5 object-contain opacity-80 mix-blend-lighten grayscale hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/40"></div>
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/40"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/40"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/40"></div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 glass-panel rounded-[2rem] p-8 md:p-12 border border-outline/20 relative overflow-hidden"
        >
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-surface-variant'}`} />
            ))}
          </div>
          <span className="text-[10px] text-primary font-black uppercase tracking-widest">Passo 0{step} / 05</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section 
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Identificação</label>
                <h3 className="font-headline text-2xl font-bold">Qual o seu Nome de Guerra?</h3>
              </div>
              <input 
                type="text"
                placeholder="Ex: SILVA, OLIVEIRA..."
                value={profile.warName}
                onChange={(e) => setProfile({ ...profile, warName: e.target.value.toUpperCase() })}
                className="w-full bg-surface border border-outline/30 rounded-xl px-6 py-4 text-lg font-headline font-bold focus:border-primary focus:outline-none transition-all"
              />
              <p className="text-xs text-outline italic">Este nome será usado em todas as comunicações táticas.</p>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Objetivo</label>
                <h3 className="font-headline text-2xl font-bold">Qual o seu concurso alvo?</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {exams.map(exam => (
                  <button
                    key={exam.id}
                    onClick={() => setProfile({ ...profile, exam: exam.id })}
                    className={`p-4 border rounded-xl text-left transition-all ${profile.exam === exam.id ? 'border-primary bg-primary/10' : 'border-outline/30 bg-surface/50 hover:bg-surface-variant'}`}
                  >
                    <p className="font-headline font-extrabold text-lg">{exam.id}</p>
                    <p className="text-[10px] text-outline uppercase mt-1">{exam.label}</p>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {step === 3 && (
            <motion.section 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Graduação Atual</label>
                <h3 className="font-headline text-2xl font-bold">Nível de conhecimento</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {levels.map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setProfile({ ...profile, level: lvl })}
                    className={`px-6 py-3 rounded-full border text-sm font-semibold transition-all ${profile.level === lvl ? 'border-primary bg-primary/10 text-primary' : 'border-outline/30 text-outline hover:border-primary'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {step === 4 && (
            <motion.section 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-primary tracking-widest">Carga Horária</label>
                  <h3 className="font-headline text-2xl font-bold">Horas de estudo diário</h3>
                </div>
                <span className="font-headline text-4xl font-black text-tertiary">{profile.studyHours}h</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={profile.studyHours}
                onChange={(e) => setProfile({ ...profile, studyHours: parseInt(e.target.value) })}
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-bold text-outline uppercase tracking-widest">
                <span>Mínimo (1h)</span>
                <span>Intensivo (12h+)</span>
              </div>
            </motion.section>
          )}

          {step === 5 && (
            <motion.section 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Pontos Críticos</label>
                <h3 className="font-headline text-2xl font-bold">Top Dificuldades</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {subjects.map(sub => (
                  <button
                    key={sub.name}
                    onClick={() => {
                      const exists = profile.difficulties.includes(sub.name);
                      setProfile({
                        ...profile,
                        difficulties: exists 
                          ? profile.difficulties.filter(d => d !== sub.name)
                          : [...profile.difficulties, sub.name]
                      });
                    }}
                    className={`p-4 border rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-all ${profile.difficulties.includes(sub.name) ? 'border-primary bg-primary/10 text-primary' : 'border-outline/30 text-outline hover:border-primary'}`}
                  >
                    {sub.icon}
                    {sub.name}
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 border border-outline/30 rounded-xl font-headline font-black text-sm tracking-widest uppercase hover:bg-surface-variant"
            >
              Voltar
            </button>
          )}
          <button 
            onClick={() => {
              if (step < 5) setStep(step + 1);
              else onComplete(profile);
            }}
            disabled={step === 1 && !profile.warName.trim()}
            className="flex-[2] bg-gradient-to-r from-primary to-primary/80 text-on-primary py-4 rounded-xl font-headline font-black text-sm tracking-widest uppercase shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {step === 5 ? 'GERAR PLANO DE COMBATE' : 'PRÓXIMO PASSO'}
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
});

const HQ = React.memo(({ onUpload, onStartReview, onStartSimulator }: { onUpload: (file: File) => void, onStartReview: () => void, onStartSimulator: () => void }) => (
  <div className="space-y-10 pb-24">
    <section className="relative overflow-hidden p-6 rounded-xl bg-surface border border-primary/10 group">
      <div className="flex items-start gap-4">
        <Zap className="text-tertiary w-8 h-8 shrink-0" />
        <div>
          <span className="font-headline font-bold text-xs tracking-[0.2em] text-tertiary uppercase">IA ANALYTICS INBOUND</span>
          <p className="mt-1 text-on-background font-medium leading-relaxed">
            IA SUGERE: Focar em <span className="text-primary font-bold">Português</span> hoje baseado no seu simulado de ontem. Sua taxa de acerto em Sintaxe caiu 15%.
          </p>
          <button 
            onClick={onStartSimulator}
            className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
          >
            <Swords className="w-3 h-3" /> Iniciar Simulado Tático Agora
          </button>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-panel p-8 rounded-xl border border-primary/20 bg-primary/5 flex flex-col justify-between group hover:bg-primary/10 transition-all">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
            <Upload className="w-7 h-7" />
          </div>
          <div className="text-left">
            <p className="font-headline font-bold text-lg">Upload PDF IA</p>
            <p className="text-xs text-outline">Converta materiais em flashcards e mapas</p>
          </div>
        </div>
        <label className="cursor-pointer bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-sm tracking-widest uppercase text-center hover:brightness-110 transition-all">
          SELECIONAR ARQUIVO
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-tertiary/20 bg-tertiary/5 flex flex-col justify-between group hover:bg-tertiary/10 transition-all">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-14 h-14 rounded-xl bg-tertiary flex items-center justify-center text-on-tertiary shadow-lg shadow-tertiary/20">
            <Brain className="w-7 h-7" />
          </div>
          <div className="text-left">
            <p className="font-headline font-bold text-lg">Revisão Ativa</p>
            <p className="text-xs text-outline">Pratique com seus flashcards gerados</p>
          </div>
        </div>
        <button 
          onClick={() => onStartReview()}
          className="bg-tertiary text-on-tertiary px-6 py-3 rounded-lg font-bold text-sm tracking-widest uppercase hover:brightness-110 transition-all"
        >
          INICIAR REVISÃO
        </button>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-outline/20 bg-surface flex flex-col justify-between group hover:border-primary/40 transition-all md:col-span-2">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-14 h-14 rounded-xl bg-surface-variant flex items-center justify-center text-primary shadow-lg">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div className="text-left">
            <p className="font-headline font-bold text-lg">Treinamento Físico (TAF)</p>
            <p className="text-xs text-outline">Dicas de corrida, flexão e barra fixa para o seu concurso</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 p-3 bg-background/50 rounded-lg border border-outline/10 text-center">
            <p className="text-[10px] font-black text-primary uppercase">Corrida</p>
            <p className="text-sm font-bold">12min / 2.4km</p>
          </div>
          <div className="flex-1 p-3 bg-background/50 rounded-lg border border-outline/10 text-center">
            <p className="text-[10px] font-black text-primary uppercase">Flexão</p>
            <p className="text-sm font-bold">30 Reps</p>
          </div>
          <div className="flex-1 p-3 bg-background/50 rounded-lg border border-outline/10 text-center">
            <p className="text-[10px] font-black text-primary uppercase">Barra</p>
            <p className="text-sm font-bold">3 Reps</p>
          </div>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex justify-between items-end">
        <h2 className="font-headline font-extrabold text-2xl tracking-tight">CRONOGRAMA SEMANAL</h2>
        <span className="text-[10px] tracking-widest text-outline uppercase">MARÇO, SEMANA 12</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {[18, 19, 20, 21, 22, 23, 24].map((day, i) => (
          <div 
            key={day} 
            className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${i === 1 ? 'bg-primary/20 border-primary shadow-lg -mt-2 h-24' : 'bg-surface border-outline/20 opacity-60'}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-tighter">{['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'][i]}</span>
            <span className="text-xl font-black">{day}</span>
            {i === 1 && <div className="w-1 h-1 bg-tertiary rounded-full mt-1" />}
          </div>
        ))}
      </div>
    </section>
  </div>
));

const Arena = React.memo(() => {
  const [answered, setAnswered] = useState(false);
  
  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-surface-variant/30 p-6 rounded-xl border border-outline/15 flex flex-col items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.2em] text-outline uppercase">Tempo Restante</span>
          <div className="text-4xl font-headline font-black text-tertiary">08:42 <span className="text-xs text-outline">MINS</span></div>
          <div className="w-full h-1 bg-surface-variant mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-tertiary w-3/4" />
          </div>
        </div>
        <div className="flex-1 bg-surface-variant/30 p-6 rounded-xl border border-outline/15 flex flex-col gap-4">
          <span className="text-[10px] font-black tracking-[0.2em] text-outline uppercase">Objetivos Concluídos</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-sm ${i <= 3 ? 'bg-primary' : 'bg-surface-variant'}`} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-primary">
            <span>PROGRESSO DA MISSÃO</span>
            <span>60%</span>
          </div>
        </div>
      </div>

      <div className="pl-3 border-l-4 border-primary">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-2">Assunto: Matemática Balística Avançada</p>
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold leading-tight">
          Calcule o deslocamento vertical (y) de um projétil em t = 4s, dada uma velocidade inicial de 80m/s a um ângulo de 30°. Desconsidere a resistência do ar.
        </h1>
      </div>

      <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-surface-container-lowest border border-outline/10 shadow-inner group">
        <img 
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-700" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC73s064LjpzckUNxn8YESqzb20C43JiiwMsLbcUD4HpbeljiYN7pLCs0wot-GGPLQlMrnAtqNcHajUkNZTURt-plRqMP3ClKoOnPboJHHyGv35Xb25D7EdvD3qeEjW-Eb5Sn5WSj7tutF2Xcl51j4rbva1Mh2Ll74i2AUnzqzZJYu09Mf2aFbXABFOIqCBBayfDqC-fhWrhtxtwDkwojalLRIwRwVIZdTNMOi8F8LxC8QpKPR-nFdyGVEDc-WZlcfa8WWNqN0xEjU" 
          alt="Ilustração Tática"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-6 flex items-center gap-2">
          <Info className="text-primary w-4 h-4" />
          <span className="text-[10px] font-label font-semibold tracking-wider text-outline">REFERÊNCIA: FÓRMULA UNIDADE V-2</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {['80 metros exatos', '81.6 metros', '92.4 metros', '120.0 metros', '78.2 metros'].map((opt, i) => (
          <button 
            key={i}
            onClick={() => setAnswered(true)}
            className={`group flex items-center text-left p-1 rounded-lg border transition-all ${answered && i === 1 ? 'bg-primary/20 border-primary' : 'bg-surface border-transparent hover:bg-surface-variant'}`}
          >
            <div className={`w-12 h-12 flex items-center justify-center font-headline font-black text-lg rounded-sm ${answered && i === 1 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-outline group-hover:text-primary'}`}>
              {String.fromCharCode(65 + i)}
            </div>
            <span className={`flex-1 px-6 font-body font-medium ${answered && i === 1 ? 'text-primary font-bold' : 'text-on-background/80'}`}>{opt}</span>
            {answered && i === 1 && <CheckCircle2 className="text-primary w-5 h-5 mr-4" />}
          </button>
        ))}
      </div>

      {answered && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-surface rounded-xl border border-primary/20 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center bg-primary/10">
              <CheckCircle2 className="text-primary w-12 h-12" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-headline font-black text-primary tracking-tighter">CORRETO</h2>
              <p className="text-outline font-body mt-1">Sua análise tática foi impecável. A aplicação da fórmula de lançamento oblíquo foi executada com precisão militar.</p>
              <div className="flex gap-4 mt-6">
                <button className="px-6 py-3 bg-primary text-on-primary font-headline font-bold text-xs tracking-widest uppercase rounded-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> EXPLICAÇÃO IA
                </button>
                <button className="px-6 py-3 border border-outline/30 text-on-background font-headline font-bold text-xs tracking-widest uppercase rounded-sm flex items-center gap-2">
                  PRÓXIMA MISSÃO <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
});

const Flashcards = React.memo(({ cards, onToggleKnown }: { cards: Flashcard[], onToggleKnown: (id: string) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = cards[currentIndex];

  if (!card) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <Brain className="w-16 h-16 text-outline/30" />
      <p className="text-outline italic">Nenhum card disponível. Faça upload de um PDF para gerar novos cards!</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="font-headline font-black text-2xl uppercase tracking-tight">REVISÃO ATIVA</h2>
        <span className="text-xs font-bold text-outline uppercase tracking-widest">{currentIndex + 1} / {cards.length} CARDS</span>
      </div>

      <div className="perspective-1000 h-[400px] w-full max-w-xl mx-auto">
        <motion.div 
          className="relative w-full h-full cursor-pointer preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden glass-panel rounded-3xl border-2 border-primary/20 flex flex-col items-center justify-center p-12 text-center shadow-2xl">
            <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-6">PERGUNTA</span>
            <h3 className="text-2xl font-headline font-bold leading-tight">{card.front}</h3>
            <p className="mt-12 text-outline text-xs uppercase tracking-widest animate-pulse">Clique para revelar</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden glass-panel rounded-3xl border-2 border-tertiary/20 flex flex-col items-center justify-center p-12 text-center shadow-2xl rotate-y-180">
            <span className="text-[10px] font-black text-tertiary tracking-[0.3em] uppercase mb-6">RESPOSTA</span>
            <p className="text-xl font-body leading-relaxed">{card.back}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-6">
        <button 
          onClick={() => {
            onToggleKnown(card.id);
            if (currentIndex < cards.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setIsFlipped(false);
            }
          }}
          className={`p-6 rounded-full border-2 transition-all ${card.known ? 'bg-primary text-on-primary border-primary' : 'border-outline/20 text-outline hover:border-primary hover:text-primary'}`}
        >
          <Check className="w-8 h-8" />
        </button>
        <button 
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setIsFlipped(false);
            }
          }}
          className="p-6 rounded-full border-2 border-outline/20 text-outline hover:border-tertiary hover:text-tertiary transition-all"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
});

const FocusMode = React.memo(({ onExit }: { onExit: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6"
    >
      <button 
        onClick={onExit}
        className="absolute top-8 right-8 p-3 rounded-full bg-surface-variant hover:bg-primary/20 transition-all"
      >
        <X className="w-6 h-6 text-primary" />
      </button>

      <div className="text-center space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-black text-primary tracking-[0.4em] uppercase">MODO DE FOCO ATIVADO</span>
          <h2 className="text-9xl font-headline font-black tracking-tighter text-on-background tabular-nums">
            {formatTime(timeLeft)}
          </h2>
        </div>

        <div className="flex gap-6 justify-center">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-all"
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button 
            onClick={() => {
              setIsActive(false);
              setTimeLeft(25 * 60);
            }}
            className="w-20 h-20 rounded-full bg-surface-variant text-outline flex items-center justify-center hover:bg-tertiary/20 hover:text-tertiary transition-all"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>

        <div className="max-w-md mx-auto p-6 glass-panel border border-primary/10 rounded-2xl">
          <p className="text-outline italic text-sm">"A disciplina é a alma de um exército. Ela torna pequenos grupos formidáveis, fornece sucesso aos fracos e estima a todos."</p>
        </div>
      </div>
    </motion.div>
  );
});

const InteractiveMap = React.memo(({ data }: { data: { nodes: MapNode[], links: MapLink[] } }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height: width * 0.6 }); // Maintain aspect ratio
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', 'var(--color-primary)')
      .attr('stroke-opacity', 0.3)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    const node = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('circle')
      .attr('r', 8)
      .attr('fill', (d: any) => d.group === 1 ? 'var(--color-primary)' : 'var(--color-tertiary)')
      .attr('stroke', 'var(--color-background)')
      .attr('stroke-width', 2);

    node.append('text')
      .text((d: any) => d.name)
      .attr('x', 12)
      .attr('y', 4)
      .attr('font-size', '10px')
      .attr('fill', 'var(--color-on-background)')
      .attr('font-family', 'var(--font-headline)')
      .attr('font-weight', 'bold')
      .attr('stroke', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [data, dimensions]);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="font-headline font-black text-2xl uppercase tracking-tight">MAPA INTERATIVO IA</h2>
        <button className="p-2 rounded-lg bg-surface-variant hover:bg-primary/20 transition-all">
          <Maximize2 className="w-5 h-5 text-primary" />
        </button>
      </div>
      <div ref={containerRef} className="glass-panel rounded-3xl border border-outline/20 overflow-hidden bg-background/50 backdrop-blur-sm">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>
      <div className="p-4 bg-surface rounded-xl border-l-4 border-primary">
        <p className="text-xs text-outline">Este mapa foi gerado automaticamente pela IA com base no seu material. Arraste os nós para explorar as conexões.</p>
      </div>
    </div>
  );
});


const Chat = React.memo(({ profile }: { profile: UserProfile | null }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Olá, ${profile?.warName || 'Cadete'}! Sou seu assistente tático. Posso te ajudar com dúvidas sobre o material, dicas de estudo ou até mesmo seu treinamento físico (TAF). Como posso ajudar hoje?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Check if user is asking for a plan based on last exams
      const isAskingForPlan = userMsg.toLowerCase().includes('plano') && (userMsg.toLowerCase().includes('prova') || userMsg.toLowerCase().includes('concurso'));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: `Você é um assistente tático militar especializado em concursos (ESA, EsPCEx, EEAR, etc). 
          O nome de guerra do usuário é ${profile?.warName || 'Cadete'}. 
          Seu tom é motivador, disciplinado e profissional. 
          Você fornece dicas de estudo (técnicas de memorização, cronogramas) e dicas de treinamento físico (TAF - flexões, corrida, barra fixa). 
          Se o usuário pedir um novo plano baseado nas últimas provas, use a ferramenta de busca para encontrar informações atualizadas sobre os editais e provas mais recentes de ${profile?.exam || 'concursos militares'}.
          Seja direto e use termos militares ocasionalmente (ex: 'Cadete', 'Missão', 'QAP').`,
          tools: isAskingForPlan ? [{ googleSearch: {} }] : undefined
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'Desculpe, tive um erro na comunicação tática.' }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro na rede de comunicações. Tente novamente.' }]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-180px)] pb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline font-black text-2xl uppercase tracking-tight">ASSISTENTE TÁTICO</h2>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">IA ATIVA</span>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar"
      >
        {messages.map((msg, i) => (
          <div 
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface border border-outline/20 rounded-tl-none'}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface border border-outline/20 p-4 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte sobre o TAF, estudos ou o material..."
          className="flex-1 bg-surface border border-outline/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={isTyping}
          className="bg-primary text-on-primary p-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button 
          onClick={() => setInput('Como melhorar meu desempenho na corrida para o TAF?')}
          className="p-2 text-[10px] font-bold uppercase tracking-widest border border-outline/20 rounded-lg text-outline hover:border-primary hover:text-primary transition-all flex items-center gap-2"
        >
          <Dumbbell className="w-3 h-3" /> Treino Físico
        </button>
        <button 
          onClick={() => setInput('Me dê dicas de memorização para História.')}
          className="p-2 text-[10px] font-bold uppercase tracking-widest border border-outline/20 rounded-lg text-outline hover:border-primary hover:text-primary transition-all flex items-center gap-2"
        >
          <BookOpen className="w-3 h-3" /> Dicas de Estudo
        </button>
      </div>
    </div>
  );
});

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
}

const Simulator = React.memo(({ profile, onExit }: { profile: UserProfile | null, onExit: () => void }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiHelp, setAiHelp] = useState<string | null>(null);
  const [isGettingHelp, setIsGettingHelp] = useState(false);

  useEffect(() => {
    const generateQuestions = async () => {
      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Gere um simulado militar personalizado para o concurso ${profile?.exam || 'ESA'}.
        O nível do usuário é ${profile?.level || 'Iniciante'}.
        Dificuldades: ${profile?.difficulties?.join(', ') || 'Geral'}.
        
        Gere 5 questões de múltipla escolha (A, B, C, D, E).`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      subject: { type: Type.STRING }
                    },
                    required: ["text", "options", "correctIndex", "explanation", "subject"]
                  }
                }
              },
              required: ["questions"]
            }
          }
        });

        const data = JSON.parse(response.text);
        setQuestions(data.questions.map((q: any, i: number) => ({ ...q, id: `q-${i}` })));
      } catch (error) {
        console.error("Error generating questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateQuestions();
  }, [profile]);


  const handleGetHelp = async () => {
    if (isGettingHelp || !questions[currentIndex]) return;
    setIsGettingHelp(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Estou fazendo um simulado para ${profile?.exam}. A questão é: "${questions[currentIndex].text}". Pode me dar uma dica ou explicar o conceito por trás desta questão sem dar a resposta diretamente?`,
        config: {
          systemInstruction: "Você é um instrutor militar experiente. Dê dicas táticas e conceituais para ajudar o cadete a resolver a questão sozinho."
        }
      });
      setAiHelp(response.text || 'Não consegui obter ajuda no momento.');
    } catch (error) {
      console.error("Help error:", error);
    } finally {
      setIsGettingHelp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-outline font-headline font-bold animate-pulse">GERANDO SIMULADO PERSONALIZADO...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  if (!currentQ) return <div className="text-center p-10">Erro ao carregar questões.</div>;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 hover:bg-surface-variant rounded-lg">
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-headline font-black text-2xl uppercase tracking-tight">SIMULADO TÁTICO</h2>
        </div>
        <span className="text-xs font-bold text-outline uppercase tracking-widest">QUESTÃO {currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="pl-3 border-l-4 border-primary">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-2">Assunto: {currentQ.subject}</p>
        <h1 className="text-2xl font-headline font-extrabold leading-tight">{currentQ.text}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentQ.options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => {
              if (selectedOption === null) setSelectedOption(i);
            }}
            disabled={selectedOption !== null}
            className={`group flex items-center text-left p-1 rounded-lg border transition-all ${
              selectedOption === i 
                ? i === currentQ.correctIndex ? 'bg-primary/20 border-primary' : 'bg-destructive/20 border-destructive'
                : selectedOption !== null && i === currentQ.correctIndex ? 'bg-primary/20 border-primary' : 'bg-surface border-transparent hover:bg-surface-variant'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center font-headline font-black text-lg rounded-sm ${
              selectedOption === i 
                ? i === currentQ.correctIndex ? 'bg-primary text-on-primary' : 'bg-destructive text-on-destructive'
                : selectedOption !== null && i === currentQ.correctIndex ? 'bg-primary text-on-primary' : 'bg-surface-variant text-outline'
            }`}>
              {String.fromCharCode(65 + i)}
            </div>
            <span className="flex-1 px-6 font-body font-medium">{opt}</span>
            {selectedOption === i && i === currentQ.correctIndex && <CheckCircle2 className="text-primary w-5 h-5 mr-4" />}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleGetHelp}
          disabled={isGettingHelp}
          className="flex-1 py-4 bg-surface-variant/50 border border-outline/30 rounded-xl font-headline font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-primary/10 transition-all"
        >
          {isGettingHelp ? 'SOLICITANDO REFORÇO...' : <><Lightbulb className="w-4 h-4" /> AJUDA DA IA</>}
        </button>
        {selectedOption !== null && (
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex-1 py-4 bg-tertiary/10 border border-tertiary/20 text-tertiary rounded-xl font-headline font-black text-xs tracking-widest uppercase"
          >
            {showExplanation ? 'OCULTAR EXPLICAÇÃO' : 'VER EXPLICAÇÃO'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {aiHelp && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 bg-primary/5 border border-primary/20 rounded-xl relative">
            <button onClick={() => setAiHelp(null)} className="absolute top-2 right-2 text-outline hover:text-primary"><X className="w-4 h-4" /></button>
            <div className="flex gap-3">
              <Brain className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm italic text-on-background/80">{aiHelp}</p>
            </div>
          </motion.div>
        )}

        {showExplanation && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-surface border border-outline/20 rounded-xl space-y-4">
            <h4 className="font-headline font-bold text-primary uppercase text-xs tracking-widest">Análise Tática</h4>
            <p className="text-sm leading-relaxed">{currentQ.explanation}</p>
            <button 
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                  setSelectedOption(null);
                  setShowExplanation(false);
                  setAiHelp(null);
                } else {
                  onExit();
                }
              }}
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-xs tracking-widest uppercase"
            >
              {currentIndex < questions.length - 1 ? 'PRÓXIMA QUESTÃO' : 'FINALIZAR SIMULADO'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const Profile = React.memo(({ profile, onStartSimulator }: { profile: UserProfile | null, onStartSimulator: () => void }) => (
  <div className="space-y-10 pb-24">
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
      <div className="lg:col-span-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary/10 border border-tertiary/20 rounded-full">
          <span className="text-tertiary text-xs font-black tracking-widest uppercase">5-DAY STREAK 🔥</span>
        </div>
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight leading-none">
          Pronto para o combate, <br/><span className="text-primary italic">{profile?.warName || 'Cadete'}.</span>
        </h2>
      </div>
      <div className="lg:col-span-4 w-full">
        <div className="glass-panel p-6 rounded-xl border border-outline/30 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold tracking-[0.2em] text-outline uppercase">Rank Progression</span>
            <span className="font-headline font-bold text-tertiary text-sm">SOLDADO → CABO</span>
          </div>
          <div className="h-3 w-full bg-surface rounded-full overflow-hidden border border-outline/20">
            <div className="h-full bg-gradient-to-r from-primary to-tertiary w-[68%]" />
          </div>
          <p className="text-[10px] text-right text-outline font-medium">1,420 / 2,000 XP</p>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="glass-panel p-6 rounded-xl border border-outline/20">
        <Timer className="text-primary w-6 h-6 mb-4 opacity-60" />
        <p className="text-[10px] font-bold tracking-widest text-outline uppercase mb-1">Study Time</p>
        <h3 className="font-headline text-3xl font-black">124h <span className="text-xs text-outline/50">Total</span></h3>
      </div>
      <div className="glass-panel p-6 rounded-xl border border-outline/20">
        <BookOpen className="text-primary w-6 h-6 mb-4 opacity-60" />
        <p className="text-[10px] font-bold tracking-widest text-outline uppercase mb-1">Questions</p>
        <h3 className="font-headline text-3xl font-black">1,842 <span className="text-xs text-outline/50">Solved</span></h3>
      </div>
      <div className="glass-panel p-6 rounded-xl border border-outline/20 col-span-2 md:col-span-1">
        <Target className="text-tertiary w-6 h-6 mb-4 opacity-60" />
        <p className="text-[10px] font-bold tracking-widest text-outline uppercase mb-1">Accuracy</p>
        <h3 className="font-headline text-3xl font-black text-tertiary">84.2% <span className="text-xs text-outline/50">Rate</span></h3>
      </div>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7">
        <div className="glass-panel p-8 rounded-xl border border-outline/30 min-h-[300px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-black tracking-[0.3em] text-primary uppercase">Current Objective</span>
            </div>
            <h3 className="font-headline text-3xl font-extrabold leading-tight mb-4">
              MISSÃO DE HOJE: <br/>
              <span className="text-secondary">2h de Matemática (Trigonometria) + 15 questões</span>
            </h3>
            <p className="text-outline max-w-md">Seu plano de IA sugere focar em identidades trigonométricas hoje com base nos erros de ontem.</p>
          </div>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={onStartSimulator}
              className="bg-primary text-on-primary px-8 py-3 rounded-md font-bold text-sm tracking-widest uppercase"
            >
              GERAR SIMULADO IA
            </button>
            <button className="bg-surface-variant/50 text-on-background border border-outline/30 px-6 py-3 rounded-md font-bold text-sm tracking-widest uppercase">REVISAR</button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <button className="glass-panel p-6 rounded-xl border border-outline/20 flex items-center justify-between group hover:bg-primary/10 transition-all">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
              <Swords className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-headline font-bold">Arena de Questões</p>
              <p className="text-xs text-outline">Pratique em tempo real</p>
            </div>
          </div>
          <ChevronRight className="text-outline group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="glass-panel p-6 rounded-xl border border-outline/20 flex items-center justify-between group hover:bg-primary/10 transition-all">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-headline font-bold">Meu Plano</p>
              <p className="text-xs text-outline">Veja seu cronograma semanal</p>
            </div>
          </div>
          <ChevronRight className="text-outline group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="glass-panel p-6 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between group hover:bg-primary/10 transition-all">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-headline font-bold">Upload PDF IA</p>
              <p className="text-xs text-outline">Converta materiais em flashcards</p>
            </div>
          </div>
          <ChevronRight className="text-outline group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  </div>
));

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mapData, setMapData] = useState<{ nodes: MapNode[], links: MapLink[] }>({ nodes: [], links: [] });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOnboardingComplete = React.useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    setScreen('hq');
  }, []);

  const handleFileUpload = React.useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Analise este material de estudo militar com precisão absoluta.
      Extraia os conceitos mais críticos para o concurso ${userProfile?.exam || 'militar'}.
      
      1. Gere 8 flashcards (pergunta e resposta) de alta densidade informativa, focando em "pegadinhas" comuns e conceitos fundamentais.
      2. Gere um mapa mental estruturado com 10-12 nós. O nó central deve ser o tema principal. Use uma hierarquia lógica clara.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["front", "back"]
                }
              },
              map: {
                type: Type.OBJECT,
                properties: {
                  nodes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        group: { type: Type.INTEGER }
                      },
                      required: ["id", "name", "group"]
                    }
                  },
                  links: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        source: { type: Type.STRING },
                        target: { type: Type.STRING },
                        value: { type: Type.INTEGER }
                      },
                      required: ["source", "target", "value"]
                    }
                  }
                },
                required: ["nodes", "links"]
              }
            },
            required: ["flashcards", "map"]
          }
        }
      });

      const data = JSON.parse(response.text);
      
      setFlashcards(data.flashcards.map((c: any, i: number) => ({ ...c, id: `card-${i}`, known: false })));
      setMapData(data.map);
      setScreen('map');
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      alert("Erro ao processar o material. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }, [userProfile?.exam]);

  const handleToggleKnown = React.useCallback((id: string) => {
    setFlashcards(prev => prev.map(c => c.id === id ? { ...c, known: !c.known } : c));
  }, []);

  const handleStartReview = React.useCallback(() => setScreen('flashcards'), []);
  const handleStartSimulator = React.useCallback(() => setScreen('simulator'), []);
  const handleFocusToggle = React.useCallback(() => setIsFocusMode(true), []);
  const handleFocusExit = React.useCallback(() => setIsFocusMode(false), []);
  const handleSimulatorExit = React.useCallback(() => setScreen('hq'), []);


  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary/30">
      {screen !== 'onboarding' && !isFocusMode && (
        <Header 
          screen={screen} 
          setScreen={setScreen} 
          onFocusToggle={handleFocusToggle} 
          warName={userProfile?.warName}
        />
      )}
      
      <main className={`${screen !== 'onboarding' && !isFocusMode ? 'pt-24 px-6 max-w-7xl mx-auto' : ''}`}>
        <AnimatePresence mode="wait">
          {isFocusMode && (
            <FocusMode onExit={handleFocusExit} />
          )}

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center space-y-6"
            >
              <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <h3 className="text-2xl font-headline font-black text-primary uppercase tracking-widest">IA EM CAMPO</h3>
                <p className="text-outline mt-2">Analisando material e gerando inteligência tática...</p>
              </div>
            </motion.div>
          )}

          {screen === 'onboarding' && (
            <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Onboarding onComplete={handleOnboardingComplete} />
            </motion.div>
          )}
          {screen === 'hq' && (
            <motion.div key="hq" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <HQ 
                onUpload={handleFileUpload} 
                onStartReview={handleStartReview} 
                onStartSimulator={handleStartSimulator}
              />
            </motion.div>
          )}
          {screen === 'flashcards' && (
            <motion.div key="flashcards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Flashcards 
                cards={flashcards} 
                onToggleKnown={handleToggleKnown} 
              />
            </motion.div>
          )}
          {screen === 'arena' && (
            <motion.div key="arena" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Arena />
            </motion.div>
          )}
          {screen === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Profile profile={userProfile} onStartSimulator={handleStartSimulator} />
            </motion.div>
          )}
          {screen === 'map' && (
            <motion.div key="map" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <InteractiveMap data={mapData} />
            </motion.div>
          )}
          {screen === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Chat profile={userProfile} />
            </motion.div>
          )}
          {screen === 'simulator' && (
            <motion.div key="simulator" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Simulator profile={userProfile} onExit={handleSimulatorExit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {screen !== 'onboarding' && !isFocusMode && <BottomNav currentScreen={screen} setScreen={setScreen} />}
    </div>
  );

}
