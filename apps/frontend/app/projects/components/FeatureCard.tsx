
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon } from "lucide-react";
import { Feature } from "../types";

interface FeatureCardProps {
    feature: Feature;
    onClick?: () => void;
    onDoubleClick?: () => void;
    onDelete?: () => void;
}

export function FeatureCard({ feature, onClick, onDoubleClick, onDelete }: FeatureCardProps) {
    return (
        <div 
            className="bg-card p-3 rounded-md shadow-sm border border-border hover:border-primary/50 transition-colors group relative"
            onDoubleClick={onDoubleClick}
        >
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    className="cursor-pointer p-1 hover:bg-muted rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                </button>
                <button
                    className="cursor-pointer p-1 hover:bg-destructive/10 hover:text-destructive rounded focus:outline-none focus:ring-2 focus:ring-destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            </div>

            <div className="font-medium text-sm mb-1 pr-14">{feature.title}</div>
            {feature.description && (
                <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {feature.description}
                </div>
            )}

            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                    {feature.assignee ? (
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={feature.assignee.profileImage} />
                            <AvatarFallback>{feature.assignee.fullName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-muted-foreground" />
                        </div>
                    )}
                    {feature.priority && (
                        <Badge variant={
                            feature.priority === 'CRITICAL' ? 'destructive' :
                                feature.priority === 'HIGH' ? 'destructive' :
                                    feature.priority === 'MEDIUM' ? 'default' : 'secondary'
                        } className="text-[10px] px-1 py-0 h-5">
                            {feature.priority === 'CRITICAL' ? 'KRITIKUS' :
                                feature.priority === 'HIGH' ? 'MAGAS' :
                                    feature.priority === 'MEDIUM' ? 'KÖZEPES' : 'ALACSONY'}
                        </Badge>
                    )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                    {new Date(feature.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}
