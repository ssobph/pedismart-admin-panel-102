import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Car,
  Bike,
  Truck,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calculator,
  Clock,
  Moon,
  Sun,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/common/Header';
import {
  getAllFareConfigs,
  saveFareConfig,
  toggleFareConfigStatus,
  deleteFareConfig,
  initializeDefaultFareConfigs,
  calculateFareEstimate,
} from '../services/fareConfigService';

const VEHICLE_ICONS = {
  'Tricycle': Truck,
  'Single Motorcycle': Bike,
  'Cab': Car,
};

const VEHICLE_COLORS = {
  'Tricycle': '#10B981',
  'Single Motorcycle': '#F59E0B',
  'Cab': '#3B82F6',
};

const FareManagementPage = () => {
  const { isDarkMode } = useTheme();
  const [fareConfigs, setFareConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    vehicleType: 'Tricycle',
    distanceKm: 5,
    passengerCount: 1,
  });
  const [calculatedFare, setCalculatedFare] = useState(null);

  useEffect(() => {
    fetchFareConfigs();
  }, []);

  const fetchFareConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFareConfigs(true);
      setFareConfigs(data.fareConfigs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setSaving(true);
      setError(null);
      await initializeDefaultFareConfigs();
      setSuccess('Default fare configurations initialized successfully');
      await fetchFareConfigs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async (config) => {
    try {
      setSaving(true);
      setError(null);
      await saveFareConfig(config);
      setSuccess(`Fare configuration for ${config.vehicleType} saved successfully`);
      setEditingConfig(null);
      await fetchFareConfigs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setError(null);
      await toggleFareConfigStatus(id);
      await fetchFareConfigs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteConfig = async (id, vehicleType) => {
    if (!window.confirm(`Are you sure you want to delete the fare configuration for ${vehicleType}?`)) {
      return;
    }
    
    try {
      setError(null);
      await deleteFareConfig(id);
      setSuccess(`Fare configuration for ${vehicleType} deleted successfully`);
      await fetchFareConfigs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCalculateFare = async () => {
    try {
      setError(null);
      const result = await calculateFareEstimate(
        calculatorData.vehicleType,
        calculatorData.distanceKm,
        calculatorData.passengerCount
      );
      setCalculatedFare(result.fareEstimate);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (config = null) => {
    if (config) {
      setEditingConfig({
        ...config,
        additionalCharges: config.additionalCharges || {},
      });
    } else {
      setEditingConfig({
        vehicleType: 'Tricycle',
        baseFare: 20,
        perKmRate: 2.8,
        minimumFare: 20,
        baseDistanceKm: 1,
        additionalCharges: {
          nightSurchargePercent: 0,
          nightStartHour: 22,
          nightEndHour: 5,
          peakHourSurchargePercent: 0,
          peakStartHour: 7,
          peakEndHour: 9,
          perPassengerCharge: 0,
        },
        isActive: true,
        description: '',
      });
    }
  };

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Fare Management" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-500"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">×</button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-500"
          >
            <CheckCircle size={20} />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => openEditModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Fare Config
          </button>
          
          <button
            onClick={handleInitializeDefaults}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={saving ? 'animate-spin' : ''} />
            Initialize Defaults
          </button>
          
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex items-center gap-2 px-4 py-2 ${showCalculator ? 'bg-amber-600' : 'bg-gray-600'} hover:bg-amber-700 text-white rounded-lg transition-colors`}
          >
            <Calculator size={18} />
            Fare Calculator
          </button>
          
          <button
            onClick={fetchFareConfigs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Fare Calculator */}
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${cardBg} rounded-xl p-6 mb-6 border ${borderColor}`}
          >
            <h3 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
              <Calculator size={20} className="text-amber-500" />
              Fare Calculator
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm ${textSecondary} mb-1`}>Vehicle Type</label>
                <select
                  value={calculatorData.vehicleType}
                  onChange={(e) => setCalculatorData({ ...calculatorData, vehicleType: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                >
                  <option value="Tricycle">Tricycle</option>
                  <option value="Single Motorcycle">Single Motorcycle</option>
                  <option value="Cab">Cab</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm ${textSecondary} mb-1`}>Distance (km)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={calculatorData.distanceKm}
                  onChange={(e) => setCalculatorData({ ...calculatorData, distanceKm: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm ${textSecondary} mb-1`}>Passengers</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={calculatorData.passengerCount}
                  onChange={(e) => setCalculatorData({ ...calculatorData, passengerCount: parseInt(e.target.value) || 1 })}
                  className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleCalculateFare}
                  className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Calculate
                </button>
              </div>
            </div>
            
            {calculatedFare && (
              <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <span className={`text-sm ${textSecondary}`}>Base Fare</span>
                    <p className={`text-lg font-semibold ${textPrimary}`}>₱{calculatedFare.breakdown.baseFare.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className={`text-sm ${textSecondary}`}>Distance Fare</span>
                    <p className={`text-lg font-semibold ${textPrimary}`}>₱{calculatedFare.breakdown.distanceFare.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className={`text-sm ${textSecondary}`}>Night Surcharge</span>
                    <p className={`text-lg font-semibold ${textPrimary}`}>₱{calculatedFare.breakdown.nightSurcharge.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className={`text-sm ${textSecondary}`}>Peak Surcharge</span>
                    <p className={`text-lg font-semibold ${textPrimary}`}>₱{calculatedFare.breakdown.peakSurcharge.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className={`text-sm ${textSecondary}`}>Total Fare</span>
                    <p className="text-2xl font-bold text-emerald-500">₱{calculatedFare.totalFare.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Info Banner */}
        <div className={`${cardBg} rounded-xl p-4 mb-6 border ${borderColor} flex items-start gap-3`}>
          <Info size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className={textSecondary}>
            <p className="text-sm">
              Configure fare rates for each vehicle type. The fare is calculated as: 
              <span className="font-mono mx-1">Base Fare + (Distance - Base Distance) × Per KM Rate</span>
              with optional surcharges for night time, peak hours, and additional passengers.
            </p>
          </div>
        </div>

        {/* Fare Configs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw size={32} className="animate-spin text-indigo-500" />
          </div>
        ) : fareConfigs.length === 0 ? (
          <div className={`${cardBg} rounded-xl p-12 text-center border ${borderColor}`}>
            <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>No Fare Configurations</h3>
            <p className={textSecondary}>Click "Initialize Defaults" to create default fare configurations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {fareConfigs.map((config) => {
              const VehicleIcon = VEHICLE_ICONS[config.vehicleType] || Car;
              const vehicleColor = VEHICLE_COLORS[config.vehicleType] || '#6366f1';
              
              return (
                <motion.div
                  key={config._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${cardBg} rounded-xl p-6 border ${borderColor} ${!config.isActive ? 'opacity-60' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${vehicleColor}20` }}
                      >
                        <VehicleIcon size={24} style={{ color: vehicleColor }} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${textPrimary}`}>{config.vehicleType}</h3>
                        <span className={`text-xs ${config.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleStatus(config._id)}
                      className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      {config.isActive ? (
                        <ToggleRight size={28} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Fare Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className={textSecondary}>Base Fare</span>
                      <span className={`font-semibold ${textPrimary}`}>₱{config.baseFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>Per KM Rate</span>
                      <span className={`font-semibold ${textPrimary}`}>₱{config.perKmRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>Minimum Fare</span>
                      <span className={`font-semibold ${textPrimary}`}>₱{config.minimumFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>Base Distance</span>
                      <span className={`font-semibold ${textPrimary}`}>{config.baseDistanceKm} km</span>
                    </div>
                  </div>
                  
                  {/* Surcharges */}
                  {config.additionalCharges && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} mb-4`}>
                      <h4 className={`text-sm font-medium ${textPrimary} mb-2`}>Surcharges</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1 ${textSecondary}`}>
                            <Moon size={14} /> Night ({config.additionalCharges.nightStartHour}:00-{config.additionalCharges.nightEndHour}:00)
                          </span>
                          <span className={textPrimary}>{config.additionalCharges.nightSurchargePercent}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1 ${textSecondary}`}>
                            <Clock size={14} /> Peak ({config.additionalCharges.peakStartHour}:00-{config.additionalCharges.peakEndHour}:00)
                          </span>
                          <span className={textPrimary}>{config.additionalCharges.peakHourSurchargePercent}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1 ${textSecondary}`}>
                            <Users size={14} /> Per Extra Passenger
                          </span>
                          <span className={textPrimary}>₱{config.additionalCharges.perPassengerCharge}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(config)}
                      className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfig(config._id, config.vehicleType)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {/* Last Updated */}
                  {config.updatedAt && (
                    <p className={`text-xs ${textSecondary} mt-3`}>
                      Last updated: {new Date(config.updatedAt).toLocaleString()}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {editingConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${cardBg} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>
                {editingConfig._id ? 'Edit' : 'Add'} Fare Configuration
              </h2>
              
              <div className="space-y-4">
                {/* Vehicle Type */}
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Vehicle Type</label>
                  <select
                    value={editingConfig.vehicleType}
                    onChange={(e) => setEditingConfig({ ...editingConfig, vehicleType: e.target.value })}
                    disabled={!!editingConfig._id}
                    className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor} disabled:opacity-50`}
                  >
                    <option value="Tricycle">Tricycle</option>
                    <option value="Single Motorcycle">Single Motorcycle</option>
                    <option value="Cab">Cab</option>
                  </select>
                </div>
                
                {/* Basic Fare Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Base Fare (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editingConfig.baseFare}
                      onChange={(e) => setEditingConfig({ ...editingConfig, baseFare: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Per KM Rate (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={editingConfig.perKmRate}
                      onChange={(e) => setEditingConfig({ ...editingConfig, perKmRate: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Minimum Fare (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editingConfig.minimumFare}
                      onChange={(e) => setEditingConfig({ ...editingConfig, minimumFare: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Base Distance (km)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editingConfig.baseDistanceKm}
                      onChange={(e) => setEditingConfig({ ...editingConfig, baseDistanceKm: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                    />
                  </div>
                </div>
                
                {/* Night Surcharge */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Moon size={16} /> Night Surcharge
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>Surcharge (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingConfig.additionalCharges?.nightSurchargePercent || 0}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          additionalCharges: {
                            ...editingConfig.additionalCharges,
                            nightSurchargePercent: parseFloat(e.target.value) || 0,
                          },
                        })}
                        className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>Start Hour (0-23)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={editingConfig.additionalCharges?.nightStartHour || 22}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          additionalCharges: {
                            ...editingConfig.additionalCharges,
                            nightStartHour: parseInt(e.target.value) || 0,
                          },
                        })}
                        className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>End Hour (0-23)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={editingConfig.additionalCharges?.nightEndHour || 5}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          additionalCharges: {
                            ...editingConfig.additionalCharges,
                            nightEndHour: parseInt(e.target.value) || 0,
                          },
                        })}
                        className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Peak Hour Surcharge */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Clock size={16} /> Peak Hour Surcharge
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>Surcharge (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingConfig.additionalCharges?.peakHourSurchargePercent || 0}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          additionalCharges: {
                            ...editingConfig.additionalCharges,
                            peakHourSurchargePercent: parseFloat(e.target.value) || 0,
                          },
                        })}
                        className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>Start Hour (0-23)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={editingConfig.additionalCharges?.peakStartHour || 7}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          additionalCharges: {
                            ...editingConfig.additionalCharges,
                            peakStartHour: parseInt(e.target.value) || 0,
                          },
                        })}
                        className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>End Hour (0-23)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={editingConfig.additionalCharges?.peakEndHour || 9}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          additionalCharges: {
                            ...editingConfig.additionalCharges,
                            peakEndHour: parseInt(e.target.value) || 0,
                          },
                        })}
                        className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Per Passenger Charge */}
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1 flex items-center gap-2`}>
                    <Users size={16} /> Per Additional Passenger Charge (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editingConfig.additionalCharges?.perPassengerCharge || 0}
                    onChange={(e) => setEditingConfig({
                      ...editingConfig,
                      additionalCharges: {
                        ...editingConfig.additionalCharges,
                        perPassengerCharge: parseFloat(e.target.value) || 0,
                      },
                    })}
                    className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Description (Optional)</label>
                  <textarea
                    value={editingConfig.description || ''}
                    onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg ${inputBg} ${textPrimary} border ${borderColor}`}
                    placeholder="Add notes about this fare configuration..."
                  />
                </div>
                
                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingConfig.isActive}
                    onChange={(e) => setEditingConfig({ ...editingConfig, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isActive" className={textPrimary}>Active (visible to mobile app)</label>
                </div>
              </div>
              
              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingConfig(null)}
                  className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} rounded-lg transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveConfig(editingConfig)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FareManagementPage;
