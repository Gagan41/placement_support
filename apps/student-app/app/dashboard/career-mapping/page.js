"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui";
import { availableRoles, generateCareerRoadmap } from "@/lib/careerAI";
import {
  Map,
  Target,
  Clock,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function StudentCareer() {
  const [selectedRole, setSelectedRole] = useState("");
  const [duration, setDuration] = useState("12");
  const [roadmap, setRoadmap] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedRole) return;
    setIsGenerating(true);
    try {
      const result = await generateCareerRoadmap(
        selectedRole,
        parseInt(duration)
      );
      setRoadmap(result);
    } catch (err) {
      console.error(err);
    }
    setIsGenerating(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Career Mapping
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            A precise, personalized roadmap for your professional success.
          </p>
        </div>

        {/* ROLE SELECTION */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              Define Your Career Goal
            </CardTitle>
            <CardDescription>
              Select a role and generate a 12-week execution plan
            </CardDescription><CardDescription>
  Select a role and duration to generate a personalized execution roadmap
</CardDescription>
          </CardHeader>

          <CardContent className="grid md:grid-cols-3 gap-6">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>Select Role</SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={duration} onValueChange={setDuration}>
  <SelectTrigger>Duration</SelectTrigger>
  <SelectContent>
    <SelectItem value="4">4 Weeks (Fast Track)</SelectItem>
    <SelectItem value="12">12 Weeks (Standard)</SelectItem>
    <SelectItem value="24">24 Weeks (Deep Mastery)</SelectItem>
  </SelectContent>
</Select>

            <Button
              onClick={handleGenerate}
              disabled={!selectedRole || isGenerating}
              className="h-12 text-lg font-black"
            >
              {isGenerating ? "Generating..." : "Generate Roadmap"}
              <ArrowRight className="ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* ROADMAP */}
        {roadmap && (
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white">
            <CardHeader className="border-b p-10">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-slate-900 rounded-[2.5rem] text-white">
                  <Map size={40} />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black uppercase">
                    {roadmap.role} Specialization
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {roadmap.duration}-week execution roadmap
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-12 space-y-20 relative">
              {/* Timeline line */}
              <div className="absolute left-10 top-0 bottom-0 w-1 bg-blue-600/30 rounded-full" />

              {roadmap.milestones.map(milestone => (
                <div key={milestone.id} className="relative pl-24">

                  {/* Timeline dot */}
                  <div className="absolute left-9 w-6 h-6 rounded-xl bg-blue-600 border-4 border-white shadow-lg" />

                  <div className="bg-slate-50 p-10 rounded-[3rem] shadow-sm">

                    {/* TITLE */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-[10px] font-black px-4 py-2 rounded-xl bg-blue-600 text-white uppercase">
                        {milestone.week}
                      </span>
                      <h3 className="text-2xl font-black uppercase">
                        {milestone.title}
                      </h3>
                    </div>

                    <p className="text-slate-600 text-lg mb-10 max-w-3xl">
                      {milestone.overview}
                    </p>

                    {/* DAILY PLAN – 14 DAYS */}
                    {milestone.tasks?.map((task, tIndex) => (
                      <div key={tIndex} className="mb-12">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">
                          {task.title}
                        </h5>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {task.dailyPlan?.map((day, dIndex) => (
                            <div
                              key={dIndex}
                              className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100"
                            >
                              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                                {dIndex + 1}
                              </div>
                              <p className="text-sm font-medium text-slate-700">
                                {day}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* SKILLS */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {milestone.skills?.map((skill, i) => (
                        <span
                          key={i}
                          title={skill.whyItMatters}
                          className="text-[11px] font-black px-4 py-2 rounded-xl bg-white border uppercase"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>

                    {/* RESOURCES */}
                    <div className="flex items-center gap-3 pt-6 border-t">
                      <BookOpen className="text-blue-600" />
                      <span className="text-sm font-bold text-slate-700 uppercase">
                        {milestone.resources?.join(" / ")}
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}