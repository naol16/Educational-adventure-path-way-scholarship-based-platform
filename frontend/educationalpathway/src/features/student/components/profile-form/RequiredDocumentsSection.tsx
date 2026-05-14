import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Upload, FileText, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { DOCUMENT_REQUIREMENTS, EducationLevel } from "../../constants/document-requirements";
import { Modal } from "@/components/ui/Modal";

interface RequiredDocumentsSectionProps {
  degreeSeeking: string;
}

export const RequiredDocumentsSection: React.FC<RequiredDocumentsSectionProps> = ({ degreeSeeking }) => {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; type: string } | null>(null);
  
  const level = (degreeSeeking as EducationLevel) || "Bachelor's";
  const requirements = DOCUMENT_REQUIREMENTS[level] || DOCUMENT_REQUIREMENTS["Bachelor's"];

  const mandatoryDocs = requirements.filter(doc => doc.required);
  const optionalDocs = requirements.filter(doc => !doc.required);

  const handlePreview = (file: any, name: string) => {
    let url = "";
    let type = "image";

    if (typeof file === 'string') {
      url = file;
      type = file.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
    } else if (file instanceof File) {
      url = URL.createObjectURL(file);
      type = file.type.includes('pdf') ? 'pdf' : 'image';
    }

    if (url) {
      setPreviewDoc({ url, name, type });
    }
  };

  const renderDocCard = (doc: any) => {
    const fieldName = `documents.${doc.id}`;
    const file = watch(fieldName);
    const hasError = !!(errors.documents as any)?.[doc.id];

    return (
      <div
        key={doc.id}
        className={`relative border-2 border-dashed rounded-2xl p-5 transition-all group flex flex-col items-center justify-center min-h-[160px] ${
          file 
            ? 'border-success/50 bg-success/5' 
            : hasError 
              ? 'border-destructive/50 bg-destructive/5' 
              : 'border-input hover:border-primary bg-muted/20'
        }`}
      >
        <input
          type="file"
          id={doc.id}
          aria-label={doc.name}
          accept=".pdf,.doc,.docx,image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) => {
            const uploadedFile = e.target.files?.[0];
            if (uploadedFile) {
              setValue(fieldName, uploadedFile, { shouldValidate: true });
            }
          }}
        />

        {file ? (
          <div className="text-center animate-in fade-in zoom-in-95 duration-300 w-full">
            <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            
            <p className="text-xs font-bold text-foreground truncate px-2">
              {file instanceof File ? file.name : doc.name}
            </p>
            
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePreview(file, doc.name);
                }}
                className="text-[10px] text-primary hover:underline pointer-events-auto relative z-20 font-bold uppercase flex items-center gap-1"
              >
                <Eye size={10} />
                Preview
              </button>
              
              <span className="text-muted-foreground opacity-30">|</span>
              
              <a 
                href={typeof file === 'string' ? file : URL.createObjectURL(file)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] text-primary hover:underline pointer-events-auto relative z-20 font-bold uppercase"
                onClick={(e) => e.stopPropagation()}
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {doc.name}
              {doc.required && <span className="text-destructive ml-1">*</span>}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 px-4 leading-tight">
              {doc.description}
            </p>
          </div>
        )}
        
        {hasError && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <p className="text-[10px] text-destructive font-bold flex items-center gap-1">
              <AlertCircle size={10} />
              Required
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Mandatory Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-md font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText className="text-primary w-5 h-5" />
            Mandatory Documents
          </h3>
          <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-full">
            Required for {level}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mandatoryDocs.map(renderDocCard)}
        </div>
      </div>

      {/* Optional Documents */}
      {optionalDocs.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-md font-black text-foreground/60 uppercase tracking-wider flex items-center gap-2">
              <FileText className="text-muted-foreground w-5 h-5" />
              Optional Documents
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Highly Recommended
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {optionalDocs.map(renderDocCard)}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name}
        size="xl"
      >
        <div className="w-full h-[70vh] flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
          {previewDoc?.type === 'pdf' ? (
            <iframe 
              src={previewDoc.url} 
              className="w-full h-full border-none" 
              title="PDF Preview"
            />
          ) : (
            <img 
              src={previewDoc?.url} 
              alt="Document Preview" 
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

