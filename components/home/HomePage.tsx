'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  LineChart,
  Activity,
  ArrowRight,
  Sparkles,
  Brain,
  Calendar,
  Clock,
  ListTodo,
  MessageSquare,
  Music,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Nav } from './nav/Nav';
import { Footer } from './footer/Footer';
import { Section } from './section/Section';
import { TextSection } from './section/TextSection';
import { VideoContainer } from './video/VideoContainer';
import {
  homePageAssignmentFilterAndStarredImgs,
  homePageCalendarImgs,
  homePageChatImgs,
  homePageMindMapsImgs,
  homePagePomodoroImgs,
  homePageRolesAndSettingsImgs,
  homePageTasksImgs,
} from "@/lib/constants";
import { useRouter } from 'next/navigation';

// Define the type for carousel items to match the VideoContainer props
type ImageCategory = "dashboard" | "mindmap" | "tasks" | "pomodoro" | "chat" | "calendar";

export const HomePage = () => {
  const targetRef = useRef(null);
  const featuresRef = useRef<HTMLElement>(null);
  const router = useRouter();
  
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = useRef<HTMLDivElement[]>([]);
  
  // Carousel data with typed imageCategory
  const carouselItems = [
    {
      title: "Dashboard",
      description: "Track your progress and manage your tasks in one centralized location.",
      bgColor: "from-primary/20 to-chart-2/20",
      imageCategory: "dashboard" as ImageCategory
    },
    {
      title: "Mind Maps",
      description: "Visualize your ideas and organize your thoughts effectively.",
      bgColor: "from-purple-500/20 to-blue-500/20",
      imageCategory: "mindmap" as ImageCategory
    },
    {
      title: "Task Management",
      description: "Create, organize, and track your tasks with powerful tools.",
      bgColor: "from-blue-500/20 to-cyan-500/20",
      imageCategory: "tasks" as ImageCategory
    },
    {
      title: "Pomodoro Timer",
      description: "Boost your productivity with timed work sessions.",
      bgColor: "from-green-500/20 to-emerald-500/20",
      imageCategory: "pomodoro" as ImageCategory
    },
    {
      title: "Group Chat",
      description: "Collaborate with your team in real-time through integrated messaging.",
      bgColor: "from-amber-500/20 to-yellow-500/20",
      imageCategory: "chat" as ImageCategory
    },
    {
      title: "Calendar",
      description: "Keep track of deadlines and schedule your tasks efficiently.",
      bgColor: "from-pink-500/20 to-rose-500/20",
      imageCategory: "calendar" as ImageCategory
    }
  ];
  
  const nextItem = () => {
    setActiveVideoIndex(prev => (prev + 1) % carouselItems.length);
  };
  
  const prevItem = () => {
    setActiveVideoIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
  };
  
  useEffect(() => {
    const interval = setInterval(nextItem, 5000);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const navigateToSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <>
      <Nav />
      <div
        className="min-h-screen bg-background hero-gradient perspective-1000"
        ref={targetRef}
      >
        {/* Enhanced Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-chart-2/20"
            style={{
              scale: useTransform(smoothProgress, [0, 1], [1.1, 1]),
              rotate: useTransform(smoothProgress, [0, 1], [0, -5]),
            }}
          />
          <div className="absolute inset-0 backdrop-blur-[100px]" />

          {/* 3D Floating Elements */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full"
              style={{
                background: `radial-gradient(circle at center, hsl(var(--primary) / ${
                  0.1 - i * 0.02
                }) 0%, transparent 70%)`,
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
              }}
              animate={{
                y: [-(i * 10), i * 10, -(i * 10)],
                x: [-(i * 5), i * 5, -(i * 5)],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-32 pb-20 relative">
          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left space-y-6"
              >
                <motion.div
                  className="flex lg:justify-start justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="inline-flex items-center gap-2 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-primary/20 shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm">Digital Productivity Platform</span>
                  </div>
                </motion.div>

                <motion.h1
                  className="text-5xl lg:text-7xl font-bold leading-tight"
                  style={{
                    textShadow: '0 0 40px rgba(var(--primary), 0.2)',
                  }}
                >
                  Boost Your{' '}
                  <motion.span
                    className="text-primary relative inline-block"
                    whileHover={{
                      scale: 1.05,
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    Productivity
                  </motion.span>{' '}
                  with UniWell
                </motion.h1>

                <motion.p
                  className="text-xl text-muted-foreground mx-auto max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  The all-in-one productivity suite designed for university
                  students. Track tasks, collaborate with peers, and achieve your
                  academic goals.
                </motion.p>

                <motion.div
                  className="flex items-center lg:justify-start justify-center gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <Button
                    size="lg"
                    className="text-lg px-8 h-14 bg-primary/90 backdrop-blur-md hover:bg-primary/80 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                    onClick={scrollToFeatures}
                  >
                    Learn More
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>

                <motion.div
                  className="flex items-center lg:justify-start justify-center gap-8 pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  {[
                    { value: '4/5', label: 'Rated by users' },
                    { value: '100%', label: 'Opensource' },
                    { value: '24/7', label: 'Support' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-background/50 backdrop-blur-md p-4 rounded-xl border border-primary/20 shadow-lg hover:shadow-primary/20 transition-all duration-300"
                    >
                      <motion.div
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-2"
                        whileHover={{ scale: 1.1 }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Column - Replace with Video Carousel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative perspective-1000"
              >
                <div className="relative z-20 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Video Carousel */}
                  <div className="relative h-[400px] w-full overflow-hidden rounded-2xl">
                    {carouselItems.map((item, index) => (
                      <motion.div
                        key={index}
                        ref={el => {
                          if (el) videoRefs.current[index] = el;
                        }}
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ 
                          opacity: activeVideoIndex === index ? 1 : 0,
                          x: activeVideoIndex === index ? 0 : activeVideoIndex > index ? '-100%' : '100%' 
                        }}
                        transition={{ duration: 0.5 }}
                        className={`absolute inset-0 ${activeVideoIndex === index ? 'z-10' : 'z-0'}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-30`}></div>
                        <VideoContainer 
                          className="h-full w-full relative z-10" 
                          imageCategory={item.imageCategory}
                        />
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/50 to-transparent z-20">
                          <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                          <p className="text-white/80">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Carousel Controls */}
                    <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30">
                      <button 
                        onClick={prevItem}
                        className="bg-background/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-background/50 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30">
                      <button 
                        onClick={nextItem}
                        className="bg-background/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-background/50 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Carousel Indicators */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
                      {carouselItems.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveVideoIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            activeVideoIndex === index 
                              ? 'bg-white w-4' 
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Keep the floating stats cards */}
                <motion.div
                  animate={{
                    y: [0, 20, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -bottom-20 -left-20 z-10"
                >
                  <div className="bg-background/40 backdrop-blur-xl border border-primary/20 rounded-xl p-4 shadow-xl hover:shadow-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <LineChart className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">Progress</div>
                        <div className="text-2xl font-bold text-green-500">
                          +64.89%
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -top-10 -right-10 z-10"
                >
                  <div className="bg-background/40 backdrop-blur-xl border border-primary/20 rounded-xl p-4 shadow-xl hover:shadow-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Tasks</div>
                        <div className="text-2xl font-bold text-blue-500">
                          94%
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
        

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="container mx-auto px-4 py-20">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl font-bold mb-4">
              All the productivity features you can imagine in one place
            </h2>
            <p className="text-xl text-muted-foreground">
              All features available to everyone, no premium tier, no hidden costs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MessageSquare className="w-10 h-10" />,
                title: 'Real-time Chat',
                description:
                  'Connect with peers instantly through our seamless chat interface',
                targetSection: 'Chat',
                demo: (
                  <div className="relative h-32 bg-card/50 rounded-lg p-4 overflow-hidden">
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-start gap-2 mb-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20" />
                      <div className="bg-primary/10 rounded-lg p-2 max-w-[80%]">
                        <p className="text-sm">Hey, how's your study going?</p>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex items-start gap-2 justify-end"
                    >
                      <div className="bg-primary/10 rounded-lg p-2 max-w-[80%]">
                        <p className="text-sm">
                          Great! Just finished my assignments.
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/20" />
                    </motion.div>
                  </div>
                ),
              },
              {
                icon: <Clock className="w-10 h-10" />,
                title: 'Pomodoro Timer',
                description:
                  'Boost productivity with our customizable Pomodoro technique timer',
                targetSection: 'Pomodoro',
                demo: (
                  <div className="relative h-32 bg-card/50 rounded-lg p-4 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="absolute w-1 h-8 bg-primary origin-bottom rounded-full"
                        style={{ bottom: '50%' }}
                      />
                      <p className="text-lg font-bold">25:00</p>
                    </motion.div>
                  </div>
                ),
              },
              {
                icon: <Brain className="w-10 h-10" />,
                title: 'Mind Maps',
                description:
                  'Visualize your thoughts and organize ideas effectively',
                targetSection: 'Mind-Maps',
                demo: (
                  <div className="relative h-32 bg-card/50 rounded-lg p-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center justify-center h-full"
                    >
                      {[0, 72, 144, 216, 288].map((angle) => (
                        <motion.div
                          key={angle}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: angle / 1000 }}
                          className="absolute w-16 h-[1px] bg-primary origin-left"
                          style={{
                            transform: `rotate(${angle}deg) translate(24px) rotate(-${angle}deg)`,
                          }}
                        >
                          <div className="absolute right-0 w-2 h-2 rounded-full bg-primary" />
                        </motion.div>
                      ))}
                      <div className="w-4 h-4 rounded-full bg-primary" />
                    </motion.div>
                  </div>
                ),
              },
              {
                icon: <Trophy className="w-10 h-10" />,
                title: 'University Leaderboard',
                description:
                  'Compete with fellow students and track your progress',
                demo: (
                  <div className="relative h-32 bg-card/50 rounded-lg p-4">
                    <motion.div className="space-y-2">
                      {[1, 2, 3].map((position) => (
                        <motion.div
                          key={position}
                          initial={{ x: -50, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: position * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="font-bold">{position}</span>
                          <div className="w-6 h-6 rounded-full bg-primary/20" />
                          <div className="flex-1 h-2 rounded-full bg-primary/20">
                            <motion.div
                              className="h-full rounded-full bg-primary"
                              initial={{ width: '0%' }}
                              whileInView={{
                                width: `${100 - (position - 1) * 20}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: position * 0.1,
                              }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ),
              },
              {
                icon: <Calendar className="w-10 h-10" />,
                title: 'Smart Calendar',
                description:
                  'Manage your schedule with our intuitive calendar interface',
                targetSection: 'Calendar',
                demo: (
                  <div className="relative h-32 bg-card/50 rounded-lg p-4">
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          className={`aspect-square rounded bg-primary/10 ${
                            i === 5 ? 'bg-primary text-primary-foreground' : ''
                          }`}
                        >
                          <span className="text-xs">{i + 1}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                icon: <ListTodo className="w-10 h-10" />,
                title: 'Tasks & Todo',
                description:
                  'Stay organized with our powerful task management system',
                targetSection: 'Tasks',
                demo: (
                  <div className="relative h-32 bg-card/50 rounded-lg p-4">
                    <motion.div className="space-y-2">
                      {[
                        'Complete assignment',
                        'Study for exam',
                        'Team meeting',
                      ].map((task, i) => (
                        <motion.div
                          key={task}
                          initial={{ x: -50, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center">
                            {i === 0 && (
                              <div className="w-2 h-2 rounded-sm bg-primary" />
                            )}
                          </div>
                          <span
                            className={
                              i === 0 ? 'line-through text-muted-foreground' : ''
                            }
                          >
                            {task}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ),
              },
              {
                icon: <Music className="w-10 h-10" />,
                title: 'Focus Music',
                description:
                  'Enhance concentration with curated focus-boosting playlists',
                demo: (
                  <div className="relative h-32 bg-card/50 rounded-lg p-4">
                    <div className="flex items-center justify-center h-full gap-1">
                      {[0.3, 0.5, 0.7, 1, 0.8, 0.6, 0.4].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: [0, height, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          className="w-2 h-16 bg-primary origin-bottom"
                        />
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: 'Collaboration',
                description:
                  'Work together seamlessly with group features and shared workspaces',
                targetSection: 'Roles',
                demo: (
                  <div className="relative h-32 bg-card/50 rounded-lg p-4 flex items-center justify-center">
                    <motion.div className="relative">
                      {[0, 72, 144, 216, 288].map((angle) => (
                        <motion.div
                          key={angle}
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: angle / 1000 }}
                          className="absolute w-8 h-8 rounded-full bg-primary/20"
                          style={{
                            transform: `rotate(${angle}deg) translate(24px) rotate(-${angle}deg)`,
                          }}
                        />
                      ))}
                      <div className="w-10 h-10 rounded-full bg-primary/40" />
                    </motion.div>
                  </div>
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="slide-up feature-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card 
                  className={`p-6 bg-background/40 backdrop-blur-xl border border-purple-300/20 dark:border-purple-600/20 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 ${feature.targetSection ? 'cursor-pointer' : ''}`}
                  onClick={feature.targetSection ? () => scrollToSection(feature.targetSection) : undefined}
                >
                  <div className="mb-4 text-purple-500 transition-transform duration-300 hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  {feature.demo}
                </Card>
              </div>
            ))}
          </div>
        </section>
        
        {/* more */}
        <div className="w-full mx-auto max-w-screen-xl px-4 sm:px-6 py-16 relative z-10">
          <TextSection
            title="Your Productivity Partner"
            desc="Maximize your team's efficiency with UniWell—an all-in-one workspace designed to consolidate your essential tools into one cohesive platform."
          />

          <Section
            id="Mind-Maps"
            title="Visualize with Mind Maps"
            desc=" Mind Maps allow users to build visually compelling projects, making complex ideas easier to understand. The user-friendly interface offers extensive customization, enabling smooth navigation and collaboration through tagging and task assignment features."
            images={homePageMindMapsImgs}
            reverse
          />
          
          <Section
            id="Tasks"
            title="Tasks & Notes"
            desc="The Tasks feature provides a smooth environment for creating notes and organizing projects. With an enhanced editor and auto-save functionality, users can assign tasks, add categories, tag items, and set deadlines, all integrated seamlessly with the calendar for optimal organization."
            images={homePageTasksImgs}
          />
          
          <Section
            id="Roles"
            title="Roles & Permissions"
            desc="UniWell's role management system simplifies workspace oversight. Admins and owners can adjust user roles, manage account and workspace settings, and oversee permissions to ensure smooth collaboration."
            images={homePageRolesAndSettingsImgs}
          />
          
          <Section
            id="Pomodoro"
            title="Pomodoro Timer"
            desc="The built-in Pomodoro timer supports focused work sessions by letting users set custom session times, rounds, breaks, and alerts—tailoring the experience to each user's productivity needs."
            images={homePagePomodoroImgs}
            reverse
          />
          
          <TextSection
            title="The Future of Team Collaboration"
            desc=" Effortlessly share projects and invite others to join with easy shareable links. UniWell enables instant project review and real-time chatting with team members from anywhere."
          />

          <Section
            id="Chat"
            title="Chat & Alerts"
            desc="Engage in real-time discussions, share files, and keep everyone informed with instant notifications so you're always in sync with your team."
            images={homePageChatImgs}
          />

          <Section
            id="Calendar"
            title="Unified Calendar"
            desc="Stay organized with the Unified Calendar, where all scheduled tasks and deadlines are displayed. It enhances teamwork by ensuring everyone has clear visibility of project timelines and due dates."
            images={homePageCalendarImgs}
            reverse
          />

          <Section
            id="Filters"
            title="Quick Access"
            desc="Instantly locate what you need with a smart search feature, quick access tabs, and filtering tools. Tagging and marking essential items make it easy to keep your most important projects just a click away, streamlining your workflow."
            images={homePageAssignmentFilterAndStarredImgs}
          />
          
          {/* CTA Section - Moved to end of page */}
          <div className="py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-background/40 backdrop-blur-xl border border-purple-300/20 dark:border-purple-600/20 rounded-3xl p-12 text-center max-w-4xl mx-auto relative overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-300/20"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <h2 className="text-4xl font-bold mb-6 relative z-10">
                Ready to Transform Your Academic Life?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 relative z-10">
                Join the community of students enhancing their productivity. No
                credit card required, free forever.
              </p>
              <Button
                size="lg"
                className="text-lg px-8 bg-purple-500/90 backdrop-blur-md hover:bg-purple-600/80 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative z-10"
                onClick={navigateToSignUp}
              >
                Get Started Now
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
