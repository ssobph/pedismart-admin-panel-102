import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, XCircle, Trash2, Edit3, Image as ImageIcon, ZoomIn, ZoomOut, Maximize, Minimize, RotateCw, Download, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../../services/userService';
import { useTheme } from '../../context/ThemeContext';

// Advanced image viewer component with full-screen modal and zoom controls
const ImageViewer = ({ url, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const closeButtonRef = useRef(null);
  const { isDarkMode } = useTheme();

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleFullScreenToggle = () => {
    setShowFullScreen(!showFullScreen);
    // Reset zoom and position when toggling full screen
    handleReset();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFullScreen) {
        if (e.key === 'Escape') {
          setShowFullScreen(false);
          handleReset();
        } else if (e.key === '+') {
          handleZoomIn();
        } else if (e.key === '-') {
          handleZoomOut();
        } else if (e.key === 'r') {
          handleRotate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullScreen]);

  if (!url) return null;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-400">{title}</h4>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center px-2 py-1 rounded hover:bg-blue-50 hover:bg-opacity-10 transition-colors"
        >
          {isOpen ? 'Hide' : 'View'} <ImageIcon size={12} className="ml-1" />
        </button>
      </div>
      {isOpen && (
        <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} transition-colors duration-200 max-h-[250px] flex flex-col`}>
          {/* Image header with title - fixed at top */}
          <div className={`px-3 py-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-100'} flex justify-between items-center sticky top-0 z-10`}>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</span>
            <div className="flex space-x-2">
              <button 
                onClick={handleFullScreenToggle}
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                title="View full screen"
              >
                <Maximize size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
          </div>
          
          {/* Scrollable image container - takes remaining height */}
          <div className="relative overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <img 
              src={url} 
              alt={title} 
              className="w-full h-auto object-contain" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
              }}
              onClick={handleFullScreenToggle}
              style={{ cursor: 'zoom-in' }}
            />
          </div>
          
          {/* Image footer with controls */}
          <div className={`px-3 py-2 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-100'} flex justify-between items-center`}>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click image to expand</span>
            <button
              onClick={handleFullScreenToggle}
              className={`text-xs flex items-center ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
            >
              <ZoomIn size={12} className="mr-1" /> Zoom
            </button>
          </div>
        </div>
      )}

      {/* Full-screen modal */}
      {showFullScreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col justify-center items-center"
          onClick={(e) => {
            // Close modal when clicking outside the image
            if (e.target === e.currentTarget) {
              setShowFullScreen(false);
              handleReset();
            }
          }}
        >
          {/* Top toolbar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black to-transparent z-10">
            <h3 className="text-white text-lg font-medium">{title}</h3>
            <div>
              <button 
                ref={closeButtonRef}
                onClick={() => {
                  setShowFullScreen(false);
                  handleReset();
                }}
                className="text-white hover:text-gray-300 transition-colors p-3 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close fullscreen view"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Image container */}
          <div 
            className="relative w-full h-full flex justify-center items-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <img
              ref={imageRef}
              src={url}
              alt={title}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
              }}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex justify-center space-x-4">
              <button 
                onClick={handleZoomIn}
                className="text-white hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-900"
                title="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
              <button 
                onClick={handleZoomOut}
                className="text-white hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-900"
                title="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <button 
                onClick={handleRotate}
                className="text-white hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-900"
                title="Rotate 90°"
              >
                <RotateCw size={20} />
              </button>
              <button 
                onClick={handleReset}
                className="text-white hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-900"
                title="Reset view"
              >
                <Minimize size={20} />
              </button>
            </div>
            <div className="text-center text-white text-xs mt-2">
              Zoom: {Math.round(zoomLevel * 100)}% | Rotation: {rotation}° | Drag to pan when zoomed in | ESC to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserDetailsModal = ({ user, onClose, onUserUpdated }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDisapproveForm, setShowDisapproveForm] = useState(false);
  const [disapproveReason, setDisapproveReason] = useState('');
  const [rejectionDeadline, setRejectionDeadline] = useState('');
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [penaltyComment, setPenaltyComment] = useState('');
  const [penaltyLiftDate, setPenaltyLiftDate] = useState('');
  
  // Local state for current user data (updates when user is modified)
  const [currentUser, setCurrentUser] = useState(user);
  
  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
    sex: user?.sex || '',
    schoolId: user?.schoolId || '',
    licenseId: user?.licenseId || '',
    userRole: user?.userRole || '',
    vehicleType: user?.vehicleType || ''
  });

  // Handle approve user
  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const updatedUser = await userService.approveUser(user._id);
      console.log('User approved successfully:', updatedUser);
      
      // Update local state
      setCurrentUser(updatedUser);
      
      setSuccess('User approved successfully!');
      
      // Wait a moment to show success message
      setTimeout(() => {
        onUserUpdated(updatedUser);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error in handleApprove:', err);
      setError(err.response?.data?.message || 'Failed to approve user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show disapprove form
  const showDisapproveUserForm = () => {
    setDisapproveReason('');
    setRejectionDeadline('');
    setShowDisapproveForm(true);
  };
  
  // Remove penalty
  const handleRemovePenalty = async () => {
    if (!window.confirm('Are you sure you want to remove this penalty?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const updatedUser = await userService.addPenalty(user._id, { 
        penaltyComment: '',
        penaltyLiftDate: new Date('1970-01-01').toISOString() // Set to past date to remove
      });
      
      console.log('Penalty removed successfully:', updatedUser);
      
      // Update local state to show penalty was removed
      setCurrentUser(updatedUser);
      setSuccess('Penalty removed successfully!');
      
      setTimeout(() => {
        onUserUpdated(updatedUser);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error removing penalty:', err);
      setError(err.response?.data?.message || 'Failed to remove penalty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle disapprove user
  const handleDisapprove = async () => {
    if (!disapproveReason.trim()) {
      setError('Please provide a reason for disapproval');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const requestData = { 
        reason: disapproveReason,
        rejectionDeadline: rejectionDeadline || null 
      };
      
      console.log('🚀 Sending disapprove request with data:', requestData);
      console.log('Reason:', disapproveReason);
      console.log('Deadline:', rejectionDeadline);
      
      const updatedUser = await userService.disapproveUser(user._id, requestData);
      console.log('✅ User disapproved successfully:', updatedUser);
      console.log('✅ Returned disapprovalReason:', updatedUser.disapprovalReason);
      
      // Update local state to show the saved reason immediately
      setCurrentUser(updatedUser);
      
      // Update the parent component with the new user data
      onUserUpdated(updatedUser);
      
      // Hide the form and show success message
      setShowDisapproveForm(false);
      setSuccess('User disapproved successfully! Reason has been saved.');
      
      // Keep modal open so user can see the saved reason
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('❌ Error in handleDisapprove:', err);
      setError(err.response?.data?.message || 'Failed to disapprove user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel disapprove
  const cancelDisapprove = () => {
    setShowDisapproveForm(false);
    setDisapproveReason('');
    setRejectionDeadline('');
  };

  // Show penalty form
  const showPenaltyCommentForm = () => {
    if (user.status !== 'disapproved') {
      setError('User must be disapproved before adding a penalty');
      return;
    }
    
    setPenaltyComment(user.penaltyComment || '');
    // Set default lift date to 7 days from now if not already set
    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    const defaultLiftDate = user.penaltyLiftDate 
      ? new Date(user.penaltyLiftDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setPenaltyLiftDate(defaultLiftDate);
    setShowPenaltyForm(true);
  };

  // Handle add penalty comment
  const handleAddPenalty = async () => {
    if (!penaltyComment.trim()) {
      setError('Please provide a penalty comment');
      return;
    }

    if (!penaltyLiftDate) {
      setError('Please select a penalty lift date');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Convert datetime-local format to ISO string
      const liftDateISO = new Date(penaltyLiftDate).toISOString();
      
      console.log('Sending penalty data:', {
        penaltyComment: penaltyComment.trim(),
        penaltyLiftDate: liftDateISO
      });
      
      const updatedUser = await userService.addPenalty(user._id, { 
        penaltyComment: penaltyComment.trim(),
        penaltyLiftDate: liftDateISO
      });
      
      // Update local state to show the saved penalty immediately
      setCurrentUser(updatedUser);
      
      // Update the local user object with the updated data
      const updatedUserData = {
        ...user,
        penaltyComment,
        penaltyLiftDate,
        hasPenalty: true
      };
      
      setShowPenaltyForm(false);
      
      // Only notify parent component if the user was actually updated
      if (updatedUser) {
        // Pass the updated user to the parent component
        if (onUserUpdated) {
          // Just pass the updated user without triggering additional API calls
          onUserUpdated(updatedUserData);
        }
      }
      
      setSuccess('Penalty added successfully');
    } catch (err) {
      console.error('Error adding penalty:', err);
      setError(err.response?.data?.message || 'Failed to add penalty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel penalty comment
  const cancelPenaltyComment = () => {
    setShowPenaltyForm(false);
    setPenaltyComment('');
    setPenaltyLiftDate('');
  };

  // Handle delete user
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await userService.deleteUser(user._id);
        setSuccess('User deleted successfully!');
        
        // Wait a moment to show success message
        setTimeout(() => {
          onUserUpdated();
          onClose();
        }, 1500);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.response?.data?.message || 'Failed to delete user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Field changed: ${name} = ${value}`);
    setUserData({ ...userData, [name]: value });
    console.log('📝 Updated userData:', { ...userData, [name]: value });
  };

  // Handle update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log('🔄 handleUpdate called');
    console.log('📝 User data being sent:', userData);
    console.log('👤 User ID:', user._id);
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Prepare data to send - only include role-specific fields
      const dataToSend = {
        firstName: userData.firstName,
        middleName: userData.middleName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        sex: userData.sex,
        role: userData.role
      };
      
      // Add role-specific fields
      if (userData.role === 'customer') {
        dataToSend.userRole = userData.userRole;
        dataToSend.schoolId = userData.schoolId;
      } else if (userData.role === 'rider') {
        dataToSend.licenseId = userData.licenseId;
        dataToSend.vehicleType = userData.vehicleType;
      }
      
      console.log('📤 Sending update request with filtered data:', dataToSend);
      const updatedUser = await userService.updateUser(user._id, dataToSend);
      console.log('✅ Update successful:', updatedUser);
      
      // Update local state
      setCurrentUser(updatedUser);
      setEditMode(false);
      setSuccess('User updated successfully!');
      
      // Update the user data in the component state
      Object.assign(user, updatedUser);
      
      // Wait a moment to show success message
      setTimeout(() => {
        onUserUpdated(updatedUser);
      }, 1500);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto py-4">
      <motion.div 
        className={`rounded-xl max-w-2xl w-full mx-4 border shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300 max-h-[90vh] flex flex-col`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Fixed Header */}
        <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
            {editMode ? 'Edit User' : showPenaltyForm ? 'Add Penalty Comment' : 'User Details'}
          </h2>
          <button 
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} transition-colors p-2 rounded-full hover:bg-gray-100 hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">

          {error && (
            <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'} transition-colors duration-300 flex items-center`}>
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'} transition-colors duration-300 flex items-center`}>
              <CheckCircle size={16} className="mr-2 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

        {showDisapproveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
            <motion.div 
              className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-xl transition-colors duration-300`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.disapprovalReason ? 'Edit Disapproval Reason' : 'Disapprove User'}
                </h3>
                <button 
                  onClick={cancelDisapprove}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} transition-colors p-2 rounded-full hover:bg-gray-100 hover:bg-opacity-10`}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              {error && (
                <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'} flex items-center`}>
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason for Disapproval
                </label>
                <textarea
                  value={disapproveReason}
                  onChange={(e) => setDisapproveReason(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  rows="4"
                  placeholder="Enter reason for disapproval..."
                />
              </div>
              
              <div className="mb-6">
                <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Auto-Unblock Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={rejectionDeadline}
                  onChange={(e) => setRejectionDeadline(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Select deadline for automatic unblock..."
                />
                <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  If set, the user will be automatically approved after this date/time
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDisapprove}
                  className={`px-4 py-2 rounded-md transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisapprove}
                  disabled={loading || !disapproveReason.trim()}
                  className={`px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center ${(!disapproveReason.trim() || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Disapprove'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showPenaltyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
            <motion.div 
              className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-xl transition-colors duration-300`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.penaltyComment ? 'Edit Penalty' : 'Add Penalty'}
                </h3>
                <button 
                  onClick={cancelPenaltyComment}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} transition-colors p-2 rounded-full hover:bg-gray-100 hover:bg-opacity-10`}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              {error && (
                <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'} flex items-center`}>
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Penalty Comment
                </label>
                <textarea
                  value={penaltyComment}
                  onChange={(e) => setPenaltyComment(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  rows="4"
                  placeholder="Enter reason for penalty..."
                />
              </div>
              
              <div className="mb-6">
                <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Penalty Lift Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={penaltyLiftDate}
                  onChange={(e) => setPenaltyLiftDate(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  User will be automatically unblocked after this date/time
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                {user.penaltyComment && (
                  <button
                    onClick={handleRemovePenalty}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Remove Penalty
                  </button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <button
                    onClick={cancelPenaltyComment}
                    className={`px-4 py-2 rounded-md transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPenalty}
                    disabled={loading || !penaltyComment.trim() || !penaltyLiftDate}
                    className={`px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white transition-colors flex items-center ${(!penaltyComment.trim() || !penaltyLiftDate || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Penalty'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {!showPenaltyForm && !showDisapproveForm && editMode ? (
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={userData.middleName}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Sex</label>
                <select
                  name="sex"
                  value={userData.sex}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {userData.role === 'customer' && (
                <div>
                  <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>User Role</label>
                  <select
                    name="userRole"
                    value={userData.userRole}
                    onChange={handleChange}
                    className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                  >
                    <option value="">Select</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              )}
              {userData.role === 'customer' && (
                <div>
                  <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>School ID</label>
                  <input
                    type="text"
                    name="schoolId"
                    value={userData.schoolId}
                    onChange={handleChange}
                    className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                  />
                </div>
              )}
              {userData.role === 'rider' && (
                <>
                  <div>
                    <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>License ID</label>
                    <input
                      type="text"
                      name="licenseId"
                      value={userData.licenseId}
                      onChange={handleChange}
                      className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={userData.vehicleType}
                      onChange={handleChange}
                      className={`w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                    >
                      <option value="">Select</option>
                      <option value="Single Motorcycle">Single Motorcycle</option>
                      <option value="Tricycle">Tricycle</option>
                      <option value="Cab">Cab</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : !showPenaltyForm && !showDisapproveForm ? (
          <div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Full Name</h3>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
                    {user.firstName} {user.middleName && `${user.middleName} `}{user.lastName}
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Email</h3>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{user.email}</p>
                </div>
                <div>
                  <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Phone</h3>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Role</h3>
                  <p className={`capitalize ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{user.role || 'N/A'}</p>
                </div>
                <div>
                  <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Sex</h3>
                  <p className={`capitalize ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{user.sex || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Status</h3>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
                    {user.status === "approved" ? "Approved" : 
                     user.status === "disapproved" ? "Disapproved" : 
                     "Pending"}
                  </p>
                </div>
                {currentUser.status === "disapproved" && currentUser.disapprovalReason && (
                  <div className="mt-2 p-3 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} transition-colors duration-300`}>Disapproval Reason</h3>
                        <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{currentUser.disapprovalReason}</p>
                        {currentUser.rejectionDeadline && (
                          <div className="mt-2">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} transition-colors duration-300`}>Auto-unblock: </span>
                            <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
                              {new Date(currentUser.rejectionDeadline).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setDisapproveReason(currentUser.disapprovalReason);
                          setRejectionDeadline(currentUser.rejectionDeadline ? new Date(currentUser.rejectionDeadline).toISOString().slice(0, 16) : '');
                          setShowDisapproveForm(true);
                        }}
                        className={`ml-2 p-2 rounded-md transition-colors ${isDarkMode ? 'hover:bg-yellow-800' : 'hover:bg-yellow-100'}`}
                        title="Edit disapproval reason"
                      >
                        <Edit3 size={16} className={isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} />
                      </button>
                    </div>
                  </div>
                )}
                {currentUser.penaltyComment && (
                  <div className="mt-2 p-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'} transition-colors duration-300`}>Penalty Information</h3>
                        <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{currentUser.penaltyComment}</p>
                        {currentUser.penaltyLiftDate && (
                          <div className="mt-2">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'} transition-colors duration-300`}>Banned until: </span>
                            <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
                              {new Date(currentUser.penaltyLiftDate).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setPenaltyComment(currentUser.penaltyComment);
                          setPenaltyLiftDate(currentUser.penaltyLiftDate ? new Date(currentUser.penaltyLiftDate).toISOString().slice(0, 16) : '');
                          setShowPenaltyForm(true);
                        }}
                        className={`ml-2 p-2 rounded-md transition-colors ${isDarkMode ? 'hover:bg-red-800' : 'hover:bg-red-100'}`}
                        title="Edit penalty"
                      >
                        <Edit3 size={16} className={isDarkMode ? 'text-red-300' : 'text-red-600'} />
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Registered On</h3>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Role-specific information */}
              {user.role === 'customer' && (
                <div className={`mt-4 border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
                  <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>User Role</h3>
                      <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{user.userRole || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>School ID</h3>
                      <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{user.schoolId || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {user.role === 'rider' && (
                <div className={`mt-4 border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
                  <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Rider Information</h3>
                  <div className="space-y-3">
                    <div>
                      <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>License ID</h3>
                      <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{user.licenseId || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Vehicle Type</h3>
                      <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{user.vehicleType || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Documents and Images Section */}
              <div className={`mt-4 border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Documents & Images</h3>
                
                {/* Profile Photo */}
                <ImageViewer url={user.photo} title="Profile Photo" />
                
                {/* Customer-specific documents */}
                {user.role === 'customer' && (
                  <>
                    <ImageViewer url={user.schoolIdDocument} title="School ID Document" />
                  </>
                )}
                
                {/* Rider-specific documents */}
                {user.role === 'rider' && (
                  <>
                    <ImageViewer url={user.driverLicense} title="Driver's License" />
                    <ImageViewer url={user.cor} title="Certificate of Registration" />
                  </>
                )}
                
                {!user.photo && !user.schoolIdDocument && 
                 !user.driverLicense && !user.cor && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                    No documents uploaded
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditMode(true)}
                className={`px-4 py-2 rounded-md flex items-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} transition-colors duration-200`}
              >
                <Edit3 size={16} className="mr-2" />
                Edit
              </button>
              {user.status === 'pending' && (
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md flex items-center ${isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white transition-colors duration-200`}
                >
                  {loading ? (
                    <Loader size={16} className="mr-2 animate-spin" />
                  ) : (
                    <CheckCircle size={16} className="mr-2" />
                  )}
                  Approve
                </button>
              )}
              {(user.status === 'pending' || user.status === 'approved') && (
                <button
                  onClick={showDisapproveUserForm}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md flex items-center ${isDarkMode ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-yellow-600 hover:bg-yellow-500'} text-white transition-colors duration-200`}
                >
                  {loading ? (
                    <Loader size={16} className="mr-2 animate-spin" />
                  ) : (
                    <XCircle size={16} className="mr-2" />
                  )}
                  Disapprove
                </button>
              )}
              {user.status === "disapproved" && (
                <button
                  onClick={showPenaltyCommentForm}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center"
                  disabled={loading}
                >
                  <Edit3 size={16} className="mr-1" />
                  {user.penaltyComment ? 'Edit Penalty' : 'Add Penalty'}
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center"
                disabled={loading}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetailsModal;
