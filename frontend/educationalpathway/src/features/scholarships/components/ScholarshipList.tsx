"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { Scholarship, ScholarshipFilters, PaginatedResponse } from "../types";
import { ScholarshipCard } from "./ScholarshipCard";

interface ScholarshipListProps {
  filters: ScholarshipFilters;
  activeTab: string;
  onPageChange?: (page: number) => void;
}

export const ScholarshipList = ({
  filters,
  activeTab,
  onPageChange,
}: ScholarshipListProps) => {
  const swrKey = useMemo(() => {
    let baseUrl =
      activeTab === "explore"
        ? "/scholarships"
        : activeTab === "matched"
          ? "/scholarships/match"
          : "/scholarships/tracking/me";

    const params = new URLSearchParams();
    if (filters.query) params.append("query", filters.query);
    if (filters.country) params.append("country", filters.country);
    if (filters.degree_level)
      params.append("degree_level", filters.degree_level);
    if (filters.fund_type) params.append("fund_type", filters.fund_type);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.pageSize)
      params.append("pageSize", filters.pageSize.toString());

    const queryStr = params.toString();
    return queryStr ? `${baseUrl}?${queryStr}` : baseUrl;
  }, [activeTab, filters]);

  const { data: rawData, isLoading, error: swrError } = useSWR<any>(swrKey);

  const pagination = useMemo(() => {
    if (
      (activeTab === "explore" || activeTab === "matched") &&
      rawData?.pagination
    ) {
      return rawData.pagination;
    }
    return null;
  }, [rawData, activeTab]);

  const scholarships = useMemo<Scholarship[]>(() => {
    if (!rawData) return [];

    if (activeTab === "explore" || activeTab === "matched") {
      const items = Array.isArray(rawData) ? rawData : rawData.data || [];
      return items;
    }

    return [];
  }, [rawData, activeTab]);

  const error = swrError?.response?.data?.message || swrError?.message || null;
  const loading = isLoading;

  return (
    <div className="space-y-6">
      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
            Finding Matches...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-destructive/5 rounded-xl border border-destructive/10">
          <p className="text-destructive font-medium mb-4">{error}</p>
          {error.includes("onboarded") && (
            <Button
              onClick={() =>
                (window.location.href = "/dashboard/student/profile")
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg"
            >
              Complete Your Profile
            </Button>
          )}
        </div>
      ) : scholarships.length > 0 ? (
        <>
          {/* Results Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
          >
            <AnimatePresence mode="popLayout">
              {scholarships.map((s, idx) => (
                <ScholarshipCard
                  key={s.id || `card-${idx}`}
                  scholarship={s}
                  variant="grid"
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-10">
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                className="h-10 w-10 md:h-12 md:w-12 rounded-lg border-border/40 hover:bg-muted shrink-0"
              >
                <ChevronLeft size={20} />
              </Button>

              <div className="flex items-center gap-1 md:gap-2 px-1 md:px-4">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                  
                  // Mobile: show current, first, last. Desktop: show current +/- 1, first, last.
                  const shouldShow = isMobile 
                    ? (pageNum === 1 || pageNum === pagination.totalPages || pageNum === pagination.page)
                    : (pageNum === 1 || pageNum === pagination.totalPages || (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1));

                  if (shouldShow) {
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pagination.page === pageNum ? "default" : "outline"
                        }
                        onClick={() => onPageChange?.(pageNum)}
                        className={`h-10 w-10 md:h-12 md:w-12 rounded-lg font-bold transition-all text-xs md:text-sm ${
                          pagination.page === pageNum
                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10"
                            : "border-border/40 hover:bg-muted"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  
                  // Ellipsis logic
                  if (
                    (pageNum === 2 && (isMobile ? pagination.page > 2 : pagination.page > 3)) ||
                    (pageNum === pagination.totalPages - 1 && (isMobile ? pagination.page < pagination.totalPages - 1 : pagination.page < pagination.totalPages - 2))
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="text-muted-foreground/30 font-black px-1"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
                className="h-10 w-10 md:h-12 md:w-12 rounded-lg border-border/40 hover:bg-muted shrink-0"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-24 bg-muted/20 rounded-xl border-2 border-dashed border-border/50 px-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-bold text-lg mb-1">
            No Recommended Scholarships
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto text-balance">
            Try adjusting your search filters or completing more of your profile
            to find more opportunities.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className="mt-6 text-xs font-bold text-primary hover:bg-primary/5"
          >
            REFRESH DISCOVERY
          </Button>
        </div>
      )}
    </div>
  );
};
