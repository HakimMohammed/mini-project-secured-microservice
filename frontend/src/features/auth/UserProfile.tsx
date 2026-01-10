import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { LogOut, User } from 'lucide-react';

export const UserProfile: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();

    if (!user) return null;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                    <span className="font-medium">{user.name || user.username}</span>
                    {isAdmin && (
                        <span className="text-xs text-muted-foreground">Administrator</span>
                    )}
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-2"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </Button>
        </div>
    );
};
