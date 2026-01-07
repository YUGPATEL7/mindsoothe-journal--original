import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, BookOpen, BarChart3, History, LogIn, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMood } from '@/contexts/MoodContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavbarProps {
  activeTab: 'journal' | 'history' | 'insights';
  onTabChange: (tab: 'journal' | 'history' | 'insights') => void;
}

const tabs = [
  { id: 'journal' as const, icon: BookOpen, label: 'Journal', tooltip: 'Write your thoughts' },
  { id: 'history' as const, icon: History, label: 'History', tooltip: 'View past entries' },
  { id: 'insights' as const, icon: BarChart3, label: 'Insights', tooltip: 'See your patterns' },
];

export const Navbar = ({ activeTab, onTabChange }: NavbarProps) => {
  const { privacyMode, setPrivacyMode } = useMood();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-40 px-4 py-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </motion.div>
              <span className="text-base sm:text-lg font-semibold text-foreground hidden sm:block">MindSoothe</span>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50">
              {tabs.map((tab) => (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => onTabChange(tab.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                        activeTab === tab.id
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-card shadow-sm rounded-lg"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </span>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="sm:hidden">
                    <p>{tab.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Privacy Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => setPrivacyMode(!privacyMode)}
                  whileHover={{ scale: 1.1, rotate: privacyMode ? -10 : 10 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    'p-2.5 sm:p-3 rounded-xl transition-all duration-300',
                    privacyMode
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'glass-button text-muted-foreground hover:text-foreground'
                  )}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: privacyMode ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {privacyMode ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </motion.div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{privacyMode ? 'Disable privacy mode' : 'Enable privacy mode'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Auth Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={handleAuthClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-300',
                    user
                      ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                      : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20'
                  )}
                >
                  {user ? (
                    <>
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
                        {getUserName()}
                      </span>
                      <LogOut className="w-4 h-4 sm:ml-1" />
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm font-medium">Login</span>
                    </>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{user ? 'Sign out' : 'Sign in to save your journal'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.nav>
    </TooltipProvider>
  );
};
