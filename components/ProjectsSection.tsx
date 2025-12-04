// components/ProjectsSection.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimatedSection from './AnimatedSection';
import ProjectCard from './ProjectCard';
import { Button } from '@/components/ui/button';
import { ProjectFactory, BaseProject, RawProjectData } from '@/lib/project-models'; // Import Class OOP

interface ProjectsSectionProps {
  title: string;
  subtitle: string;
  categories: string[];
  projects: RawProjectData[]; // Data mentah dari props
  isHomePage?: boolean;
  displayBackgroundCard?: boolean;
}

const ProjectsSection = ({ 
  title, 
  subtitle, 
  categories, 
  projects, 
  isHomePage, 
  displayBackgroundCard = true 
}: ProjectsSectionProps) => {
  const [activeCategory, setActiveCategory] = useState('Semua');

  // ==========================================
  // 2. OBJEK (OBJECT) - Transformasi Data ke Objek OOP
  // ==========================================
  // Kita mengubah data JSON mentah menjadi Array of Objects (BaseProject)
  // Menggunakan useMemo agar tidak dibuat ulang setiap render kecuali data berubah
  const projectObjects: BaseProject[] = useMemo(() => {
    return projects.map(p => ProjectFactory.createProject(p));
  }, [projects]);

  // Filter logika menggunakan method dari Class
  const filteredProjects = activeCategory === 'Semua'
    ? projectObjects
    : projectObjects.filter(project => project.getCategory() === activeCategory); // Menggunakan Getter

  const projectsToDisplay = isHomePage ? filteredProjects.slice(0, 6) : filteredProjects;
  const showLoadMoreButton = (filteredProjects.length > 6) && isHomePage;

  const content = (
    <>
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
      </div>

      {/* Filter Category */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <div className="bg-gray-50 rounded-2xl p-2 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsToDisplay.map((projectObj, index) => (
            <ProjectCard
              // Menggunakan Getter/Method dari Objek untuk mendapatkan data
              key={index + projectObj.getTitle()} 
              title={projectObj.getTitle()}
              description={projectObj.getDescription()}
              imageUrl={projectObj.getImage()}
              category={projectObj.getCategory()}
              
              // ENCAPSULATION & POLYMORPHISM in Action:
              // Kita tidak perlu logika 'if' di sini. Objek 'projectObj' sudah tahu
              // cara menampilkan client dan warnanya sendiri.
              client={projectObj.getClientDisplay()} 
              completedDate={projectObj.getDateDisplay()}
              categoryColor={projectObj.getCategoryColor()} 
            />
          ))}
        </motion.div>

        {showLoadMoreButton && (
          <div className="absolute inset-x-0 bottom-0 pt-16 pb-6 flex justify-center items-end z-10">
            <Link href="/portfolio" passHref>
              <Button className="px-8 py-3 text-lg font-semibold rounded-full shadow-lg transition-transform duration-300 hover:scale-105">
                Lihat Semua Proyek
              </Button>
            </Link>
          </div>
        )}
        
        {filteredProjects.length > 6 && isHomePage && (
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
        )}
      </div>
    </>
  );

  return (
    <section className="pb-24 pt-16 bg-white border-x border-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          {displayBackgroundCard ? (
            <div className="bg-white border-x border-y rounded-3xl p-8 md:p-12">
              {content}
            </div>
          ) : (
            content
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ProjectsSection;