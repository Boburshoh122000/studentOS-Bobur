'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Brain, Users, Activity, ToggleRight, Check, ArrowRight } from 'lucide-react';

export default function TrustlineHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  // Smooth cubic bezier for text
  const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

  return (
    <section className="relative w-full min-h-[900px] bg-[#F8FAFC] overflow-hidden font-sans">
      {/* ============================================================ */}
      {/* LAYER 1: SVG BACKGROUND LINES (z-0) — behind everything     */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faint dashed grid lines */}
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
            x1="0"
            y1="450"
            x2="1440"
            y2="450"
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          {/* Left side lines */}
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: 'easeInOut' }}
            x1="720"
            y1="350"
            x2="280"
            y2="280"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.7, ease: 'easeInOut' }}
            x1="280"
            y1="380"
            x2="280"
            y2="550"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          {/* Right side lines */}
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: 'easeInOut' }}
            x1="720"
            y1="350"
            x2="1160"
            y2="200"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.7, ease: 'easeInOut' }}
            x1="1160"
            y1="300"
            x2="1160"
            y2="520"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          {/* Bottom connecting curves */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }}
            d="M 400 700 C 500 700, 600 650, 720 650"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }}
            d="M 720 650 C 840 650, 940 700, 1040 700"
            stroke="#4F46E5"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Dots at connection points */}
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.3, duration: 0.3 }}
            cx="400"
            cy="700"
            r="4"
            fill="#6366F1"
          />
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.3, duration: 0.3 }}
            cx="1040"
            cy="700"
            r="4"
            fill="#4F46E5"
          />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* LAYER 2: FLOATING CARDS (z-10) — behind center text          */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
        {/* A. Top-Left: GPA Toggle Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.2 }}
          className="absolute top-[15%] left-[2%] lg:left-[5%] w-[240px] bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-3 pointer-events-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-800">2.5</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">GPA</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Without StudentOS</span>
            <div className="w-7 h-4 bg-slate-200 rounded-full flex items-center px-0.5">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
          <div className="w-full h-px bg-slate-100" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-indigo-600">4.0</span>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase">GPA</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-700">With StudentOS</span>
            <ToggleRight className="w-7 h-7 text-indigo-500" />
          </div>
        </motion.div>

        {/* B. Top-Right: Secure Study Data Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.4 }}
          className="absolute top-[10%] right-[2%] lg:right-[5%] w-[210px] bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center gap-3 pointer-events-auto"
        >
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">Secure Study Data</span>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center relative">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-emerald-200 rounded-full blur-md"
            />
            <ShieldCheck className="w-7 h-7 text-emerald-600 relative z-10" />
          </div>
        </motion.div>

        {/* C. Bottom-Left: Peers Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.6 }}
          className="absolute bottom-[5%] left-[2%] lg:left-[5%] w-[230px] pointer-events-auto"
        >
          <span className="text-xs font-bold text-slate-700 mb-1.5 block ml-3">Your Peers</span>
          <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-100 relative">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white shadow-md border border-slate-100 rounded-full flex items-center justify-center text-sm z-20"
            >
              🎓
            </motion.div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100" />
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-end justify-end p-0.5">
                <span className="bg-white rounded-full p-0.5 shadow-sm text-[8px]">✍️</span>
              </div>
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                <img
                  src="https://i.pravatar.cc/100?img=47"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-white rounded-xl" />
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                <img
                  src="https://i.pravatar.cc/100?img=33"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100" />
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                <img
                  src="https://i.pravatar.cc/100?img=8"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100" />
            </div>
          </div>
        </motion.div>

        {/* Center Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.7 }}
          className="absolute bottom-[25%] left-1/2 -translate-x-1/2 bg-indigo-600 px-5 py-2.5 rounded-full shadow-[0_8px_24px_rgba(99,102,241,0.4)] flex items-center gap-2 pointer-events-auto"
        >
          <Activity className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white tracking-wide">StudentOS</span>
        </motion.div>

        {/* D. Bottom-Right: Mentors Network */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.8 }}
          className="absolute bottom-[5%] right-[2%] lg:right-[5%] w-[280px] pointer-events-auto"
        >
          <div className="absolute -top-3 right-6 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 flex items-center gap-1.5 z-20">
            <Users className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold text-slate-700">Your Mentors</span>
          </div>
          <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 w-full aspect-square relative overflow-hidden p-5">
            {/* Internal lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1="50%"
                y1="50%"
                x2="25%"
                y2="25%"
                stroke="#F1F5F9"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <line
                x1="50%"
                y1="50%"
                x2="75%"
                y2="25%"
                stroke="#F1F5F9"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <line
                x1="50%"
                y1="50%"
                x2="25%"
                y2="75%"
                stroke="#F1F5F9"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <line
                x1="50%"
                y1="50%"
                x2="75%"
                y2="75%"
                stroke="#F1F5F9"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
            <div className="relative z-10 w-full h-full">
              {/* Center Node */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-amber-50 rounded-xl shadow-sm border border-amber-100 flex items-center justify-center"
              >
                <Brain className="w-7 h-7 text-amber-600" />
              </motion.div>
              {/* Satellite Mentors */}
              <div className="absolute top-[8%] left-[8%] flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img
                    src="https://i.pravatar.cc/100?img=59"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-500">Mentor 1</span>
              </div>
              <div className="absolute top-[8%] right-[8%] flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img
                    src="https://i.pravatar.cc/100?img=60"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-500">Mentor 2</span>
              </div>
              <div className="absolute bottom-[8%] left-[8%] flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center border-2 border-white shadow-md">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-[9px] font-bold text-slate-500">AI Tutor</span>
              </div>
              <div className="absolute bottom-[8%] right-[8%] flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img
                    src="https://i.pravatar.cc/100?img=65"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-500">Mentor 3</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* LAYER 3: CENTER TEXT & BUTTONS (z-30) — topmost, isolated    */}
      {/* ============================================================ */}
      <div className="relative z-30 flex flex-col items-center justify-center text-center max-w-3xl mx-auto pt-32 pb-40 px-4 min-h-[900px]">
        {/* StudentOS Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: smoothEase }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100"
        >
          <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
            <Users className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-indigo-700">StudentOS</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: smoothEase }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
        >
          Unified Student
          <br />
          Workspace Solution
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: smoothEase }}
          className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          StudentOS automates your academic tracking, speeding up your workflow while keeping your
          study plans organized.
        </motion.p>

        {/* Buttons — one row, no duplicates */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: smoothEase }}
          className="flex flex-row items-center justify-center gap-4 mt-10"
        >
          <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-indigo-700 transition shadow-[0_6px_16px_rgba(79,70,229,0.3)]">
            Get started
          </button>
          <button className="bg-white text-slate-900 border border-slate-200 shadow-sm px-8 py-3.5 rounded-full font-medium hover:bg-slate-50 transition flex items-center gap-2">
            View live demo <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
