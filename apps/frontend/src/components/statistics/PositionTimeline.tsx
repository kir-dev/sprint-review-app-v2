"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionHistory } from "@/context/AuthContext";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { Briefcase, Calendar } from "lucide-react";
import { Position } from "../../../app/logs/types";

interface PositionTimelineProps {
  currentPosition: Position;
  history: PositionHistory[];
}

const positionLabels: Record<Position, string> = {
  UJONC: "Újonc",
  TAG: "Tag",
  HR_FELELOS: "HR Felelős",
  PR_FELELOS: "PR Felelős",
  TANFOLYAMFELELOS: "Tanfolyamfelelős",
  GAZDASAGIS: "Gazdaságis",
  KORVEZETO_HELYETTES: "Körvezető Helyettes",
  KORVEZETO: "Körvezető",
  OREGTAG: "Öregtag",
  ARCHIVALT: "Archivált",
};

export function PositionTimeline({ currentPosition, history }: PositionTimelineProps) {
  // Merge current position (if not in history) with history?
  // Ideally, history contains everything.
  // If history is empty, show current position as "since creation" or similar if possible, or just current.
  
  // Sort history by start date descending
  const sortedHistory = [...history].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle>Pozíció Történet</CardTitle>
        </div>
        <CardDescription>
          A körben betöltött tisztségek története
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedHistory.length === 0 ? (
           <div className="text-center text-muted-foreground py-8">
             <p>Nincs rögzített előzmény.</p>
             <p className="text-sm mt-2">Jelenlegi pozíció: <span className="font-medium text-foreground">{positionLabels[currentPosition]}</span></p>
           </div>
        ) : (
            <div className="relative border-l border-muted ml-3 space-y-8 py-2">
            {sortedHistory.map((item, index) => {
                const isCurrent = !item.endDate;
                return (
                    <div key={item.id} className="relative pl-8">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border border-background ${isCurrent ? 'bg-primary' : 'bg-muted-foreground'}`} />
                        
                        <div className="flex flex-col gap-1">
                            <h3 className="font-semibold text-lg leading-none">
                                {positionLabels[item.position] || item.position}
                            </h3>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>
                                    {format(new Date(item.startDate), 'yyyy. MMM', { locale: hu })}
                                    {' - '}
                                    {item.endDate 
                                        ? format(new Date(item.endDate), 'yyyy. MMM', { locale: hu })
                                        : 'Jelenleg'
                                    }
                                </span>
                            </div>
                            {/* Duration calculation? */}
                        </div>
                    </div>
                );
            })}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
