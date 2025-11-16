import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, Package, DollarSign, Receipt, TrendingUp, Activity, Plus, Edit2, Save, X, Search, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isAddingInstallment, setIsAddingInstallment] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [deletingWorkId, setDeletingWorkId] = useState(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [deletingInstallmentId, setDeletingInstallmentId] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  
  // Profile edit state
  const [profileData, setProfileData] = useState({
    customerName: '',
    mobileNumber: '',
    address: '',
    services: []
  });

  // Work state
  const [workForm, setWorkForm] = useState({
    workName: '',
    category: []
  });
  const [works, setWorks] = useState([]);
  const [editingWorkId, setEditingWorkId] = useState(null);

  // Material state
  const [materialForm, setMaterialForm] = useState({
    workId: '',
    materialName: '',
    quantity: '',
    unit: '',
    rate: '',
    totalAmount: ''
  });
  const [materials, setMaterials] = useState([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  // Payment state
  const [paymentRecordForm, setPaymentRecordForm] = useState({
    workId: '',
    totalAmount: ''
  });
  const [installmentForm, setInstallmentForm] = useState({
    recordId: '',
    installmentName: '',
    amount: '',
    paymentDate: '',
    paymentMethod: 'Cash'
  });
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [showInstallmentForm, setShowInstallmentForm] = useState(null);
  const [editingPaymentRecordId, setEditingPaymentRecordId] = useState(null);
  const [editingInstallmentId, setEditingInstallmentId] = useState(null);

  // Expense state
  const [expenseForm, setExpenseForm] = useState({
    workId: '',
    expenseName: '',
    amount: '',
    expenseDate: '',
    category: 'Labor'
  });
  const [expenses, setExpenses] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // Activity state
  const [activities, setActivities] = useState([]);
  const [customActivity, setCustomActivity] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 24;

  const serviceOptions = ['Invisible Grills', 'Mosquito Mesh', 'Cloth Hangers'];

  useEffect(() => {
    fetchAvailableMaterials();
  }, []);

  const fetchAvailableMaterials = async () => {
    try {
      const materialsCollection = collection(db, 'materials');
      const materialsSnapshot = await getDocs(materialsCollection);
      const materialsList = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableMaterials(materialsList);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMaterialDropdown && !event.target.closest('.material-dropdown-container')) {
        setShowMaterialDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMaterialDropdown]);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
      const customerDoc = await getDoc(doc(db, 'customers', id));
      if (customerDoc.exists()) {
        const data = { id: customerDoc.id, ...customerDoc.data() };
        setCustomer(data);
        setProfileData({
          customerName: data.customerName || '',
          mobileNumber: data.mobileNumber || '',
          address: data.address || '',
          services: data.services || []
        });
        setWorks(data.works || []);
        setMaterials(data.materials || []);
        setPaymentRecords(data.paymentRecords || []);
        setExpenses(data.expenses || []);
        setActivities(data.activities || []);
      } else {
        toast.error('Customer not found');
        navigate('/customers');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = async (actionType, actionDetails = '') => {
    const now = new Date();
    const activity = {
      id: Date.now().toString(),
      action: actionType,
      details: actionDetails,
      userName: user?.displayName || user?.email || 'Unknown User',
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    
    try {
      await updateDoc(doc(db, 'customers', id), {
        activities: arrayUnion(activity)
      });
      setActivities(prev => [activity, ...prev]);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to edit");
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'customers', id), {
        customerName: profileData.customerName,
        mobileNumber: profileData.mobileNumber,
        address: profileData.address,
        services: profileData.services
      });
      
      setCustomer(prev => ({ ...prev, ...profileData }));
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
      await addActivity('Profile Updated', `Updated customer profile information`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceToggle = (service) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleAddWork = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to add work");
      return;
    }

    if (!workForm.workName || workForm.category.length === 0) {
      toast.error('Please fill all work details');
      return;
    }

    const newWork = {
      id: Date.now().toString(),
      workName: workForm.workName,
      category: workForm.category,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    setIsAddingWork(true);
    try {
      await updateDoc(doc(db, 'customers', id), {
        works: arrayUnion(newWork)
      });
      
      setWorks(prev => [...prev, newWork]);
      setWorkForm({ workName: '', category: [] });
      toast.success('Work added successfully!');
      await addActivity('Work Added', `Added work: ${newWork.workName}`);
    } catch (error) {
      console.error('Error adding work:', error);
      toast.error('Failed to add work');
    } finally {
      setIsAddingWork(false);
    }
  };

  const handleEditWork = (work) => {
    setEditingWorkId(work.id);
    setWorkForm({
      workName: work.workName,
      category: work.category
    });
  };

  const handleUpdateWork = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to edit work");
      return;
    }

    if (!workForm.workName || workForm.category.length === 0) {
      toast.error('Please fill all work details');
      return;
    }

    setIsAddingWork(true);
    try {
      const updatedWorks = works.map(work =>
        work.id === editingWorkId
          ? { ...work, workName: workForm.workName, category: workForm.category }
          : work
      );

      await updateDoc(doc(db, 'customers', id), {
        works: updatedWorks
      });

      setWorks(updatedWorks);
      setWorkForm({ workName: '', category: [] });
      setEditingWorkId(null);
      toast.success('Work updated successfully!');
      await addActivity('Work Updated', `Updated work: ${workForm.workName}`);
    } catch (error) {
      console.error('Error updating work:', error);
      toast.error('Failed to update work');
    } finally {
      setIsAddingWork(false);
    }
  };

  const handleDeleteWork = async (workId, workName) => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to delete work");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the work "${workName}"?`)) {
      return;
    }

    setDeletingWorkId(workId);
    try {
      const updatedWorks = works.filter(work => work.id !== workId);

      await updateDoc(doc(db, 'customers', id), {
        works: updatedWorks
      });

      setWorks(updatedWorks);
      toast.success('Work deleted successfully!');
      await addActivity('Work Deleted', `Deleted work: ${workName}`);
    } catch (error) {
      console.error('Error deleting work:', error);
      toast.error('Failed to delete work');
    } finally {
      setDeletingWorkId(null);
    }
  };

  const handleCancelWorkEdit = () => {
    setEditingWorkId(null);
    setWorkForm({ workName: '', category: [] });
  };

  const handleWorkCategoryToggle = (service) => {
    setWorkForm(prev => ({
      ...prev,
      category: prev.category.includes(service)
        ? prev.category.filter(s => s !== service)
        : [...prev.category, service]
    }));
  };

  const handleAddMaterial = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to add materials");
      return;
    }

    if (!materialForm.workId || !materialForm.materialName || !materialForm.quantity || !materialForm.rate) {
      toast.error('Please fill all material details');
      return;
    }

    const totalAmount = parseFloat(materialForm.quantity) * parseFloat(materialForm.rate);
    const work = works.find(w => w.id === materialForm.workId);

    const newMaterial = {
      id: Date.now().toString(),
      workId: materialForm.workId,
      workName: work?.workName || '',
      materialName: materialForm.materialName,
      quantity: materialForm.quantity,
      unit: materialForm.unit,
      rate: materialForm.rate,
      totalAmount: totalAmount.toFixed(2),
      addedDate: new Date().toISOString().split('T')[0]
    };

    setIsAddingMaterial(true);
    try {
      await updateDoc(doc(db, 'customers', id), {
        materials: arrayUnion(newMaterial)
      });
      
      setMaterials(prev => [...prev, newMaterial]);
      setMaterialForm({ workId: '', materialName: '', quantity: '', unit: '', rate: '', totalAmount: '' });
      toast.success('Material added successfully!');
      await addActivity('Material Added', `Added ${newMaterial.materialName} for ${work?.workName}`);
    } catch (error) {
      console.error('Error adding material:', error);
      toast.error('Failed to add material');
    } finally {
      setIsAddingMaterial(false);
    }
  };

  const handleEditMaterial = (material) => {
    setEditingMaterialId(material.id);
    setMaterialForm({
      workId: material.workId,
      materialName: material.materialName,
      quantity: material.quantity,
      unit: material.unit,
      rate: material.rate,
      totalAmount: material.totalAmount
    });
  };

  const handleUpdateMaterial = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to edit materials");
      return;
    }

    if (!materialForm.workId || !materialForm.materialName || !materialForm.quantity || !materialForm.rate) {
      toast.error('Please fill all material details');
      return;
    }

    setIsAddingMaterial(true);
    try {
      const totalAmount = parseFloat(materialForm.quantity) * parseFloat(materialForm.rate);
      const work = works.find(w => w.id === materialForm.workId);

      const updatedMaterials = materials.map(material =>
        material.id === editingMaterialId
          ? {
              ...material,
              workId: materialForm.workId,
              workName: work?.workName || '',
              materialName: materialForm.materialName,
              quantity: materialForm.quantity,
              unit: materialForm.unit,
              rate: materialForm.rate,
              totalAmount: totalAmount.toFixed(2)
            }
          : material
      );

      await updateDoc(doc(db, 'customers', id), {
        materials: updatedMaterials
      });

      setMaterials(updatedMaterials);
      setMaterialForm({ workId: '', materialName: '', quantity: '', unit: '', rate: '', totalAmount: '' });
      setEditingMaterialId(null);
      toast.success('Material updated successfully!');
      await addActivity('Material Updated', `Updated ${materialForm.materialName}`);
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error('Failed to update material');
    } finally {
      setIsAddingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId, materialName) => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to delete materials");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${materialName}"?`)) {
      return;
    }

    setDeletingMaterialId(materialId);
    try {
      const updatedMaterials = materials.filter(material => material.id !== materialId);

      await updateDoc(doc(db, 'customers', id), {
        materials: updatedMaterials
      });

      setMaterials(updatedMaterials);
      toast.success('Material deleted successfully!');
      await addActivity('Material Deleted', `Deleted ${materialName}`);
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    } finally {
      setDeletingMaterialId(null);
    }
  };

  const handleCancelMaterialEdit = () => {
    setEditingMaterialId(null);
    setMaterialForm({ workId: '', materialName: '', quantity: '', unit: '', rate: '', totalAmount: '' });
  };

  const handleAddPaymentRecord = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to add payment records");
      return;
    }

    if (!paymentRecordForm.workId || !paymentRecordForm.totalAmount) {
      toast.error('Please select work and enter amount');
      return;
    }

    const work = works.find(w => w.id === paymentRecordForm.workId);

    const newRecord = {
      id: Date.now().toString(),
      workId: paymentRecordForm.workId,
      workName: work?.workName || '',
      totalAmount: paymentRecordForm.totalAmount,
      installments: [],
      createdDate: new Date().toISOString().split('T')[0]
    };

    try {
      setIsAddingPayment(true);
      await updateDoc(doc(db, 'customers', id), {
        paymentRecords: arrayUnion(newRecord)
      });
      
      setPaymentRecords(prev => [...prev, newRecord]);
      setPaymentRecordForm({ workId: '', totalAmount: '' });
      toast.success('Payment record created successfully!');
      await addActivity('Payment Record Created', `Created payment record for ${work?.workName} - ₹${paymentRecordForm.totalAmount}`);
    } catch (error) {
      console.error('Error adding payment record:', error);
      toast.error('Failed to create payment record');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleEditPaymentRecord = (record) => {
    setEditingPaymentRecordId(record.id);
    setPaymentRecordForm({
      workId: record.workId,
      totalAmount: record.totalAmount
    });
  };

  const handleUpdatePaymentRecord = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to edit payment records");
      return;
    }

    if (!paymentRecordForm.workId || !paymentRecordForm.totalAmount) {
      toast.error('Please select work and enter amount');
      return;
    }

    try {
      setIsAddingPayment(true);
      const work = works.find(w => w.id === paymentRecordForm.workId);

      const updatedRecords = paymentRecords.map(record =>
        record.id === editingPaymentRecordId
          ? {
              ...record,
              workId: paymentRecordForm.workId,
              workName: work?.workName || '',
              totalAmount: paymentRecordForm.totalAmount
            }
          : record
      );

      await updateDoc(doc(db, 'customers', id), {
        paymentRecords: updatedRecords
      });

      setPaymentRecords(updatedRecords);
      setPaymentRecordForm({ workId: '', totalAmount: '' });
      setEditingPaymentRecordId(null);
      toast.success('Payment record updated successfully!');
      await addActivity('Payment Record Updated', `Updated payment record for ${work?.workName}`);
    } catch (error) {
      console.error('Error updating payment record:', error);
      toast.error('Failed to update payment record');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleDeletePaymentRecord = async (recordId, workName) => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to delete payment records");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the payment record for "${workName}"?`)) {
      return;
    }

    try {
      setDeletingPaymentId(recordId);
      const updatedRecords = paymentRecords.filter(record => record.id !== recordId);

      await updateDoc(doc(db, 'customers', id), {
        paymentRecords: updatedRecords
      });

      setPaymentRecords(updatedRecords);
      toast.success('Payment record deleted successfully!');
      await addActivity('Payment Record Deleted', `Deleted payment record for ${workName}`);
    } catch (error) {
      console.error('Error deleting payment record:', error);
      toast.error('Failed to delete payment record');
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const handleCancelPaymentRecordEdit = () => {
    setEditingPaymentRecordId(null);
    setPaymentRecordForm({ workId: '', totalAmount: '' });
  };

  const handleAddInstallment = async (recordId) => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to add installments");
      return;
    }

    if (!installmentForm.installmentName || !installmentForm.amount) {
      toast.error('Please fill installment details');
      return;
    }

    const record = paymentRecords.find(r => r.id === recordId);
    if (!record) return;

    const newInstallment = {
      id: Date.now().toString(),
      installmentName: installmentForm.installmentName,
      amount: installmentForm.amount,
      paymentDate: installmentForm.paymentDate,
      paymentMethod: installmentForm.paymentMethod,
      addedDate: new Date().toISOString().split('T')[0]
    };

    const updatedRecord = {
      ...record,
      installments: [...(record.installments || []), newInstallment]
    };

    try {
      setIsAddingInstallment(true);
      // Remove old record and add updated one
      const otherRecords = paymentRecords.filter(r => r.id !== recordId);
      await updateDoc(doc(db, 'customers', id), {
        paymentRecords: [...otherRecords, updatedRecord]
      });
      
      setPaymentRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
      setInstallmentForm({ recordId: '', installmentName: '', amount: '', paymentDate: '', paymentMethod: 'Cash' });
      setShowInstallmentForm(null);
      toast.success('Installment added successfully!');
      await addActivity('Installment Added', `Added ${newInstallment.installmentName} - ₹${newInstallment.amount} for ${record.workName}`);
    } catch (error) {
      console.error('Error adding installment:', error);
      toast.error('Failed to add installment');
    } finally {
      setIsAddingInstallment(false);
    }
  };

  const handleEditInstallment = (recordId, installment) => {
    setEditingInstallmentId(installment.id);
    setShowInstallmentForm(recordId);
    setInstallmentForm({
      recordId: recordId,
      installmentName: installment.installmentName,
      amount: installment.amount,
      paymentDate: installment.paymentDate || '',
      paymentMethod: installment.paymentMethod || 'Cash'
    });
  };

  const handleUpdateInstallment = async (recordId) => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to edit installments");
      return;
    }

    if (!installmentForm.installmentName || !installmentForm.amount) {
      toast.error('Please fill installment details');
      return;
    }

    const record = paymentRecords.find(r => r.id === recordId);
    if (!record) return;

    try {
      setIsAddingInstallment(true);
      const updatedInstallments = (record.installments || []).map(inst =>
        inst.id === editingInstallmentId
          ? {
              ...inst,
              installmentName: installmentForm.installmentName,
              amount: installmentForm.amount,
              paymentDate: installmentForm.paymentDate,
              paymentMethod: installmentForm.paymentMethod
            }
          : inst
      );

      const updatedRecord = {
        ...record,
        installments: updatedInstallments
      };

      const otherRecords = paymentRecords.filter(r => r.id !== recordId);
      await updateDoc(doc(db, 'customers', id), {
        paymentRecords: [...otherRecords, updatedRecord]
      });

      setPaymentRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
      setInstallmentForm({ recordId: '', installmentName: '', amount: '', paymentDate: '', paymentMethod: 'Cash' });
      setShowInstallmentForm(null);
      setEditingInstallmentId(null);
      toast.success('Installment updated successfully!');
      await addActivity('Installment Updated', `Updated ${installmentForm.installmentName} for ${record.workName}`);
    } catch (error) {
      console.error('Error updating installment:', error);
      toast.error('Failed to update installment');
    } finally {
      setIsAddingInstallment(false);
    }
  };

  const handleDeleteInstallment = async (recordId, installmentId, installmentName, workName) => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to delete installments");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${installmentName}"?`)) {
      return;
    }

    const record = paymentRecords.find(r => r.id === recordId);
    if (!record) return;

    try {
      setDeletingInstallmentId(installmentId);
      const updatedInstallments = (record.installments || []).filter(inst => inst.id !== installmentId);
      const updatedRecord = {
        ...record,
        installments: updatedInstallments
      };

      const otherRecords = paymentRecords.filter(r => r.id !== recordId);
      await updateDoc(doc(db, 'customers', id), {
        paymentRecords: [...otherRecords, updatedRecord]
      });

      setPaymentRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
      toast.success('Installment deleted successfully!');
      await addActivity('Installment Deleted', `Deleted ${installmentName} from ${workName}`);
    } catch (error) {
      console.error('Error deleting installment:', error);
      toast.error('Failed to delete installment');
    } finally {
      setDeletingInstallmentId(null);
    }
  };

  const handleCancelInstallmentEdit = () => {
    setEditingInstallmentId(null);
    setInstallmentForm({ recordId: '', installmentName: '', amount: '', paymentDate: '', paymentMethod: 'Cash' });
    setShowInstallmentForm(null);
  };

  const handleAddExpense = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to add expenses");
      return;
    }

    if (!expenseForm.workId || !expenseForm.expenseName || !expenseForm.amount) {
      toast.error('Please fill all expense details');
      return;
    }

    const work = works.find(w => w.id === expenseForm.workId);

    const newExpense = {
      id: Date.now().toString(),
      workId: expenseForm.workId,
      workName: work?.workName || '',
      expenseName: expenseForm.expenseName,
      amount: expenseForm.amount,
      category: expenseForm.category,
      expenseDate: expenseForm.expenseDate,
      recordedDate: new Date().toISOString().split('T')[0]
    };

    try {
      setIsAddingExpense(true);
      await updateDoc(doc(db, 'customers', id), {
        expenses: arrayUnion(newExpense)
      });
      
      setExpenses(prev => [...prev, newExpense]);
      setExpenseForm({ workId: '', expenseName: '', amount: '', expenseDate: '', category: 'Labor' });
      toast.success('Expense added successfully!');
      await addActivity('Expense Added', `₹${expenseForm.amount} for ${work?.workName} - ${expenseForm.expenseName}`);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense.id);
    setExpenseForm({
      workId: expense.workId,
      expenseName: expense.expenseName,
      amount: expense.amount,
      expenseDate: expense.expenseDate || '',
      category: expense.category || 'Labor'
    });
  };

  const handleUpdateExpense = async () => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to edit expenses");
      return;
    }

    if (!expenseForm.workId || !expenseForm.expenseName || !expenseForm.amount) {
      toast.error('Please fill all expense details');
      return;
    }

    try {
      setIsAddingExpense(true);
      const work = works.find(w => w.id === expenseForm.workId);

      const updatedExpenses = expenses.map(expense =>
        expense.id === editingExpenseId
          ? {
              ...expense,
              workId: expenseForm.workId,
              workName: work?.workName || '',
              expenseName: expenseForm.expenseName,
              amount: expenseForm.amount,
              category: expenseForm.category,
              expenseDate: expenseForm.expenseDate
            }
          : expense
      );

      await updateDoc(doc(db, 'customers', id), {
        expenses: updatedExpenses
      });

      setExpenses(updatedExpenses);
      setExpenseForm({ workId: '', expenseName: '', amount: '', expenseDate: '', category: 'Labor' });
      setEditingExpenseId(null);
      toast.success('Expense updated successfully!');
      await addActivity('Expense Updated', `Updated ${expenseForm.expenseName} for ${work?.workName}`);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId, expenseName, workName) => {
    if (!canEdit('Customers')) {
      toast.error("You don't have access to delete expenses");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${expenseName}"?`)) {
      return;
    }

    try {
      setDeletingExpenseId(expenseId);
      const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);

      await updateDoc(doc(db, 'customers', id), {
        expenses: updatedExpenses
      });

      setExpenses(updatedExpenses);
      toast.success('Expense deleted successfully!');
      await addActivity('Expense Deleted', `Deleted ${expenseName} from ${workName}`);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleCancelExpenseEdit = () => {
    setEditingExpenseId(null);
    setExpenseForm({ workId: '', expenseName: '', amount: '', expenseDate: '', category: 'Labor' });
  };

  const handleAddCustomActivity = async () => {
    if (!customActivity.trim()) {
      toast.error('Please enter activity description');
      return;
    }

    try {
      setIsAddingActivity(true);
      await addActivity('Custom Activity', customActivity);
      setCustomActivity('');
      toast.success('Activity added!');
    } catch (error) {
      console.error('Error adding custom activity:', error);
      toast.error('Failed to add activity');
    } finally {
      setIsAddingActivity(false);
    }
  };

  const calculateWorkAnalytics = (workId) => {
    const workPaymentRecords = paymentRecords.filter(p => p.workId === workId);
    const workMaterials = materials.filter(m => m.workId === workId);
    const workExpenses = expenses.filter(e => e.workId === workId);

    const totalRevenue = workPaymentRecords.reduce((sum, record) => sum + parseFloat(record.totalAmount || 0), 0);
    
    // Calculate total paid from all installments
    const totalPaid = workPaymentRecords.reduce((sum, record) => {
      const recordPaid = (record.installments || []).reduce((instSum, inst) => instSum + parseFloat(inst.amount || 0), 0);
      return sum + recordPaid;
    }, 0);
    
    const totalPending = totalRevenue - totalPaid;
    
    const materialCost = workMaterials.reduce((sum, m) => sum + parseFloat(m.totalAmount || 0), 0);
    const expenseCost = workExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalInvestment = materialCost + expenseCost;
    
    const profitLoss = totalPaid - totalInvestment;

    return {
      totalRevenue,
      totalPaid,
      totalPending,
      materialCost,
      expenseCost,
      totalInvestment,
      profitLoss,
      profitMargin: totalRevenue > 0 ? ((profitLoss / totalRevenue) * 100).toFixed(2) : 0
    };
  };

  const filteredMaterials = availableMaterials.filter(material =>
    material.materialName.toLowerCase().includes(materialSearchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'work', label: 'Work', icon: Briefcase },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'payment', label: 'Payment', icon: DollarSign },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A647D] mb-4"></div>
        <p className="text-gray-600">Loading customer details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0A647D] mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Customers</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer?.customerName}</h1>
            <p className="text-gray-600 mt-1">Customer ID: {id}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-2 border-gray-200 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'text-[#0A647D] border-b-4 border-[#0A647D] bg-[#D4EDF5]/30'
                    : 'text-gray-600 hover:text-[#0A647D] hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Customer Profile</h2>
              {canEdit('Customers') && (
                <button
                  onClick={() => isEditingProfile ? handleProfileUpdate() : setIsEditingProfile(true)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>Loading...</>
                  ) : isEditingProfile ? (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 size={18} />
                      Edit Profile
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Customer Name</label>
                <input
                  type="text"
                  value={profileData.customerName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, customerName: e.target.value }))}
                  disabled={!isEditingProfile}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Mobile Number</label>
                <input
                  type="text"
                  value={profileData.mobileNumber}
                  onChange={(e) => setProfileData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  disabled={!isEditingProfile}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 block mb-2">Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditingProfile}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 block mb-2">Services</label>
                <div className="flex gap-4">
                  {serviceOptions.map(service => (
                    <label key={service} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profileData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        disabled={!isEditingProfile}
                        className="w-5 h-5 text-[#0A647D] border-2 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Work Tab */}
        {activeTab === 'work' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Work Management</h2>
            
            {canEdit('Customers') && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{editingWorkId ? 'Edit Work' : 'Add New Work'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Work Name</label>
                    <input
                      type="text"
                      value={workForm.workName}
                      onChange={(e) => setWorkForm(prev => ({ ...prev, workName: e.target.value }))}
                      placeholder="Enter work name"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Category (Services)</label>
                    <div className="flex gap-4 flex-wrap">
                      {serviceOptions.map(service => (
                        <label key={service} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={workForm.category.includes(service)}
                            onChange={() => handleWorkCategoryToggle(service)}
                            className="w-5 h-5 text-[#0A647D] border-2 border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {editingWorkId ? (
                    <>
                      <button
                        onClick={handleUpdateWork}
                        disabled={isAddingWork}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingWork ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isAddingWork ? 'Updating...' : 'Update Work'}
                      </button>
                      <button
                        onClick={handleCancelWorkEdit}
                        disabled={isAddingWork}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddWork}
                      disabled={isAddingWork}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingWork ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                      {isAddingWork ? 'Adding...' : 'Add Work'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Works List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Works List</h3>
              {works.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No works added yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created Date</th>
                        {canEdit('Customers') && (
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {works.map((work) => (
                        <tr key={work.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{work.workName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{work.category.join(', ')}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                              {work.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{work.createdDate}</td>
                          {canEdit('Customers') && (
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditWork(work)}
                                  disabled={deletingWorkId === work.id}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteWork(work.id, work.workName)}
                                  disabled={deletingWorkId === work.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete"
                                >
                                  {deletingWorkId === work.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Materials Management</h2>
            
            {canEdit('Customers') && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{editingMaterialId ? 'Edit Material' : 'Add Material'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Select Work</label>
                    <select
                      value={materialForm.workId}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, workId: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm cursor-pointer"
                    >
                      <option value="">Select Work</option>
                      {works.map(work => (
                        <option key={work.id} value={work.id}>{work.workName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Material</label>
                    <div className="relative material-dropdown-container">
                      <input
                        type="text"
                        value={materialForm.materialName}
                        onChange={(e) => {
                          setMaterialForm(prev => ({ ...prev, materialName: e.target.value }));
                          setMaterialSearchQuery(e.target.value);
                          setShowMaterialDropdown(true);
                        }}
                        onFocus={() => setShowMaterialDropdown(true)}
                        placeholder="Search material"
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm"
                        disabled={editingMaterialId !== null}
                      />
                      {showMaterialDropdown && filteredMaterials.length > 0 && !editingMaterialId && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredMaterials.map(material => (
                            <div
                              key={material.id}
                              onClick={() => {
                                setMaterialForm(prev => ({ 
                                  ...prev, 
                                  materialName: material.materialName,
                                  unit: material.unit,
                                  rate: material.pricePerUnit.toString()
                                }));
                                setMaterialSearchQuery('');
                                setShowMaterialDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                            >
                              <div className="font-medium text-gray-900">{material.materialName}</div>
                              <div className="text-xs text-gray-500">{material.unit} • ₹{material.pricePerUnit.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Quantity</label>
                    <input
                      type="number"
                      value={materialForm.quantity}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="Enter quantity"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Unit</label>
                    <input
                      type="text"
                      value={materialForm.unit}
                      disabled
                      placeholder="Auto-populated"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Rate per Unit (₹)</label>
                    <input
                      type="text"
                      value={materialForm.rate}
                      disabled
                      placeholder="Auto-populated"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Total Amount (₹)</label>
                    <input
                      type="text"
                      value={materialForm.quantity && materialForm.rate ? (parseFloat(materialForm.quantity) * parseFloat(materialForm.rate)).toFixed(2) : ''}
                      disabled
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm bg-gray-100"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {editingMaterialId ? (
                    <>
                      <button
                        onClick={handleUpdateMaterial}
                        disabled={isAddingMaterial}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingMaterial ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isAddingMaterial ? 'Updating...' : 'Update Material'}
                      </button>
                      <button
                        onClick={handleCancelMaterialEdit}
                        disabled={isAddingMaterial}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddMaterial}
                      disabled={isAddingMaterial}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingMaterial ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                      {isAddingMaterial ? 'Adding...' : 'Add Material'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Materials List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Materials List</h3>
              {materials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No materials added yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Work</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Material</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Quantity</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Unit</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Rate</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                        {canEdit('Customers') && (
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {materials.map((material) => (
                        <tr key={material.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.workName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{material.materialName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{material.quantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{material.unit}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">₹{material.rate}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{material.totalAmount}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{material.addedDate}</td>
                          {canEdit('Customers') && (
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditMaterial(material)}
                                  disabled={deletingMaterialId === material.id}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMaterial(material.id, material.materialName)}
                                  disabled={deletingMaterialId === material.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete"
                                >
                                  {deletingMaterialId === material.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Management</h2>
            
            {canEdit('Customers') && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{editingPaymentRecordId ? 'Edit Payment Record' : 'Create Payment Record'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Select Work <span className="text-red-500">*</span></label>
                    <select
                      value={paymentRecordForm.workId}
                      onChange={(e) => setPaymentRecordForm(prev => ({ ...prev, workId: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm cursor-pointer"
                    >
                      <option value="">Select Work</option>
                      {works.map(work => (
                        <option key={work.id} value={work.id}>{work.workName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Total Amount (₹) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={paymentRecordForm.totalAmount}
                      onChange={(e) => setPaymentRecordForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                      placeholder="Enter total amount"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {editingPaymentRecordId ? (
                    <>
                      <button
                        onClick={handleUpdatePaymentRecord}
                        disabled={isAddingPayment}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingPayment ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isAddingPayment ? 'Updating...' : 'Update Record'}
                      </button>
                      <button
                        onClick={handleCancelPaymentRecordEdit}
                        disabled={isAddingPayment}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddPaymentRecord}
                      disabled={isAddingPayment}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingPayment ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                      {isAddingPayment ? 'Saving...' : 'Save Record'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Payment Records List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Records</h3>
              {paymentRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No payment records created yet</p>
              ) : (
                <div className="space-y-6">
                  {paymentRecords.map(record => {
                    const totalPaid = (record.installments || []).reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
                    const pending = parseFloat(record.totalAmount) - totalPaid;

                    return (
                      <div key={record.id} className="border-2 border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{record.workName}</h4>
                            <p className="text-sm text-gray-500">Created on {record.createdDate}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex gap-6 text-sm">
                              <div>
                                <span className="text-gray-600">Total: </span>
                                <span className="font-bold text-gray-900">₹{parseFloat(record.totalAmount).toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Paid: </span>
                                <span className="font-bold text-green-600">₹{totalPaid.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Pending: </span>
                                <span className="font-bold text-red-600">₹{pending.toFixed(2)}</span>
                              </div>
                            </div>
                            {canEdit('Customers') && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditPaymentRecord(record)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                  title="Edit Record"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeletePaymentRecord(record.id, record.workName)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Installments */}
                        <div className="mb-4">
                          {(!record.installments || record.installments.length === 0) ? (
                            <p className="text-gray-500 text-sm py-2">No installments added yet</p>
                          ) : (
                            <div className="overflow-x-auto mb-4">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Installment Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Payment Method</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Payment Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Added On</th>
                                    {canEdit('Customers') && (
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Actions</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {record.installments.map(installment => (
                                    <tr key={installment.id}>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{installment.installmentName}</td>
                                      <td className="px-4 py-3 text-sm font-semibold text-green-600">₹{parseFloat(installment.amount).toFixed(2)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{installment.paymentMethod}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{installment.paymentDate || '-'}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{installment.addedDate}</td>
                                      {canEdit('Customers') && (
                                        <td className="px-4 py-3">
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleEditInstallment(record.id, installment)}
                                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all cursor-pointer"
                                              title="Edit"
                                            >
                                              <Edit2 size={14} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteInstallment(record.id, installment.id, installment.installmentName, record.workName)}
                                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                                              title="Delete"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Add Installment Button and Form */}
                        {canEdit('Customers') && pending > 0 && (
                          <div>
                            {showInstallmentForm === record.id ? (
                              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-sm font-bold text-gray-800">{editingInstallmentId ? 'Edit Installment' : 'Add Installment'}</h5>
                                  <button
                                    onClick={handleCancelInstallmentEdit}
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                                  >
                                    <X size={20} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1">Installment Name <span className="text-red-500">*</span></label>
                                    <input
                                      type="text"
                                      value={installmentForm.installmentName}
                                      onChange={(e) => setInstallmentForm(prev => ({ ...prev, installmentName: e.target.value }))}
                                      placeholder="e.g., First Installment"
                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1">Amount (₹) <span className="text-red-500">*</span></label>
                                    <input
                                      type="number"
                                      value={installmentForm.amount}
                                      onChange={(e) => setInstallmentForm(prev => ({ ...prev, amount: e.target.value }))}
                                      placeholder="Enter amount"
                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1">Payment Date</label>
                                    <input
                                      type="date"
                                      value={installmentForm.paymentDate}
                                      onChange={(e) => setInstallmentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1">Payment Method</label>
                                    <select
                                      value={installmentForm.paymentMethod}
                                      onChange={(e) => setInstallmentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm cursor-pointer"
                                    >
                                      <option value="Cash">Cash</option>
                                      <option value="UPI">UPI</option>
                                      <option value="Bank Transfer">Bank Transfer</option>
                                      <option value="Cheque">Cheque</option>
                                      <option value="Card">Card</option>
                                    </select>
                                  </div>
                                </div>
                                <button
                                  onClick={() => editingInstallmentId ? handleUpdateInstallment(record.id) : handleAddInstallment(record.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all text-sm cursor-pointer"
                                >
                                  {editingInstallmentId ? <><Save size={16} /> Update Installment</> : <><Plus size={16} /> Save Installment</>}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowInstallmentForm(record.id);
                                  setInstallmentForm({ recordId: record.id, installmentName: '', amount: '', paymentDate: '', paymentMethod: 'Cash' });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm cursor-pointer"
                              >
                                <Plus size={16} />
                                Add Installment
                              </button>
                            )}
                          </div>
                        )}

                        {/* Completed Payment Message */}
                        {pending <= 0 && (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                            <p className="text-green-700 font-semibold text-sm">✓ Payment Completed</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Expenses Management</h2>
            
            {canEdit('Customers') && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Select Work</label>
                    <select
                      value={expenseForm.workId}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, workId: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm cursor-pointer"
                    >
                      <option value="">Select Work</option>
                      {works.map(work => (
                        <option key={work.id} value={work.id}>{work.workName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Expense Name</label>
                    <input
                      type="text"
                      value={expenseForm.expenseName}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, expenseName: e.target.value }))}
                      placeholder="Enter expense name"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Category</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm cursor-pointer"
                    >
                      <option value="Labor">Labor</option>
                      <option value="Transport">Transport</option>
                      <option value="Tools">Tools</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Expense Date</label>
                    <input
                      type="date"
                      value={expenseForm.expenseDate}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {editingExpenseId ? (
                    <>
                      <button
                        onClick={handleUpdateExpense}
                        disabled={isAddingExpense}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingExpense ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isAddingExpense ? 'Updating...' : 'Update Expense'}
                      </button>
                      <button
                        onClick={handleCancelExpenseEdit}
                        disabled={isAddingExpense}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddExpense}
                      disabled={isAddingExpense}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingExpense ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                      {isAddingExpense ? 'Adding...' : 'Add Expense'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Expenses List</h3>
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Work</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Expense</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                        {canEdit('Customers') && (
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.workName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{expense.expenseName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{expense.category}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{expense.amount}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{expense.expenseDate}</td>
                          {canEdit('Customers') && (
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditExpense(expense)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense.id, expense.expenseName, expense.workName)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
            
            {works.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No works available for analytics</p>
            ) : (
              <div className="space-y-6">
                {works.map(work => {
                  const analytics = calculateWorkAnalytics(work.id);
                  
                  return (
                    <div key={work.id} className="border-2 border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{work.workName}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                          <p className="text-sm text-blue-600 font-semibold mb-1">Total Revenue</p>
                          <p className="text-2xl font-bold text-blue-900">₹{analytics.totalRevenue.toFixed(2)}</p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                          <p className="text-sm text-green-600 font-semibold mb-1">Total Received</p>
                          <p className="text-2xl font-bold text-green-900">₹{analytics.totalPaid.toFixed(2)}</p>
                        </div>
                        
                        <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                          <p className="text-sm text-orange-600 font-semibold mb-1">Pending Payment</p>
                          <p className="text-2xl font-bold text-orange-900">₹{analytics.totalPending.toFixed(2)}</p>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                          <p className="text-sm text-purple-600 font-semibold mb-1">Total Investment</p>
                          <p className="text-2xl font-bold text-purple-900">₹{analytics.totalInvestment.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Material Cost</p>
                          <p className="text-xl font-bold text-gray-900">₹{analytics.materialCost.toFixed(2)}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Expense Cost</p>
                          <p className="text-xl font-bold text-gray-900">₹{analytics.expenseCost.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className={`rounded-lg p-6 border-2 ${analytics.profitLoss >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-semibold mb-1 ${analytics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {analytics.profitLoss >= 0 ? 'Profit' : 'Loss'}
                            </p>
                            <p className={`text-3xl font-bold ${analytics.profitLoss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                              ₹{Math.abs(analytics.profitLoss).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold mb-1 ${analytics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Profit Margin
                            </p>
                            <p className={`text-3xl font-bold ${analytics.profitLoss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                              {analytics.profitMargin}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Log</h2>
            
            {canEdit('Customers') && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add Custom Activity</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    placeholder="Enter activity description..."
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddCustomActivity}
                    disabled={isAddingActivity}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingActivity ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {isAddingActivity ? 'Adding...' : 'Add Activity'}
                  </button>
                </div>
              </div>
            )}

            <div>
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activities recorded yet</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {activities
                      .slice()
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .slice((activityPage - 1) * activitiesPerPage, activityPage * activitiesPerPage)
                      .map((activity) => (
                        <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-[#0A647D] flex items-center justify-center">
                              <Activity size={20} className="text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{activity.action}</p>
                                {activity.details && (
                                  <p className="text-sm text-gray-700 mt-1">{activity.details}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="font-medium">{activity.userName}</span>
                              <span>•</span>
                              <span>{activity.date}</span>
                              <span>•</span>
                              <span>{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Pagination */}
                  {activities.length > activitiesPerPage && (
                    <div className="flex items-center justify-between border-t-2 border-gray-200 pt-4">
                      <div className="text-sm text-gray-600">
                        Showing {((activityPage - 1) * activitiesPerPage) + 1} to {Math.min(activityPage * activitiesPerPage, activities.length)} of {activities.length} activities
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActivityPage(prev => Math.max(1, prev - 1))}
                          disabled={activityPage === 1}
                          className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.ceil(activities.length / activitiesPerPage) }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setActivityPage(page)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                                activityPage === page
                                  ? 'bg-[#0A647D] text-white'
                                  : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setActivityPage(prev => Math.min(Math.ceil(activities.length / activitiesPerPage), prev + 1))}
                          disabled={activityPage >= Math.ceil(activities.length / activitiesPerPage)}
                          className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
