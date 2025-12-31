import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Modal,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Phone,
  User,
  Shirt,
  Trash2,
  Image as ImageIcon,
  X,
  Download,
  FileText,
  Printer,
  ShoppingBag,
  Shield,
  Plus,
  Edit3,
  Hash,
  DollarSign,
  Link,
  LogOut,
  Mail,
  Lock,
  Settings,
  Building2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useOrders, Order } from '@/contexts/OrdersContext';
import { useAppContent, MerchItem, Hero } from '@/contexts/AppContentContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

type TabType = 'orders' | 'merch' | 'heroes' | 'settings';

const STATUS_CONFIG: Record<Order['status'], { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: '#F59E0B', icon: <Clock size={16} color="#F59E0B" /> },
  confirmed: { label: 'Confirmed', color: '#3B82F6', icon: <CheckCircle size={16} color="#3B82F6" /> },
  shipped: { label: 'Shipped', color: '#8B5CF6', icon: <Truck size={16} color="#8B5CF6" /> },
  delivered: { label: 'Delivered', color: '#10B981', icon: <CheckCircle size={16} color="#10B981" /> },
  cancelled: { label: 'Cancelled', color: '#EF4444', icon: <XCircle size={16} color="#EF4444" /> },
};

const STATUS_OPTIONS: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const POSITION_OPTIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Substitute'];

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, updateOrderStatus, deleteOrder, isLoading } = useOrders();
  const { 
    merchItems, 
    heroes, 
    bankInfo,
    addMerchItem, 
    updateMerchItem, 
    deleteMerchItem,
    addHero,
    updateHero,
    deleteHero,
    updateBankInfo,
  } = useAppContent();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [showMerchModal, setShowMerchModal] = useState(false);
  const [editingMerch, setEditingMerch] = useState<MerchItem | null>(null);
  const [merchName, setMerchName] = useState('');
  const [merchPrice, setMerchPrice] = useState('');
  const [merchImage, setMerchImage] = useState('');
  
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [heroName, setHeroName] = useState('');
  const [heroNumber, setHeroNumber] = useState('');
  const [heroPosition, setHeroPosition] = useState('');
  const [heroImage, setHeroImage] = useState('');

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Info', 'Please enter email and password');
      return;
    }

    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      if (data.session) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setEmail('');
            setPassword('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateOrderStatus(orderId, status);
    setShowStatusModal(false);
    setSelectedOrder(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteOrder(orderId);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;

  const openAddMerch = () => {
    setEditingMerch(null);
    setMerchName('');
    setMerchPrice('');
    setMerchImage('');
    setShowMerchModal(true);
  };

  const openEditMerch = (item: MerchItem) => {
    setEditingMerch(item);
    setMerchName(item.name);
    setMerchPrice(item.price);
    setMerchImage(item.image);
    setShowMerchModal(true);
  };

  const handleSaveMerch = () => {
    if (!merchName.trim() || !merchPrice.trim() || !merchImage.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (editingMerch) {
      updateMerchItem(editingMerch.id, {
        name: merchName.trim(),
        price: merchPrice.trim(),
        image: merchImage.trim(),
      });
    } else {
      addMerchItem({
        name: merchName.trim(),
        price: merchPrice.trim(),
        image: merchImage.trim(),
      });
    }
    
    setShowMerchModal(false);
  };

  const handleDeleteMerch = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this merchandise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteMerchItem(id);
          },
        },
      ]
    );
  };

  const openAddHero = () => {
    setEditingHero(null);
    setHeroName('');
    setHeroNumber('');
    setHeroPosition('');
    setHeroImage('');
    setShowHeroModal(true);
  };

  const openEditHero = (hero: Hero) => {
    setEditingHero(hero);
    setHeroName(hero.name);
    setHeroNumber(hero.number);
    setHeroPosition(hero.position);
    setHeroImage(hero.image);
    setShowHeroModal(true);
  };

  const handleSaveHero = () => {
    if (!heroName.trim() || !heroNumber.trim() || !heroPosition.trim() || !heroImage.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (editingHero) {
      updateHero(editingHero.id, {
        name: heroName.trim(),
        number: heroNumber.trim(),
        position: heroPosition.trim(),
        image: heroImage.trim(),
      });
    } else {
      addHero({
        name: heroName.trim(),
        number: heroNumber.trim(),
        position: heroPosition.trim(),
        image: heroImage.trim(),
      });
    }
    
    setShowHeroModal(false);
  };

  const handleDeleteHero = (id: string) => {
    Alert.alert(
      'Delete Hero',
      'Are you sure you want to delete this hero?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteHero(id);
          },
        },
      ]
    );
  };

  const openEditSettings = () => {
    setBankName(bankInfo.bankName);
    setAccountName(bankInfo.accountName);
    setAccountNumber(bankInfo.accountNumber);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateBankInfo({
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
    });
    setShowSettingsModal(false);
  };

  const generateOrdersHTML = () => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const ordersHTML = orders.map((order) => {
      const statusLabels: Record<Order['status'], string> = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      };
      const status = order.status as Order['status'];
      const itemsCount = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const itemsList = order.items.map((item: any) => {
        const sizeLabel = item.sizeCategory === 'kids' ? `Kids ${item.size}` : item.size;
        const sleeveLabel = item.sleeveType === 'long' ? 'Long' : 'Short';
        return `${item.jerseyName} (${sizeLabel}, ${sleeveLabel})`;
      }).join(', ');
      
      return `
        <tr>
          <td>${order.customerName}</td>
          <td>${order.customerPhone}</td>
          <td>${itemsCount} item(s)</td>
          <td>${itemsList}</td>
          <td>MVR ${order.totalPrice}</td>
          <td>${statusLabels[status]}</td>
          <td>${formatDate(order.createdAt)}</td>
        </tr>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Club Invaders - Orders Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #DC2626; }
    .header h1 { color: #DC2626; font-size: 28px; margin-bottom: 8px; }
    .header p { color: #666; font-size: 14px; }
    .stats { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat-card { flex: 1; background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card .number { font-size: 32px; font-weight: bold; color: #DC2626; }
    .stat-card .label { font-size: 12px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #DC2626; color: white; padding: 14px 12px; text-align: left; font-size: 13px; }
    td { padding: 14px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:hover { background: #f9f9f9; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
    @media print {
      body { padding: 0; background: white; }
      .container { box-shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CLUB INVADERS</h1>
      <p>Orders Report - Generated on ${date}</p>
    </div>
    <div class="stats">
      <div class="stat-card">
        <div class="number">${orders.length}</div>
        <div class="label">Total Orders</div>
      </div>
      <div class="stat-card">
        <div class="number">${pendingCount}</div>
        <div class="label">Pending</div>
      </div>
      <div class="stat-card">
        <div class="number">${confirmedCount}</div>
        <div class="label">Confirmed</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Phone</th>
          <th>Items</th>
          <th>Details</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${ordersHTML}
      </tbody>
    </table>
    <div class="footer">
      <p>Club Invaders &copy; ${new Date().getFullYear()} - N. Miladhoo, Maldives</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const downloadHTML = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const html = generateOrdersHTML();
    
    if (Platform.OS === 'web') {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `club-invaders-orders-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowExportModal(false);
      Alert.alert('Success', 'HTML file downloaded successfully!');
    } else {
      Alert.alert('Info', 'HTML download is only available on web. On mobile, use the Print/PDF option instead.');
    }
  };

  const printOrDownloadPDF = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const html = generateOrdersHTML();
    
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      setShowExportModal(false);
    } else {
      Alert.alert('Info', 'Print/PDF is best used from the web version. Please access the admin panel from a browser for PDF export.');
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <LinearGradient
          colors={[Colors.background, '#0a0a0a']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[Colors.background, '#0a0a0a']}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.loginContainer}>
          <View style={styles.loginHeader}>
            <View style={styles.lockIconContainer}>
              <Lock size={32} color={Colors.primary} />
            </View>
            <Text style={styles.loginTitle}>Admin Login</Text>
            <Text style={styles.loginSubtitle}>Sign in to access the admin panel</Text>
          </View>

          <View style={styles.loginForm}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Mail size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Email</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="admin@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoggingIn}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Lock size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Password</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoggingIn}
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButtonLogin}
              onPress={() => router.back()}
              disabled={isLoggingIn}
            >
              <ArrowLeft size={16} color={Colors.textMuted} />
              <Text style={styles.backButtonLoginText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const renderOrdersTab = () => (
    <>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#F59E0B' }]}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#3B82F6' }]}>
          <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{confirmedCount}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
              Orders from the merch store will appear here
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status as Order['status']];
            const itemsCount = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            const firstItem = order.items[0];
            
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderProduct}>
                    {firstItem && (
                      <Image
                        source={{ uri: firstItem.productImage }}
                        style={styles.productImage}
                      />
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{itemsCount} item(s)</Text>
                      <Text style={styles.productPrice}>MVR {order.totalPrice}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}
                    onPress={() => {
                      setSelectedOrder(order);
                      setShowStatusModal(true);
                    }}
                  >
                    {statusConfig.icon}
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <User size={14} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{order.customerName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={14} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{order.customerPhone}</Text>
                  </View>
                  {order.items.map((item: any, index: number) => (
                    <View key={index} style={styles.detailRow}>
                      <Shirt size={14} color={Colors.textMuted} />
                      <Text style={styles.detailText}>
                        {item.jerseyName} - {item.sizeCategory === 'kids' ? `Kids ${item.size}` : item.size}, {item.sleeveType === 'long' ? 'Long' : 'Short'} Sleeve
                      </Text>
                    </View>
                  ))}
                </View>

                {order.transferSlipUri && (
                  <TouchableOpacity
                    style={styles.transferSlipButton}
                    onPress={() => {
                      setSelectedImage(order.transferSlipUri);
                      setShowImageModal(true);
                    }}
                  >
                    <ImageIcon size={16} color={Colors.primary} />
                    <Text style={styles.transferSlipText}>View Transfer Slip</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.orderFooter}>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteOrder(order.id)}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );

  const renderMerchTab = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.addButton} onPress={openAddMerch}>
        <Plus size={20} color={Colors.textPrimary} />
        <Text style={styles.addButtonText}>Add New Merchandise</Text>
      </TouchableOpacity>

      {merchItems.length === 0 ? (
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Merchandise</Text>
          <Text style={styles.emptyText}>Add your first merchandise item</Text>
        </View>
      ) : (
        merchItems.map((item: MerchItem) => (
          <View key={item.id} style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditMerch(item)}
              >
                <Edit3 size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMerch(item.id)}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderHeroesTab = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.addButton} onPress={openAddHero}>
        <Plus size={20} color={Colors.textPrimary} />
        <Text style={styles.addButtonText}>Add New Hero</Text>
      </TouchableOpacity>

      {heroes.length === 0 ? (
        <View style={styles.emptyState}>
          <Shield size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Heroes</Text>
          <Text style={styles.emptyText}>Add your first hero</Text>
        </View>
      ) : (
        heroes.map((hero: Hero) => (
          <View key={hero.id} style={styles.itemCard}>
            <Image source={{ uri: hero.image }} style={styles.heroImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{hero.name}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>#{hero.number}</Text>
                </View>
                <Text style={styles.heroPosition}>{hero.position}</Text>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditHero(hero)}
              >
                <Edit3 size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteHero(hero.id)}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <Building2 size={20} color={Colors.primary} />
          <Text style={styles.settingsSectionTitle}>Bank Transfer Information</Text>
        </View>
        <Text style={styles.settingsSectionDesc}>
          This information will be displayed to customers during checkout
        </Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Bank Name</Text>
            <Text style={styles.settingsValue}>{bankInfo.bankName}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Account Name</Text>
            <Text style={styles.settingsValue}>{bankInfo.accountName}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Account Number</Text>
            <Text style={styles.settingsValue}>{bankInfo.accountNumber}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editSettingsButton} onPress={openEditSettings}>
          <Edit3 size={18} color={Colors.textPrimary} />
          <Text style={styles.editSettingsButtonText}>Edit Bank Information</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Package size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.headerActions}>
          {activeTab === 'orders' && (
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => setShowExportModal(true)}
            >
              <Download size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('orders');
          }}
        >
          <Package size={18} color={activeTab === 'orders' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'merch' && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('merch');
          }}
        >
          <ShoppingBag size={18} color={activeTab === 'merch' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'merch' && styles.tabTextActive]}>
            Merch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'heroes' && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('heroes');
          }}
        >
          <Shield size={18} color={activeTab === 'heroes' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'heroes' && styles.tabTextActive]}>
            Heroes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('settings');
          }}
        >
          <Settings size={18} color={activeTab === 'settings' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'orders' && renderOrdersTab()}
      {activeTab === 'merch' && renderMerchTab()}
      {activeTab === 'heroes' && renderHeroesTab()}
      {activeTab === 'settings' && renderSettingsTab()}

      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.statusModalContent}>
            <Text style={styles.statusModalTitle}>Update Status</Text>
            {STATUS_OPTIONS.map((status) => {
              const config = STATUS_CONFIG[status];
              const isSelected = selectedOrder?.status === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    isSelected && styles.statusOptionSelected,
                  ]}
                  onPress={() => selectedOrder && handleStatusChange(selectedOrder.id, status)}
                >
                  {config.icon}
                  <Text style={[styles.statusOptionText, { color: config.color }]}>
                    {config.label}
                  </Text>
                  {isSelected && (
                    <CheckCircle size={18} color={Colors.primary} style={styles.statusCheck} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setShowImageModal(false)}
          >
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowExportModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.exportModalContent}>
            <Text style={styles.exportModalTitle}>Export Orders</Text>
            <Text style={styles.exportModalSubtitle}>
              Download your orders list in your preferred format
            </Text>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={downloadHTML}
            >
              <View style={styles.exportOptionIcon}>
                <FileText size={24} color={Colors.primary} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>Download HTML</Text>
                <Text style={styles.exportOptionDesc}>
                  Save as HTML file for viewing or archiving
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={printOrDownloadPDF}
            >
              <View style={styles.exportOptionIcon}>
                <Printer size={24} color={Colors.primary} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>Print / Save as PDF</Text>
                <Text style={styles.exportOptionDesc}>
                  Open print dialog to print or save as PDF
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportCancelButton}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.exportCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showMerchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMerchModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMerchModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.formModalContent}>
            <View style={styles.formModalHeader}>
              <Text style={styles.formModalTitle}>
                {editingMerch ? 'Edit Merchandise' : 'Add Merchandise'}
              </Text>
              <TouchableOpacity onPress={() => setShowMerchModal(false)}>
                <X size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Shirt size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. Invaders Jersey"
                placeholderTextColor={Colors.textMuted}
                value={merchName}
                onChangeText={setMerchName}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <DollarSign size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Price</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. MVR 450"
                placeholderTextColor={Colors.textMuted}
                value={merchPrice}
                onChangeText={setMerchPrice}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Link size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Image URL</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={Colors.textMuted}
                value={merchImage}
                onChangeText={setMerchImage}
                autoCapitalize="none"
              />
            </View>

            {merchImage ? (
              <Image source={{ uri: merchImage }} style={styles.previewImage} />
            ) : null}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMerch}>
              <Text style={styles.saveButtonText}>
                {editingMerch ? 'Save Changes' : 'Add Merchandise'}
              </Text>
            </TouchableOpacity>
          </View>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showHeroModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHeroModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowHeroModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.formModalContent}>
            <View style={styles.formModalHeader}>
              <Text style={styles.formModalTitle}>
                {editingHero ? 'Edit Hero' : 'Add Hero'}
              </Text>
              <TouchableOpacity onPress={() => setShowHeroModal(false)}>
                <X size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <User size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ahmed Rasheed"
                placeholderTextColor={Colors.textMuted}
                value={heroName}
                onChangeText={setHeroName}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Hash size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Jersey Number</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10"
                placeholderTextColor={Colors.textMuted}
                value={heroNumber}
                onChangeText={setHeroNumber}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Shield size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Position</Text>
              </View>
              <View style={styles.positionGrid}>
                {POSITION_OPTIONS.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={[
                      styles.positionOption,
                      heroPosition === pos && styles.positionOptionActive,
                    ]}
                    onPress={() => setHeroPosition(pos)}
                  >
                    <Text
                      style={[
                        styles.positionOptionText,
                        heroPosition === pos && styles.positionOptionTextActive,
                      ]}
                    >
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Link size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Image URL</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={Colors.textMuted}
                value={heroImage}
                onChangeText={setHeroImage}
                autoCapitalize="none"
              />
            </View>

            {heroImage ? (
              <Image source={{ uri: heroImage }} style={styles.previewImageRound} />
            ) : null}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveHero}>
              <Text style={styles.saveButtonText}>
                {editingHero ? 'Save Changes' : 'Add Hero'}
              </Text>
            </TouchableOpacity>
          </View>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.formModalContent}>
            <View style={styles.formModalHeader}>
              <Text style={styles.formModalTitle}>Edit Bank Information</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <X size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Building2 size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Bank Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bank of Maldives (BML)"
                placeholderTextColor={Colors.textMuted}
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <User size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Account Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. Club Invaders"
                placeholderTextColor={Colors.textMuted}
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Hash size={16} color={Colors.textMuted} />
                <Text style={styles.inputLabelText}>Account Number</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. 7730000123456"
                placeholderTextColor={Colors.textMuted}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textMuted,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  loginForm: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  backButtonLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  backButtonLoginText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.backgroundElevated,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.backgroundElevated,
  },
  heroImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundElevated,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginTop: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  heroBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  heroPosition: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderProduct: {
    flexDirection: 'row',
    flex: 1,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.backgroundElevated,
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  orderDetails: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  transferSlipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  transferSlipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusModalContent: {
    width: width - 48,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: Colors.backgroundElevated,
    gap: 12,
  },
  statusOptionSelected: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
  },
  statusCheck: {
    marginLeft: 'auto',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: width - 32,
    height: '70%',
  },
  exportModalContent: {
    width: width - 48,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exportModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  exportModalSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exportOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exportOptionInfo: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  exportOptionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  exportCancelButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exportCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  formModalContent: {
    width: width - 32,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '85%',
  },
  formModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabelText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  positionOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  positionOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  positionOptionTextActive: {
    color: Colors.textPrimary,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: Colors.backgroundElevated,
    marginBottom: 16,
  },
  previewImageRound: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundElevated,
    alignSelf: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  settingsSectionDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  settingsRow: {
    paddingVertical: 12,
  },
  settingsLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  settingsValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  editSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  editSettingsButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
});
