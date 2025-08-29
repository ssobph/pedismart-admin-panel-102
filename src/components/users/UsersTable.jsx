import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader
} from "lucide-react";
import UserDetailsModal from "./UserDetailsModal";
import { useTheme } from "../../context/ThemeContext";

const UsersTable = ({ 
  users = [], 
  onFilterChange, 
  onApprove, 
  onDisapprove, 
  onDelete,
  actionInProgress
}) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [documentFilter, setDocumentFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [disapproveUserId, setDisapproveUserId] = useState(null);
  const [disapproveReason, setDisapproveReason] = useState('');
  const [disapproveLoading, setDisapproveLoading] = useState(false);

  // Apply filters when they change - with proper dependency array
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sex: sexFilter,
        userRole: userRoleFilter,
        vehicleType: vehicleTypeFilter,
        hasDocuments: documentFilter === "yes" ? true : documentFilter === "no" ? false : undefined
      });
    }
  }, [searchTerm, roleFilter, statusFilter, sexFilter, userRoleFilter, vehicleTypeFilter, documentFilter, onFilterChange]);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle role filter change
  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    // Reset role-specific filters when role changes
    if (e.target.value !== "customer") {
      setUserRoleFilter("");
    }
    if (e.target.value !== "rider") {
      setVehicleTypeFilter("");
    }
  };

  // Handle status filter change
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };
  
  // Handle sex filter change
  const handleSexFilter = (e) => {
    setSexFilter(e.target.value);
  };
  
  // Handle user role filter change
  const handleUserRoleFilter = (e) => {
    setUserRoleFilter(e.target.value);
  };
  
  // Handle vehicle type filter change
  const handleVehicleTypeFilter = (e) => {
    setVehicleTypeFilter(e.target.value);
  };
  
  // Handle document filter change
  const handleDocumentFilter = (e) => {
    setDocumentFilter(e.target.value);
  };
  
  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Open user details modal
  const openUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Close user details modal
  const closeUserDetails = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Handle user approval
  const handleApprove = (userId) => {
    console.log('Approving user:', userId);
    if (onApprove) {
      onApprove(userId);
    }
  };

  // Show disapprove modal
  const showDisapproveForm = (userId) => {
    setDisapproveUserId(userId);
    setDisapproveReason('');
    setShowDisapproveModal(true);
  };
  
  // Handle user disapproval
  const handleDisapprove = async () => {
    if (!disapproveReason.trim()) {
      // Show error or alert
      return;
    }
    
    setDisapproveLoading(true);
    try {
      if (onDisapprove && disapproveUserId) {
        await onDisapprove(disapproveUserId, { reason: disapproveReason });
        setShowDisapproveModal(false);
        setDisapproveUserId(null);
        setDisapproveReason('');
      }
    } catch (error) {
      console.error('Error disapproving user:', error);
    } finally {
      setDisapproveLoading(false);
    }
  };
  
  // Cancel disapprove
  const cancelDisapprove = () => {
    setShowDisapproveModal(false);
    setDisapproveUserId(null);
    setDisapproveReason('');
  };

  // Handle user deletion
  const handleDelete = (userId) => {
    console.log('Delete action for user:', userId);
    if (confirmDelete === userId) {
      console.log('Confirming delete for user:', userId);
      if (onDelete) {
        onDelete(userId);
      }
      setConfirmDelete(null);
    } else {
      setConfirmDelete(userId);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  // Check if an action is in progress for a user
  const isActionInProgress = (userId) => {
    return actionInProgress === userId;
  };

  return (
    <div className={`rounded-lg shadow-md overflow-hidden border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}>
      {/* Filters */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col gap-4 transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500'} transition-colors duration-300`}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} transition-colors duration-300`}
                value={roleFilter}
                onChange={handleRoleFilter}
              >
                <option value="">All Roles</option>
                <option value="customer">Customers</option>
                <option value="rider">Riders</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} transition-colors duration-300`}
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="disapproved">Disapproved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <button
              onClick={toggleAdvancedFilters}
              className={`px-4 py-2 rounded-md border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-gray-50 text-gray-900 hover:bg-gray-100'} transition-colors duration-300 flex items-center`}
            >
              {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
              <Filter size={16} className="ml-2" />
            </button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
            <div className="relative">
              <label className={`block mb-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sex</label>
              <select
                className={`block w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} transition-colors duration-300`}
                value={sexFilter}
                onChange={handleSexFilter}
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            {roleFilter === 'customer' && (
              <div className="relative">
                <label className={`block mb-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>User Role</label>
                <select
                  className={`block w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} transition-colors duration-300`}
                  value={userRoleFilter}
                  onChange={handleUserRoleFilter}
                >
                  <option value="">All</option>
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            )}
            
            {roleFilter === 'rider' && (
              <div className="relative">
                <label className={`block mb-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vehicle Type</label>
                <select
                  className={`block w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} transition-colors duration-300`}
                  value={vehicleTypeFilter}
                  onChange={handleVehicleTypeFilter}
                >
                  <option value="">All</option>
                  <option value="Single Motorcycle">Single Motorcycle</option>
                  <option value="Tricycle">Tricycle</option>
                  <option value="Cab">Cab</option>
                </select>
              </div>
            )}
            
            <div className="relative">
              <label className={`block mb-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Documents</label>
              <select
                className={`block w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} transition-colors duration-300`}
                value={documentFilter}
                onChange={handleDocumentFilter}
              >
                <option value="">All</option>
                <option value="yes">Has Documents</option>
                <option value="no">Missing Documents</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-300`}>
          <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} sticky top-0 z-10 transition-colors duration-300`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                User
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                Contact
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                Role & Details
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                Documents
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'bg-gray-900 divide-gray-700' : 'bg-white divide-gray-200'} transition-colors duration-300`}>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle size={32} className="mb-2" />
                    <p>No users found matching your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors duration-300`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-lg">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-400">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{user.email}</div>
                    <div className="text-sm text-gray-400">{user.phone || "No phone"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "rider" ? "bg-indigo-100 text-indigo-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {user.role === "rider" ? "Rider" : "Customer"}
                      </span>
                      
                      {user.sex && (
                        <span className="text-xs text-gray-400 capitalize">
                          {user.sex}
                        </span>
                      )}
                      
                      {user.role === "customer" && user.userRole && (
                        <span className="text-xs text-gray-400">
                          {user.userRole}
                        </span>
                      )}
                      
                      {user.role === "rider" && user.vehicleType && (
                        <span className="text-xs text-gray-400">
                          {user.vehicleType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "approved" ? "bg-green-100 text-green-800" : 
                      user.status === "disapproved" ? "bg-red-100 text-red-800" : 
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {user.status === "approved" ? "Approved" : 
                       user.status === "disapproved" ? "Disapproved" : 
                       "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {user.photo && (
                        <span className="text-xs text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Photo
                        </span>
                      )}
                      {(user.role === "customer" && user.schoolIdDocument) && (
                        <span className="text-xs text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> School ID
                        </span>
                      )}
                      {(user.role === "customer" && user.userRole && (user.userRole === "Faculty" || user.userRole === "Staff") && user.staffFacultyIdDocument) && (
                        <span className="text-xs text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Staff/Faculty ID
                        </span>
                      )}
                      {(user.role === "rider" && user.driverLicense) && (
                        <span className="text-xs text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> License
                        </span>
                      )}
                      {(user.role === "rider" && user.cor) && (
                        <span className="text-xs text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> COR
                        </span>
                      )}
                      {!user.photo && !user.schoolIdDocument && !user.staffFacultyIdDocument && !user.driverLicense && !user.cor && (
                        <span className="text-xs text-gray-400">
                          No documents
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {isActionInProgress(user._id) ? (
                        <div className="p-1">
                          <Loader size={18} className="animate-spin text-indigo-500" />
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openUserDetails(user)}
                            className="text-indigo-400 hover:text-indigo-300 p-2 hover:bg-indigo-900 rounded-full transition-colors cursor-pointer z-20"
                            title="View Details"
                            type="button"
                          >
                            <Eye size={18} />
                          </button>
                          {user.status === "approved" ? (
                            <button
                              onClick={() => showDisapproveForm(user._id)}
                              className="text-yellow-400 hover:text-yellow-300 p-2 hover:bg-yellow-900 rounded-full transition-colors cursor-pointer z-20"
                              title="Disapprove User"
                              type="button"
                            >
                              <UserX size={18} />
                            </button>
                          ) : user.status === "disapproved" ? (
                            <button
                              onClick={() => handleApprove(user._id)}
                              className="text-green-400 hover:text-green-300 p-2 hover:bg-green-900 rounded-full transition-colors cursor-pointer z-20"
                              title="Approve User"
                              type="button"
                            >
                              <UserCheck size={18} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(user._id)}
                                className="text-green-400 hover:text-green-300 p-2 hover:bg-green-900 rounded-full transition-colors cursor-pointer z-20"
                                title="Approve User"
                                type="button"
                              >
                                <UserCheck size={18} />
                              </button>
                              <button
                                onClick={() => showDisapproveForm(user._id)}
                                className="text-yellow-400 hover:text-yellow-300 p-2 hover:bg-yellow-900 rounded-full transition-colors cursor-pointer z-20"
                                title="Disapprove User"
                                type="button"
                              >
                                <UserX size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(user._id)}
                            className={`p-2 rounded-full transition-colors cursor-pointer z-20 ${
                              confirmDelete === user._id
                                ? "text-red-500 hover:text-red-400 hover:bg-red-900"
                                : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                            }`}
                            title={confirmDelete === user._id ? "Click again to confirm" : "Delete User"}
                            type="button"
                          >
                            {confirmDelete === user._id ? (
                              <CheckCircle size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User details modal */}
      {isModalOpen && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={closeUserDetails}
          onUserUpdated={(updatedUser) => {
            // If updatedUser is provided, it means the user was updated
            if (updatedUser) {
              console.log('User updated from modal:', updatedUser);
              
              // Only update if status changed or if it's a penalty update
              // This prevents infinite update loops
              const statusChanged = updatedUser.status !== selectedUser.status;
              const isPenaltyUpdate = updatedUser.penaltyComment !== selectedUser.penaltyComment || 
                                     updatedUser.penaltyLiftDate !== selectedUser.penaltyLiftDate;
              
              // Only trigger parent updates for status changes, not for penalty updates
              // This prevents the infinite update loop
              if (statusChanged) {
                if (updatedUser.status === "approved") {
                  onApprove(updatedUser._id);
                } else if (updatedUser.status === "disapproved") {
                  onDisapprove(updatedUser._id);
                }
              }
            }
          }}
        />
      )}

      {/* Disapprove modal */}
      {showDisapproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-md p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
                Disapprove User
              </h2>
              <button 
                onClick={cancelDisapprove}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors duration-300`}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                Please provide a reason for disapproving this user. This information will be used for administrative purposes.
              </p>
              <div className="mb-4">
                <label className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Reason for Disapproval</label>
                <textarea
                  value={disapproveReason}
                  onChange={(e) => setDisapproveReason(e.target.value)}
                  className={`w-full rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900 border border-gray-300'} transition-colors duration-300`}
                  placeholder="Enter detailed reason for disapproval..."
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelDisapprove}
                  className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  disabled={disapproveLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisapprove}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors flex items-center"
                  disabled={disapproveLoading}
                >
                  {disapproveLoading ? 'Processing...' : 'Confirm Disapproval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
