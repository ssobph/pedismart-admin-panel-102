import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Edit, Trash2, Power, Shield, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { adminManagementService } from "../services/adminManagementService";
import Header from "../components/common/Header";

const AdminManagementPage = () => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  // Check if current user is super-admin
  const isSuperAdmin = currentUser?.role === 'super-admin' || currentUser?.adminRole === 'super-admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminManagementService.getAllAdmins();
      setAdmins(response.admins || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
      alert("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminManagementService.createAdmin(formData);
      alert("Admin created successfully");
      setShowCreateModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      console.error("Error creating admin:", error);
      alert(error.response?.data?.message || "Failed to create admin");
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      // Remove password if not changed
      if (!updateData.password) {
        delete updateData.password;
      }
      await adminManagementService.updateAdmin(selectedAdmin._id, updateData);
      alert("Admin updated successfully");
      setShowEditModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      console.error("Error updating admin:", error);
      alert(error.response?.data?.message || "Failed to update admin");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    
    try {
      await adminManagementService.deleteAdmin(id);
      alert("Admin deleted successfully");
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert(error.response?.data?.message || "Failed to delete admin");
    }
  };

  const handleToggleStatus = async (id) => {
    const admin = admins.find(a => a._id === id);
    if (!admin) return;
    
    const action = admin.isActive ? 'deactivate' : 'activate';
    const confirmMessage = admin.isActive 
      ? `Are you sure you want to deactivate ${admin.name}? They will not be able to log in until reactivated.`
      : `Are you sure you want to activate ${admin.name}?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      await adminManagementService.toggleAdminStatus(id);
      alert(`Admin ${action}d successfully`);
      fetchAdmins();
    } catch (error) {
      console.error("Error toggling admin status:", error);
      alert(error.response?.data?.message || `Failed to ${action} admin`);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
    setSelectedAdmin(null);
    setShowPassword(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex-1 overflow-auto relative z-10">
        <Header title="Admin Management" />
        <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
          <div className={`${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-100 border-red-400'} border rounded-lg p-6 text-center`}>
            <Shield className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-4`} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>
              Access Denied
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Only super-admins can access the Admin Management page.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Admin Management" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Create Admin Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <UserPlus size={20} />
            Create New Admin
          </button>
        </div>

        {/* Admins Table */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Admin
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Role
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Last Login
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                            <User size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {admin.name}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              @{admin.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          admin.role === 'super-admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          admin.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(admin)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(admin._id)}
                            className={`${admin.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} ${admin._id === currentUser?._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={admin._id === currentUser?._id ? 'Cannot deactivate your own account' : (admin.isActive ? 'Deactivate' : 'Activate')}
                            disabled={admin._id === currentUser?._id}
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className={`text-red-600 hover:text-red-900 ${admin._id === currentUser?._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={admin._id === currentUser?._id ? 'Cannot delete your own account' : 'Delete'}
                            disabled={admin._id === currentUser?._id}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Create New Admin
            </h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  <User size={16} className="inline mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  <Lock size={16} className="inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  <Shield size={16} className="inline mr-2" />
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                >
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Edit Admin
            </h2>
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                >
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                >
                  Update Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementPage;
