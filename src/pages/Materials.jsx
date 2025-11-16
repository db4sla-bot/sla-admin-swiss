import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Materials = () => {
  const { canEdit } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' or 'id'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const [materialForm, setMaterialForm] = useState({
    id: '',
    materialName: '',
    unit: 'Piece',
    pricePerUnit: '',
    bufferStock: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const unitOptions = ['mm', 'cm', 'Meter', 'Piece', 'Kg', 'Feet', 'Box', 'Roll'];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const materialsCollection = collection(db, 'materials');
      const materialsSnapshot = await getDocs(materialsCollection);
      const materialsList = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterials(materialsList);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!canEdit('Materials')) {
      toast.error("You don't have access to add materials");
      return;
    }

    if (!materialForm.materialName || !materialForm.pricePerUnit || !materialForm.bufferStock) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const newMaterial = {
        materialName: materialForm.materialName,
        unit: materialForm.unit,
        pricePerUnit: parseFloat(materialForm.pricePerUnit),
        bufferStock: parseInt(materialForm.bufferStock),
        createdDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'materials'), newMaterial);
      
      setMaterials(prev => [{ id: docRef.id, ...newMaterial }, ...prev]);
      resetForm();
      setIsModalOpen(false);
      toast.success('Material added successfully!');
    } catch (error) {
      console.error('Error adding material:', error);
      toast.error('Failed to add material');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditMaterial = (material) => {
    setIsEditing(true);
    setEditingId(material.id);
    setMaterialForm({
      id: material.id,
      materialName: material.materialName,
      unit: material.unit,
      pricePerUnit: material.pricePerUnit.toString(),
      bufferStock: material.bufferStock.toString()
    });
    setIsModalOpen(true);
  };

  const handleUpdateMaterial = async () => {
    if (!canEdit('Materials')) {
      toast.error("You don't have access to edit materials");
      return;
    }

    if (!materialForm.materialName || !materialForm.pricePerUnit || !materialForm.bufferStock) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const materialRef = doc(db, 'materials', editingId);
      const updatedData = {
        materialName: materialForm.materialName,
        unit: materialForm.unit,
        pricePerUnit: parseFloat(materialForm.pricePerUnit),
        bufferStock: parseInt(materialForm.bufferStock),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(materialRef, updatedData);

      setMaterials(prev => prev.map(material =>
        material.id === editingId
          ? { ...material, ...updatedData }
          : material
      ));

      resetForm();
      setIsModalOpen(false);
      toast.success('Material updated successfully!');
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error('Failed to update material');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMaterial = async (materialId, materialName) => {
    if (!canEdit('Materials')) {
      toast.error("You don't have access to delete materials");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${materialName}"?`)) {
      return;
    }

    setDeletingId(materialId);
    try {
      await deleteDoc(doc(db, 'materials', materialId));
      setMaterials(prev => prev.filter(material => material.id !== materialId));
      toast.success('Material deleted successfully!');
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setMaterialForm({
      id: '',
      materialName: '',
      unit: 'Piece',
      pricePerUnit: '',
      bufferStock: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  // Filter materials based on search
  const filteredMaterials = materials.filter(material => {
    if (!searchQuery) return true;
    
    if (searchType === 'name') {
      return material.materialName.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return material.id.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  // Sort by latest first
  const sortedMaterials = filteredMaterials.sort((a, b) => {
    return new Date(b.createdAt || b.createdDate) - new Date(a.createdAt || a.createdDate);
  });

  // Pagination
  const totalPages = Math.ceil(sortedMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMaterials = sortedMaterials.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading materials...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materials Management</h1>
          <p className="text-gray-600 mt-1">Manage your inventory and material pricing</p>
        </div>
        {canEdit('Materials') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer"
          >
            <Plus size={20} />
            Add Material
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search by ${searchType === 'name' ? 'material name' : 'material ID'}...`}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D]"
            />
          </div>

          <div>
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchQuery('');
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#0A647D]"
            >
              <option value="name">Search by Material Name</option>
              <option value="id">Search by Material ID</option>
            </select>
          </div>
        </div>

        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden">
        {paginatedMaterials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No materials found matching your search' : 'No materials added yet'}
            </p>
            {!searchQuery && canEdit('Materials') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-6 py-2 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all cursor-pointer"
              >
                Add Your First Material
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Material ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Material Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price per Unit (₹)</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Buffer Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created Date</th>
                    {canEdit('Materials') && (
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{material.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{material.materialName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{material.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{material.pricePerUnit.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          material.bufferStock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {material.bufferStock} {material.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.createdDate}</td>
                      {canEdit('Materials') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditMaterial(material)}
                              disabled={deletingId === material.id}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit Material"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(material.id, material.materialName)}
                              disabled={deletingId === material.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              title="Delete Material"
                            >
                              {deletingId === material.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t-2 border-gray-200 px-6 py-4 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedMaterials.length)} of {sortedMaterials.length} materials
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                          currentPage === page
                            ? 'bg-[#0A647D] text-white'
                            : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#E8F4F8] to-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Material' : 'Add New Material'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Material Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={materialForm.materialName}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, materialName: e.target.value }))}
                    placeholder="Enter material name"
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer"
                  >
                    {unitOptions.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Price per {materialForm.unit} (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialForm.pricePerUnit}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                    placeholder="Enter price"
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Buffer Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={materialForm.bufferStock}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, bufferStock: e.target.value }))}
                    placeholder="Enter buffer stock quantity"
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum stock quantity to maintain in inventory</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 mt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateMaterial}
                      disabled={isSaving}
                      className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving && <Loader2 size={18} className="animate-spin" />}
                      {isSaving ? 'Updating...' : 'Update Material'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleAddMaterial}
                      disabled={isSaving}
                      className="flex-1 px-6 py-2.5 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving && <Loader2 size={18} className="animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save Material'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
