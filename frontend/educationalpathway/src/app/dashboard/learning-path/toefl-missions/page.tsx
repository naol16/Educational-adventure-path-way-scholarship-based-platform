import { redirect } from "next/navigation";
import { ToeflMissionsResources } from "@/features/english-learning/components/LearningPath";

export const metadata = {
  title: "TOEFL Learning Resources | Educational Adventure",
  description:
    "Complete TOEFL iBT mission catalog with videos and PDF resources for all skill levels",
};

export default function ToeflMissionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToeflMissionsResources />
    </div>
  );
}
