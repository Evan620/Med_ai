import { useState } from "react";
import { User, LogOut, Settings, ChevronDown, GraduationCap, Building, Stethoscope, MapPin, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  onEditProfile?: () => void;
}

export const UserProfile = ({ onEditProfile }: UserProfileProps) => {
  const { user, logout, getUserDisplayName, getRoleDisplay } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  if (!user) return null;

  // Debug: Log user data to console
  console.log('UserProfile - Current user data:', user);

  const getInitials = () => {
    const firstName = user.firstName || "U";
    const lastName = user.lastName || "U";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'student':
        return <GraduationCap className="h-3 w-3" />;
      case 'resident':
      case 'practitioner':
        return <Stethoscope className="h-3 w-3" />;
      case 'educator':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={getUserDisplayName()}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {getInitials()}
            </div>
          )}
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-foreground">
              {getUserDisplayName()}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {getRoleIcon()}
              {getRoleDisplay()}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={getUserDisplayName()}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {getInitials()}
              </div>
            )}
            <div>
              <div className="font-medium text-foreground">
                {getUserDisplayName()}
              </div>
              <div className="text-xs text-muted-foreground">
                {user.credentials || `${user.degree || ''} ${user.specialty || ''}`.trim() || getRoleDisplay()}
              </div>
              <div className="text-xs text-muted-foreground">
                {user.email}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {user.institution && (
          <DropdownMenuItem disabled>
            <Building className="mr-2 h-4 w-4" />
            <span className="text-xs">{user.institution}</span>
          </DropdownMenuItem>
        )}

        {(user.specialty || user.specialization) && (
          <DropdownMenuItem disabled>
            <Stethoscope className="mr-2 h-4 w-4" />
            <span className="text-xs">{user.specialty || user.specialization}</span>
          </DropdownMenuItem>
        )}

        {user.location && user.showLocation && (
          <DropdownMenuItem disabled>
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-xs">{user.location}</span>
          </DropdownMenuItem>
        )}

        {user.yearsOfExperience && (
          <DropdownMenuItem disabled>
            <Clock className="mr-2 h-4 w-4" />
            <span className="text-xs">{user.yearsOfExperience} years experience</span>
          </DropdownMenuItem>
        )}

        {user.yearOfStudy && (
          <DropdownMenuItem disabled>
            <GraduationCap className="mr-2 h-4 w-4" />
            <span className="text-xs">Year {user.yearOfStudy}</span>
          </DropdownMenuItem>
        )}

        {user.isVerified && (
          <DropdownMenuItem disabled>
            <Shield className="mr-2 h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-600">Verified Professional</span>
          </DropdownMenuItem>
        )}

        {(user.institution || user.specialty || user.specialization || user.location || user.yearsOfExperience || user.yearOfStudy || user.isVerified) && (
          <DropdownMenuSeparator />
        )}
        
        <DropdownMenuItem onClick={onEditProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
          {(!user.degree || !user.specialty) && (
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
              Incomplete
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
