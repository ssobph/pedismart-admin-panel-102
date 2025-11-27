import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = authService.isLoggedIn();
      setIsAuthenticated(isLoggedIn);
      
      if (isLoggedIn) {
        setCurrentUser(authService.getCurrentUser());
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      // Don't navigate here - let the LoginPage handle it
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      // Re-throw the error so LoginPage can access the response data
      // (remainingAttempts, locked status, etc.)
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate("/login");
  };

  // Update user function
  const updateUser = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('admin_user', JSON.stringify(updatedUserData));
  };

  // Auth context value
  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
