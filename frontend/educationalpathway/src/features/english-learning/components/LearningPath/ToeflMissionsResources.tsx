"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, FileText, BookOpen, Maximize2 } from "lucide-react";

interface ToeflMission {
  id: string;
  skill: "reading" | "listening" | "speaking" | "writing";
  focus_area: string;
  objective: string;
  videos: string[];
  pdfs: string[];
  videoUrls: string[];
  youtubeIds: string[];
  skillLabel: string;
  levelLabel: string;
}

interface ToeflMissionsResponse {
  level: string;
  skill: string;
  count: number;
  missions: ToeflMission[];
}

const skillColors: Record<string, string> = {
  reading: "bg-blue-100 text-blue-800",
  listening: "bg-green-100 text-green-800",
  speaking: "bg-purple-100 text-purple-800",
  writing: "bg-orange-100 text-orange-800",
};

const levelLabels: Record<string, string> = {
  "1": "📚 Easy - Foundations",
  "2": "🎯 Medium - Precision",
  "3": "⭐ Hard - Advanced",
};

export default function ToeflMissionsResources() {
  const [selectedLevel, setSelectedLevel] = useState<"1" | "2" | "3">("1");
  const [selectedSkill, setSelectedSkill] = useState<
    "reading" | "listening" | "speaking" | "writing" | "all"
  >("all");
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  const {
    data: missionsData,
    isLoading,
    error,
  } = useSWR<ToeflMissionsResponse>(
    `/learning-path/toefl-missions?level=${selectedLevel}&skill=${selectedSkill === "all" ? "" : selectedSkill}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch TOEFL missions");
      return res.json();
    },
  );

  const missions = missionsData?.missions || [];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TOEFL iBT Learning Resources
        </h1>
        <p className="text-gray-600">
          Complete catalog of missions with videos and PDFs for each skill level
        </p>
      </div>

      {/* Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Level</CardTitle>
          <CardDescription>
            Choose a difficulty level to view relevant missions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(["1", "2", "3"] as const).map((level) => (
              <Button
                key={level}
                onClick={() => setSelectedLevel(level)}
                variant={selectedLevel === level ? "default" : "outline"}
                className="w-full"
              >
                {levelLabels[level]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Skill</CardTitle>
          <CardDescription>
            View missions for specific skills or all skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedSkill("all")}
              variant={selectedSkill === "all" ? "default" : "outline"}
              className="px-4"
            >
              All Skills
            </Button>
            {(["reading", "listening", "speaking", "writing"] as const).map(
              (skill) => (
                <Button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  variant={selectedSkill === skill ? "default" : "outline"}
                  className={`px-4 ${
                    selectedSkill === skill
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : skillColors[skill]
                  }`}
                >
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </Button>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Missions Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              Error loading missions. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : missions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">
              No missions found for the selected criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {missionsData?.count} Mission
              {missionsData?.count !== 1 ? "s" : ""}
            </h2>
            <Badge variant="outline">{levelLabels[selectedLevel]}</Badge>
          </div>

          {/* Group missions by skill */}
          <Tabs
            defaultValue={missions[0]?.skill || "reading"}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              {["reading", "listening", "speaking", "writing"].map((skill) => {
                const skillMissions = missions.filter(
                  (m: ToeflMission) => m.skill === skill,
                );
                if (skillMissions.length === 0) return null;
                return (
                  <TabsTrigger key={skill} value={skill}>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    <Badge className="ml-2 bg-opacity-70" variant="secondary">
                      {skillMissions.length}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {["reading", "listening", "speaking", "writing"].map((skill) => {
              const skillMissions = missions.filter(
                (m: ToeflMission) => m.skill === skill,
              );
              if (skillMissions.length === 0) return null;

              return (
                <TabsContent key={skill} value={skill} className="space-y-4">
                  {skillMissions.map((mission: ToeflMission, index: number) => (
                    <Card
                      key={mission.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() =>
                        setExpandedMission(
                          expandedMission === mission.id ? null : mission.id,
                        )
                      }
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={skillColors[mission.skill]}>
                                {mission.skillLabel}
                              </Badge>
                              <Badge variant="outline">
                                Mission {index + 1}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">
                              {mission.focus_area}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {mission.objective}
                            </CardDescription>
                          </div>
                          <Maximize2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                        </div>
                      </CardHeader>

                      {/* Expanded Content */}
                      {expandedMission === mission.id && (
                        <CardContent className="space-y-6 pt-0 border-t">
                          {/* Videos Section */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Play className="w-5 h-5 text-red-600" />
                              <h3 className="font-semibold text-lg">
                                Video Resources ({mission.videos.length})
                              </h3>
                            </div>
                            {mission.videos.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mission.youtubeIds.map(
                                  (youtubeId: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="relative bg-gray-200 rounded-lg overflow-hidden h-48 group cursor-pointer"
                                    >
                                      <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                                        title={`Video ${idx + 1}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-lg"
                                      />
                                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Video {idx + 1}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500">
                                No videos available
                              </p>
                            )}
                          </div>

                          {/* PDFs Section */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <h3 className="font-semibold text-lg">
                                PDF Resources ({mission.pdfs.length})
                              </h3>
                            </div>
                            {mission.pdfs.length > 0 ? (
                              <div className="space-y-2">
                                {mission.pdfs.map(
                                  (pdf: string, idx: number) => (
                                    <a
                                      key={idx}
                                      href={pdf}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors group"
                                    >
                                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                                          PDF Resource {idx + 1}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                          {new URL(pdf).hostname}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className="ml-2 flex-shrink-0"
                                      >
                                        <a
                                          href={pdf}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Open
                                        </a>
                                      </Button>
                                    </a>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500">No PDFs available</p>
                            )}
                          </div>

                          {/* Summary */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">
                                Total Resources:
                              </span>{" "}
                              {mission.videos.length} videos +{" "}
                              {mission.pdfs.length} PDFs
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      )}

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>Resources Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total Missions</p>
              <p className="text-2xl font-bold text-blue-600">
                {missions.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Videos</p>
              <p className="text-2xl font-bold text-red-600">
                {missions.reduce(
                  (sum: number, m: ToeflMission) => sum + m.videos.length,
                  0,
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total PDFs</p>
              <p className="text-2xl font-bold text-blue-600">
                {missions.reduce(
                  (sum: number, m: ToeflMission) => sum + m.pdfs.length,
                  0,
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Level</p>
              <p className="text-2xl font-bold text-purple-600">
                {selectedLevel === "1"
                  ? "Easy"
                  : selectedLevel === "2"
                    ? "Medium"
                    : "Hard"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
