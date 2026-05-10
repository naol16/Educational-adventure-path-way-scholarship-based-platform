import { ContactPage } from "@/features/marketing/components/ContactPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Admas Educational Pathway",
  description: "Get in touch with our educational experts. We are here to help you navigate your scholarship journey and career path.",
};

export default function Contact() {
  return <ContactPage />;
}

