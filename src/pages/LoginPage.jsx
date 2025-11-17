import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Invalid credentials");
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Calculate lockout duration based on attempts (exponential backoff)
  const calculateLockoutDuration = (attempts) => {
    // 1st lockout (after 5 attempts): 1 minute
    // 2nd lockout (after 10 attempts): 5 minutes
    // 3rd lockout (after 15 attempts): 15 minutes
    // 4th+ lockout: 30 minutes
    const lockoutCycle = Math.floor(attempts / 5);
    const durations = [60, 300, 900, 1800]; // in seconds
    return durations[Math.min(lockoutCycle - 1, durations.length - 1)] * 1000; // convert to ms
  };

  // Check for existing lockout on mount
  useEffect(() => {
    const storedAttempts = parseInt(localStorage.getItem('admin_login_attempts') || '0');
    const storedLockoutTime = parseInt(localStorage.getItem('admin_lockout_time') || '0');
    
    setLoginAttempts(storedAttempts);
    
    if (storedLockoutTime > Date.now()) {
      setIsLocked(true);
      setLockoutTime(storedLockoutTime);
      setRemainingTime(Math.ceil((storedLockoutTime - Date.now()) / 1000));
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (isLocked && remainingTime > 0) {
      const timer = setInterval(() => {
        const timeLeft = Math.ceil((lockoutTime - Date.now()) / 1000);
        if (timeLeft <= 0) {
          setIsLocked(false);
          setRemainingTime(0);
          localStorage.removeItem('admin_lockout_time');
        } else {
          setRemainingTime(timeLeft);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime, remainingTime]);

  // Format remaining time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      setError(true);
      setErrorMessage(`Too many failed attempts. Please try again in ${formatTime(remainingTime)}.`);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    try {
      console.log("Attempting login with:", email, password);
      
      // Use the login function from AuthContext
      const success = await login(email, password);
      console.log("Login successful:", success);
      
      // Reset attempts on successful login
      localStorage.removeItem('admin_login_attempts');
      localStorage.removeItem('admin_lockout_time');
      setLoginAttempts(0);
      
      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      console.error("Login error details:", err);
      
      // Increment failed attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('admin_login_attempts', newAttempts.toString());
      
      let message = "Invalid credentials. Please check your email and password.";
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        // Use server message if available, otherwise use default
        message = err.response.data?.message || message;
        
        // Standardize "Invalid credentials" message
        if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('incorrect')) {
          message = "Invalid credentials. Please check your email and password.";
        }
      }
      
      // Check if we need to lock the account
      if (newAttempts % 5 === 0) {
        const lockDuration = calculateLockoutDuration(newAttempts);
        const lockUntil = Date.now() + lockDuration;
        
        localStorage.setItem('admin_lockout_time', lockUntil.toString());
        setLockoutTime(lockUntil);
        setIsLocked(true);
        setRemainingTime(Math.ceil(lockDuration / 1000));
        
        const minutes = Math.ceil(lockDuration / 60000);
        message = `Too many failed login attempts (${newAttempts}). Account locked for ${minutes} minute${minutes > 1 ? 's' : ''}. Please try again later.`;
      } else {
        const attemptsLeft = 5 - (newAttempts % 5);
        message = `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining before temporary lockout.`;
      }
      
      setErrorMessage(message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      {/* Background */}
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100'} opacity-90 transition-colors duration-300`} />
      {/* Theme toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'} transition-colors z-20`}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`z-10 w-full max-w-md p-8 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-xl transition-colors duration-300`}
      >
        <div className="flex flex-col items-center justify-center mb-6">
          <img 
            src="/pedismart_logo.png" 
            alt="PediSmart Admin Panel" 
            className="h-28 w-auto mb-4"
          />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Admin Login</h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2 transition-colors duration-300`}>
            Login to manage users and system settings
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-300`}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 pr-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-300`}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || isLocked}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin mr-2" />
                Signing In...
              </>
            ) : isLocked ? (
              `Locked (${formatTime(remainingTime)})`
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md flex items-center text-red-200"
            >
              <AlertCircle size={18} className="mr-2" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPage;
