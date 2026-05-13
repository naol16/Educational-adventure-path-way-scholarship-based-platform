"use client";

import { use, useEffect } from "react";
import { LearningPathProvider, useLearningPath } from "@/features/english-learning/components/LearningPath/LearningPathContext";
import { LearningPathShell } from "@/features/english-learning/components/LearningPath/LearningPathShell";
import { SkillWorkspace } from "@/features/english-learning/components/LearningPath/SkillWorkspace";

function SkillPageContent({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  const { setActiveTab } = useLearningPath();

  useEffect(() => {
    setActiveTab(moduleId);
  }, [moduleId, setActiveTab]);

  return <SkillWorkspace />;
}

export default function SkillPage({ params }: { params: Promise<{ moduleId: string }> }) {
  return (
    <LearningPathProvider>
      <LearningPathShell>
        <SkillPageContent params={params} />
      </LearningPathShell>
    </LearningPathProvider>
  );
}
