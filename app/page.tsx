"use client";
import { useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { TherapyImportanceSection } from "@/components/therapy-importance-section";
import { ProfessionalsSection } from "@/components/professionals-section";
import { LocationSection } from "@/components/location-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { FloatingScheduleButton } from "@/components/floating-schedule-button";
import { ModalSchedule } from "@/components/modal-schedule";
export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState("Aline Reis");
  const openSchedule = (professional = "Aline Reis") => { setSelectedProfessional(professional); setIsModalOpen(true); };
  const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  return <div className="site-shell"><a className="skip-link" href="#clinica">Ir para o conteúdo</a><main>
    <HeroSection openSchedule={() => openSchedule()} scrollToId={scrollToId} />
    <TherapyImportanceSection />
    <ServicesSection openSchedule={() => openSchedule()} />
    <ProfessionalsSection onSchedule={openSchedule} />
    <LocationSection openSchedule={() => openSchedule()} />
    <ContactSection />
  </main><Footer /><FloatingScheduleButton onClick={() => openSchedule()} /><ModalSchedule open={isModalOpen} onClose={() => setIsModalOpen(false)} initialProfessional={selectedProfessional} /></div>;
}
