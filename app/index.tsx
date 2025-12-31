import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Linking,

  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Users,
  Heart,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  ChevronDown,
  ShoppingBag,
  Shirt,
  X,
  Ruler,
  User,
  Check,
  Shield,
  Copy,
  CreditCard,
  Paperclip,
  Instagram,
  Facebook,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useOrders, OrderItem } from '@/contexts/OrdersContext';
import { useAppContent, MerchItem, Hero } from '@/contexts/AppContentContext';

import AnimatedCard from '@/components/AnimatedCard';
import AchievementCard from '@/components/AchievementCard';
import StatCard from '@/components/StatCard';
import TouchableCard from '@/components/TouchableCard';
import PulsingLogo from '@/components/PulsingLogo';

const { width, height } = Dimensions.get('window');

const formatPrice = (price: string): string => {
  if (price.trim().toUpperCase().startsWith('MVR')) {
    return price;
  }
  return `MVR ${price}`;
};

const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const KIDS_SIZES = ['4', '6', '8', '10', '12', '14'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { addOrder } = useOrders();
  const { merchItems, heroes, bankInfo } = useAppContent();
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.9)).current;
  


  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMerch, setSelectedMerch] = useState<MerchItem | null>(null);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [currentSize, setCurrentSize] = useState('');
  const [currentSleeveType, setCurrentSleeveType] = useState<'short' | 'long'>('short');
  const [currentSizeCategory, setCurrentSizeCategory] = useState<'adult' | 'kids'>('adult');
  const [currentJerseyName, setCurrentJerseyName] = useState('');
  const [currentJerseyNumber, setCurrentJerseyNumber] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [transferSlipUri, setTransferSlipUri] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(true);
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;



  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }),
    ]).start();


  }, [heroOpacity, heroScale]);

  const handleContactPress = (type: 'phone' | 'email' | 'instagram' | 'facebook') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (type === 'phone') {
      Linking.openURL('tel:7414147');
    } else if (type === 'email') {
      Linking.openURL('mailto:invaderrss.official@gmail.com');
    } else if (type === 'instagram') {
      Linking.openURL('https://www.instagram.com/club.invaders/');
    } else if (type === 'facebook') {
      Linking.openURL('https://www.facebook.com/TEAM.INVADERSS/');
    }
  };

  const openMerchModal = (item: MerchItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMerch(item);
    setModalVisible(true);
    setShowSizeGuide(true);
    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: false, speed: 20 }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const closeMerchModal = () => {
    Animated.parallel([
      Animated.spring(modalScale, { toValue: 0.9, useNativeDriver: false, speed: 20 }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: false }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedMerch(null);
      setOrderName('');
      setOrderPhone('');
      setCartItems([]);
      setCurrentSize('');
      setCurrentSizeCategory('adult');
      setCurrentSleeveType('short');
      setCurrentJerseyName('');
      setCurrentJerseyNumber('');
      setCurrentQuantity(1);
      setTransferSlipUri(null);
      setCopiedAccount(false);
    });
  };

  const handleAddToCart = () => {
    if (!currentSize) {
      Alert.alert('Missing Info', 'Please select a size');
      return;
    }
    if (!currentJerseyName.trim()) {
      Alert.alert('Missing Info', 'Please enter the name for the jersey');
      return;
    }
    if (!currentJerseyNumber.trim()) {
      Alert.alert('Missing Info', 'Please enter the jersey number');
      return;
    }
    if (!selectedMerch) return;

    const newItem: OrderItem = {
      productName: selectedMerch.name,
      productImage: selectedMerch.image,
      price: selectedMerch.price,
      size: currentSize,
      sizeCategory: currentSizeCategory,
      sleeveType: currentSleeveType,
      jerseyName: currentJerseyName.trim(),
      jerseyNumber: currentJerseyNumber.trim(),
      quantity: currentQuantity,
    };

    setCartItems([...cartItems, newItem]);
    setCurrentSize('');
    setCurrentSizeCategory('adult');
    setCurrentSleeveType('short');
    setCurrentJerseyName('');
    setCurrentJerseyNumber('');
    setCurrentQuantity(1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added to Cart', `${newItem.jerseyName} #${newItem.jerseyNumber} added to cart`);
  };

  const handleRemoveFromCart = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (!orderName.trim()) {
      Alert.alert('Missing Info', 'Please enter your name');
      return;
    }
    if (!orderPhone.trim()) {
      Alert.alert('Missing Info', 'Please enter your phone number');
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add at least one item to your cart');
      return;
    }
    
    try {
      const totalPrice = calculateTotal();
      await addOrder({
        customerName: orderName.trim(),
        customerPhone: orderPhone.trim(),
        items: cartItems,
        totalPrice: totalPrice.toFixed(2),
        transferSlipUri,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const transferInfo = transferSlipUri ? '\n\nTransfer slip attached.' : '';
      Alert.alert(
        'Order Submitted! 🎉',
        `Thank you ${orderName}!\n\nYour order for ${itemsCount} item(s) has been received.${transferInfo}\n\nTotal: MVR ${totalPrice.toFixed(2)}\n\nWe will contact you at ${orderPhone} to confirm your order and payment.`,
        [{ text: 'OK', onPress: closeMerchModal }]
      );
    } catch (error: any) {
      console.error('Order submission error:', error);
      Alert.alert(
        'Order Failed',
        'Failed to submit order. Please try again or contact us directly.',
        [{ text: 'OK' }]
      );
    }
  };

  const scrollIndicatorOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const heroParallaxY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const heroContentOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const heroContentScale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const sectionFadeIn = (start: number, end: number) => scrollY.interpolate({
    inputRange: [start - 100, start, end],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  const sectionSlideUp = (start: number, end: number) => scrollY.interpolate({
    inputRange: [start - 100, start, end],
    outputRange: [30, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/4uz7v2to6991nj4qukz29' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.backgroundOverlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.85)', 'rgba(10,0,0,0.75)', 'rgba(0,0,0,0.9)']}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.backgroundVignette} />



      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: heroOpacity,
              transform: [
                { scale: heroScale },
                { translateY: heroParallaxY },
              ],
            },
          ]}
        >
          <View style={styles.orbContainer}>
            <PulsingLogo size={320} delay={0} opacity={0.15} />
          </View>

          <Animated.View
            style={[
              styles.heroContent,
              {
                opacity: heroContentOpacity,
                transform: [{ scale: heroContentScale }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow} />
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/mayksiynf9mps3sykzxn4' }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.clubName}>CLUB INVADERS</Text>
            
            <View style={styles.taglineContainer}>
              <View style={styles.taglineLine} />
              <Text style={styles.tagline}>MAKE IT COUNT</Text>
              <View style={styles.taglineLine} />
            </View>
            
            <Text style={styles.location}>
              <MapPin size={14} color={Colors.textSecondary} /> N. Miladhoo, Maldives
            </Text>

            <View style={styles.heroStats}>
              <StatCard value="2017" label="Est." delay={400} />
              <StatCard value="3" label="Titles" delay={500} />
              <StatCard value="8+" label="Years" delay={600} />
            </View>
          </Animated.View>

          <Animated.View style={[styles.scrollIndicator, { opacity: scrollIndicatorOpacity }]}>
            <Text style={styles.scrollText}>Scroll to explore</Text>
            <ChevronDown size={20} color={Colors.textMuted} />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: sectionFadeIn(300, 600),
              transform: [{ translateY: sectionSlideUp(300, 600) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <ShoppingBag size={22} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Merchandise</Text>
          </View>

          <Text style={styles.merchSubtitle}>Rep the Invaders</Text>

          <View style={styles.merchGrid}>
            {merchItems.map((item: MerchItem) => (
              <TouchableCard
                key={item.id}
                style={styles.merchCard}
                onPress={() => openMerchModal(item)}
              >
                <View style={styles.merchImageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.merchImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.merchImageOverlay}
                  />
                  <View style={styles.merchBadge}>
                    <Shirt size={12} color={Colors.textPrimary} />
                  </View>
                </View>
                <Text style={styles.merchName}>{item.name}</Text>
                <Text style={styles.merchPrice}>{formatPrice(item.price)}</Text>
              </TouchableCard>
            ))}
          </View>

          <AnimatedCard delay={400} style={styles.merchContactCard} glowing>
            <Text style={styles.merchContactText}>Interested in our merch?</Text>
            <Text style={styles.merchContactSubtext}>Contact us via phone or email to order</Text>
          </AnimatedCard>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: sectionFadeIn(800, 1100),
              transform: [{ translateY: sectionSlideUp(800, 1100) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Target size={22} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>About Us</Text>
          </View>

          <AnimatedCard delay={100} style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              A prominent force in the local futsal scene, characterized by passion, skill, and an unwavering commitment to excellence.
            </Text>
          </AnimatedCard>

          <AnimatedCard delay={200} style={styles.missionCard} glowing>
            <Text style={styles.missionLabel}>OUR MISSION</Text>
            <Text style={styles.missionText}>
              &quot;To Make It Count — champions and beyond&quot;
            </Text>
          </AnimatedCard>

          <AnimatedCard delay={300} style={styles.aboutCard}>
            <View style={styles.historyRow}>
              <View style={styles.historyIconContainer}>
                <Calendar size={20} color={Colors.primary} />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Our Journey</Text>
                <Text style={styles.historyText}>
                  Established in 2017 as a passion project, Club Invaders officially became a registered sports club in 2024. We have participated in every MFC tournament since our founding.
                </Text>
              </View>
            </View>
          </AnimatedCard>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: sectionFadeIn(1400, 1700),
              transform: [{ translateY: sectionSlideUp(1400, 1700) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Trophy size={22} color={Colors.gold} />
            </View>
            <Text style={styles.sectionTitle}>Achievements</Text>
          </View>

          <AchievementCard
            title="Slam Dunk Basket Champion"
            year="2023"
            type="champion"
            delay={100}
          />
          <AchievementCard
            title="MFC Tournament Champion"
            year="2024"
            type="champion"
            delay={200}
          />
          <AchievementCard
            title="MFC Tournament Runner-Up"
            year="2023"
            type="runner-up"
            delay={300}
          />
          <AchievementCard
            title="MFC & Council Cup Semifinals"
            year="2019-2022"
            type="semifinal"
            delay={400}
          />

          <AnimatedCard delay={500} style={styles.consistencyCard} glowing>
            <Text style={styles.consistencyText}>
              Consistent participation in every MFC tournament since 2017
            </Text>
          </AnimatedCard>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: sectionFadeIn(2000, 2300),
              transform: [{ translateY: sectionSlideUp(2000, 2300) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Shield size={22} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Our Heroes</Text>
          </View>

          <Text style={styles.heroesSubtitle}>The Pride of Invaders</Text>

          <View style={styles.playersGrid}>
            {heroes.map((player: Hero, index: number) => (
              <TouchableCard
                key={player.id}
                style={styles.playerCard}
                glowing={index < 3}
              >
                <View style={styles.playerImageContainer}>
                  <Image
                    source={{ uri: player.image }}
                    style={styles.playerImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.playerImageOverlay}
                  />
                  <View style={styles.playerNumber}>
                    <Text style={styles.playerNumberText}>{player.number}</Text>
                  </View>
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                </View>
              </TouchableCard>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: sectionFadeIn(2800, 3100),
              transform: [{ translateY: sectionSlideUp(2800, 3100) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Heart size={22} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Community Impact</Text>
          </View>

          <TouchableCard glowing style={styles.impactCard}>
            <View style={styles.impactIcon}>
              <Users size={32} color={Colors.primary} />
            </View>
            <Text style={styles.impactTitle}>Kids Coaching Camp</Text>
            <Text style={styles.impactYear}>2023</Text>
            <Text style={styles.impactDesc}>
              Conducted a Futsal Coaching Camp for 139 students from Hidhaya School
            </Text>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>139</Text>
              <Text style={styles.impactLabel}>Students Trained</Text>
            </View>
          </TouchableCard>

          <TouchableCard style={styles.charityCard}>
            <View style={styles.charityHeader}>
              <Heart size={24} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.charityTitle}>Palestine Aid</Text>
            </View>
            <Text style={styles.charityDesc}>
              Raised and donated to the International Aid Campaign for Palestine
            </Text>
            <Text style={styles.charityAmount}>MVR 123,456.78</Text>
          </TouchableCard>

          <AnimatedCard delay={300}>
            <View style={styles.eventRow}>
              <View style={styles.eventDot} />
              <View>
                <Text style={styles.eventTitle}>Kuda EiD Sports Festival</Text>
                <Text style={styles.eventDesc}>Organized for the local community in 2019</Text>
              </View>
            </View>
          </AnimatedCard>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            styles.contactSection,
            {
              opacity: sectionFadeIn(3500, 3800),
              transform: [{ translateY: sectionSlideUp(3500, 3800) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Mail size={22} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Get In Touch</Text>
          </View>

          <View style={styles.contactCards}>
            <TouchableCard
              onPress={() => handleContactPress('phone')}
              style={styles.contactCard}
              glowing
            >
              <Phone size={28} color={Colors.primary} />
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>7414147</Text>
            </TouchableCard>

            <TouchableCard
              onPress={() => handleContactPress('email')}
              style={styles.contactCard}
              glowing
            >
              <Mail size={28} color={Colors.primary} />
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValueSmall}>invaderrss.official@gmail.com</Text>
            </TouchableCard>
          </View>

          <View style={styles.socialCards}>
            <TouchableCard
              onPress={() => handleContactPress('instagram')}
              style={styles.socialCard}
            >
              <View style={styles.socialIconContainer}>
                <Instagram size={26} color="#E4405F" />
              </View>
              <Text style={styles.socialLabel}>Instagram</Text>
              <Text style={styles.socialHandle}>@club.invaders</Text>
            </TouchableCard>

            <TouchableCard
              onPress={() => handleContactPress('facebook')}
              style={styles.socialCard}
            >
              <View style={styles.socialIconContainer}>
                <Facebook size={26} color="#1877F2" />
              </View>
              <Text style={styles.socialLabel}>Facebook</Text>
              <Text style={styles.socialHandle}>TEAM.INVADERSS</Text>
            </TouchableCard>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLogoContainer}>
              <View style={styles.footerLogoGlow} />
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/mayksiynf9mps3sykzxn4' }}
                style={styles.footerLogoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.footerText}>CLUB INVADERS</Text>
            <Text style={styles.footerSubtext}>Est. 2017 • N. Miladhoo, Maldives</Text>
            <Text style={styles.copyright}>© 2024 Club Invaders. All rights reserved.</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeMerchModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeMerchModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Shirt size={20} color={Colors.primary} />
                  <Text style={styles.modalTitle}>{selectedMerch?.name}</Text>
                </View>
                <View style={styles.modalHeaderRight}>
                  {cartItems.length > 0 && (
                    <View style={styles.cartBadge}>
                      <ShoppingBag size={16} color={Colors.textPrimary} />
                      <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={closeMerchModal} style={styles.closeButton}>
                    <X size={22} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalProductPreview}>
                <Image
                  source={{ uri: selectedMerch?.image }}
                  style={styles.modalProductImage}
                  resizeMode="cover"
                />
                <Text style={styles.modalProductPrice}>{selectedMerch?.price ? formatPrice(selectedMerch.price) : ''}</Text>
              </View>

              <TouchableOpacity
                style={styles.sizeGuideToggle}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowSizeGuide(!showSizeGuide);
                }}
              >
                <Ruler size={18} color={Colors.primary} />
                <Text style={styles.sizeGuideToggleText}>Size Guide</Text>
                <View style={[styles.toggleIndicator, showSizeGuide && styles.toggleIndicatorActive]}>
                  <Text style={styles.toggleIndicatorText}>{showSizeGuide ? '−' : '+'}</Text>
                </View>
              </TouchableOpacity>

              {showSizeGuide && (
                <View style={styles.sizeGuideContainer}>
                  <View style={styles.sizeGuideTable}>
                    <View style={styles.sizeGuideHeaderRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeGuideHeaderCell, styles.sizeLabelCell]}>Size</Text>
                      <Text style={[styles.sizeGuideCell, styles.sizeGuideHeaderCell]}>Chest</Text>
                      <Text style={[styles.sizeGuideCell, styles.sizeGuideHeaderCell]}>Length</Text>
                      <Text style={[styles.sizeGuideCell, styles.sizeGuideHeaderCell]}>Shoulder</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>XS</Text>
                      <Text style={styles.sizeGuideCell}>34&quot;</Text>
                      <Text style={styles.sizeGuideCell}>26&quot;</Text>
                      <Text style={styles.sizeGuideCell}>16&quot;</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>S</Text>
                      <Text style={styles.sizeGuideCell}>36&quot;</Text>
                      <Text style={styles.sizeGuideCell}>27&quot;</Text>
                      <Text style={styles.sizeGuideCell}>17&quot;</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>M</Text>
                      <Text style={styles.sizeGuideCell}>38&quot;</Text>
                      <Text style={styles.sizeGuideCell}>28&quot;</Text>
                      <Text style={styles.sizeGuideCell}>18&quot;</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>L</Text>
                      <Text style={styles.sizeGuideCell}>40&quot;</Text>
                      <Text style={styles.sizeGuideCell}>29&quot;</Text>
                      <Text style={styles.sizeGuideCell}>19&quot;</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>XL</Text>
                      <Text style={styles.sizeGuideCell}>42&quot;</Text>
                      <Text style={styles.sizeGuideCell}>30&quot;</Text>
                      <Text style={styles.sizeGuideCell}>20&quot;</Text>
                    </View>
                    <View style={[styles.sizeGuideRow, styles.sizeGuideLastRow]}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>XXL</Text>
                      <Text style={styles.sizeGuideCell}>44&quot;</Text>
                      <Text style={styles.sizeGuideCell}>31&quot;</Text>
                      <Text style={styles.sizeGuideCell}>21&quot;</Text>
                    </View>
                  </View>

                  <Text style={styles.sizeGuideSubtitle}>Kids Sizes</Text>
                  <View style={styles.sizeGuideTable}>
                    <View style={styles.sizeGuideHeaderRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeGuideHeaderCell, styles.sizeLabelCell]}>Size</Text>
                      <Text style={[styles.sizeGuideCell, styles.sizeGuideHeaderCell]}>Chest</Text>
                      <Text style={[styles.sizeGuideCell, styles.sizeGuideHeaderCell]}>Length</Text>
                      <Text style={[styles.sizeGuideCell, styles.sizeGuideHeaderCell]}>Age</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>4</Text>
                      <Text style={styles.sizeGuideCell}>22&quot;</Text>
                      <Text style={styles.sizeGuideCell}>16&quot;</Text>
                      <Text style={styles.sizeGuideCell}>3-4</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>6</Text>
                      <Text style={styles.sizeGuideCell}>24&quot;</Text>
                      <Text style={styles.sizeGuideCell}>18&quot;</Text>
                      <Text style={styles.sizeGuideCell}>5-6</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>8</Text>
                      <Text style={styles.sizeGuideCell}>26&quot;</Text>
                      <Text style={styles.sizeGuideCell}>20&quot;</Text>
                      <Text style={styles.sizeGuideCell}>7-8</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>10</Text>
                      <Text style={styles.sizeGuideCell}>28&quot;</Text>
                      <Text style={styles.sizeGuideCell}>22&quot;</Text>
                      <Text style={styles.sizeGuideCell}>9-10</Text>
                    </View>
                    <View style={styles.sizeGuideRow}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>12</Text>
                      <Text style={styles.sizeGuideCell}>30&quot;</Text>
                      <Text style={styles.sizeGuideCell}>24&quot;</Text>
                      <Text style={styles.sizeGuideCell}>11-12</Text>
                    </View>
                    <View style={[styles.sizeGuideRow, styles.sizeGuideLastRow]}>
                      <Text style={[styles.sizeGuideCell, styles.sizeLabelCell, styles.sizeLabelText]}>14</Text>
                      <Text style={styles.sizeGuideCell}>32&quot;</Text>
                      <Text style={styles.sizeGuideCell}>25&quot;</Text>
                      <Text style={styles.sizeGuideCell}>13-14</Text>
                    </View>
                  </View>

                  <Text style={styles.sizeGuideNote}>All measurements are in inches</Text>
                </View>
              )}

              <View style={styles.sizeSection}>
                <Text style={styles.sizeSectionTitle}>Select Size</Text>
                
                <View style={styles.sizeCategoryToggle}>
                  <TouchableOpacity
                    style={[
                      styles.sizeCategoryButton,
                      currentSizeCategory === 'adult' && styles.sizeCategoryButtonActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCurrentSizeCategory('adult');
                      setCurrentSize('');
                    }}
                  >
                    <Text style={[
                      styles.sizeCategoryText,
                      currentSizeCategory === 'adult' && styles.sizeCategoryTextActive,
                    ]}>Adult</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sizeCategoryButton,
                      currentSizeCategory === 'kids' && styles.sizeCategoryButtonActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCurrentSizeCategory('kids');
                      setCurrentSize('');
                    }}
                  >
                    <Text style={[
                      styles.sizeCategoryText,
                      currentSizeCategory === 'kids' && styles.sizeCategoryTextActive,
                    ]}>Kids</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.sizeGrid}>
                  {(currentSizeCategory === 'adult' ? ADULT_SIZES : KIDS_SIZES).map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        currentSize === size && styles.sizeButtonSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCurrentSize(size);
                      }}
                    >
                      <Text
                        style={[
                          styles.sizeButtonText,
                          currentSize === size && styles.sizeButtonTextSelected,
                        ]}
                      >
                        {size}
                      </Text>
                      {currentSize === size && (
                        <View style={styles.sizeCheckmark}>
                          <Check size={10} color={Colors.background} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.sleeveSection}>
                <Text style={styles.sizeSectionTitle}>Sleeve Type</Text>
                <View style={styles.sleeveToggle}>
                  <TouchableOpacity
                    style={[
                      styles.sleeveButton,
                      currentSleeveType === 'short' && styles.sleeveButtonActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCurrentSleeveType('short');
                    }}
                  >
                    <Text style={[
                      styles.sleeveButtonText,
                      currentSleeveType === 'short' && styles.sleeveButtonTextActive,
                    ]}>Short Sleeve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sleeveButton,
                      currentSleeveType === 'long' && styles.sleeveButtonActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCurrentSleeveType('long');
                    }}
                  >
                    <Text style={[
                      styles.sleeveButtonText,
                      currentSleeveType === 'long' && styles.sleeveButtonTextActive,
                    ]}>Long Sleeve</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.jerseyNameSection}>
                <Text style={styles.sizeSectionTitle}>Jersey Details</Text>
                <View style={styles.inputContainer}>
                  <User size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Name to print on jersey"
                    placeholderTextColor={Colors.textMuted}
                    value={currentJerseyName}
                    onChangeText={setCurrentJerseyName}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Shirt size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Jersey number (e.g., 10)"
                    placeholderTextColor={Colors.textMuted}
                    value={currentJerseyNumber}
                    onChangeText={setCurrentJerseyNumber}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  (!currentSize || !currentJerseyName.trim() || !currentJerseyNumber.trim()) && styles.submitButtonDisabled,
                ]}
                onPress={handleAddToCart}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ShoppingBag size={18} color={Colors.textPrimary} />
                  <Text style={styles.submitButtonText}>Add to Cart</Text>
                </LinearGradient>
              </TouchableOpacity>

              {cartItems.length > 0 && (
                <View style={styles.cartSection}>
                  <Text style={styles.cartTitle}>Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</Text>
                  {cartItems.map((item, index) => (
                    <View key={index} style={styles.cartItem}>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.jerseyName} #{item.jerseyNumber}</Text>
                        <Text style={styles.cartItemDetails}>
                          Size: {item.sizeCategory === 'kids' ? `Kids ${item.size}` : item.size} • {item.sleeveType === 'long' ? 'Long' : 'Short'} Sleeve
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeCartItemButton}
                        onPress={() => handleRemoveFromCart(index)}
                      >
                        <X size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <View style={styles.cartTotal}>
                    <Text style={styles.cartTotalLabel}>Total:</Text>
                    <Text style={styles.cartTotalAmount}>MVR {calculateTotal().toFixed(2)}</Text>
                  </View>
                </View>
              )}

              <View style={styles.orderForm}>
                <Text style={styles.orderFormTitle}>Your Details</Text>
                
                <View style={styles.inputContainer}>
                  <User size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor={Colors.textMuted}
                    value={orderName}
                    onChangeText={setOrderName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Phone size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor={Colors.textMuted}
                    value={orderPhone}
                    onChangeText={setOrderPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.bankTransferSection}>
                <View style={styles.bankTransferHeader}>
                  <CreditCard size={18} color={Colors.primary} />
                  <Text style={styles.bankTransferTitle}>Bank Transfer Details</Text>
                </View>
                
                <View style={styles.bankInfoCard}>
                  <View style={styles.bankInfoRow}>
                    <Text style={styles.bankInfoLabel}>Bank</Text>
                    <Text style={styles.bankInfoValue}>{bankInfo.bankName}</Text>
                  </View>
                  <View style={styles.bankInfoRow}>
                    <Text style={styles.bankInfoLabel}>Account Name</Text>
                    <Text style={styles.bankInfoValue}>{bankInfo.accountName}</Text>
                  </View>
                  <View style={styles.bankInfoRowAccount}>
                    <View style={styles.bankInfoAccountLeft}>
                      <Text style={styles.bankInfoLabel}>Account Number</Text>
                      <Text style={styles.bankAccountNumber}>{bankInfo.accountNumber}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.copyButton,
                        copiedAccount && styles.copyButtonSuccess,
                      ]}
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        if (Platform.OS === 'web') {
                          navigator.clipboard.writeText(bankInfo.accountNumber);
                        }
                        setCopiedAccount(true);
                        setTimeout(() => setCopiedAccount(false), 2000);
                        Alert.alert('Copied!', 'Account number copied to clipboard');
                      }}
                    >
                      {copiedAccount ? (
                        <Check size={16} color={Colors.textPrimary} />
                      ) : (
                        <Copy size={16} color={Colors.textPrimary} />
                      )}
                      <Text style={styles.copyButtonText}>
                        {copiedAccount ? 'Copied' : 'Copy'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.transferReferenceContainer}>
                  <View style={styles.transferReferenceHeader}>
                    <Paperclip size={16} color={Colors.textMuted} />
                    <Text style={styles.transferReferenceLabel}>Upload Transfer Slip</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.uploadSlipButton}
                    onPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ['images'],
                        allowsEditing: false,
                        quality: 0.8,
                      });
                      if (!result.canceled && result.assets[0]) {
                        setTransferSlipUri(result.assets[0].uri);
                      }
                    }}
                  >
                    {transferSlipUri ? (
                      <View style={styles.uploadedSlipContainer}>
                        <Image
                          source={{ uri: transferSlipUri }}
                          style={styles.uploadedSlipImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeSlipButton}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setTransferSlipUri(null);
                          }}
                        >
                          <X size={14} color={Colors.textPrimary} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.uploadSlipContent}>
                        <Paperclip size={24} color={Colors.primary} />
                        <Text style={styles.uploadSlipText}>Tap to upload transfer slip</Text>
                        <Text style={styles.uploadSlipSubtext}>PNG, JPG up to 10MB</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.transferReferenceNote}>
                    After making payment, upload your transfer slip here
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!orderName || !orderPhone || cartItems.length === 0) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitOrder}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ShoppingBag size={20} color={Colors.textPrimary} />
                  <Text style={styles.submitButtonText}>Place Order</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.orderNote}>
                We will contact you to confirm your order and arrange payment/delivery.
              </Text>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
  },

  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    minHeight: height * 0.92,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  orbContainer: {
    position: 'absolute',
    top: '18%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'transparent',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 25,
  },
  logoRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  clubName: {
    fontSize: 38,
    fontWeight: '900' as const,
    letterSpacing: 5,
    textAlign: 'center',
    color: Colors.textPrimary,
    backgroundColor: 'transparent',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 18,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: Colors.primary,
    marginHorizontal: 12,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
    letterSpacing: 6,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 36,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 20,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 45,
    alignItems: 'center',
  },
  scrollText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.textSecondary,
  },
  aboutCard: {
    marginBottom: 16,
  },
  missionCard: {
    marginTop: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  missionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primary,
    letterSpacing: 3,
    marginBottom: 14,
  },
  missionText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  consistencyCard: {
    marginTop: 4,
    alignItems: 'center',
  },
  consistencyText: {
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  impactCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  impactIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  impactYear: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginTop: 4,
    marginBottom: 12,
  },
  impactDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  impactStat: {
    marginTop: 22,
    alignItems: 'center',
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  impactNumber: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  impactLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  charityCard: {
    marginBottom: 16,
  },
  charityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  charityTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  charityDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  charityAmount: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.success,
    marginTop: 18,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginTop: 4,
    marginRight: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  contactSection: {
    paddingBottom: 20,
  },
  contactCards: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    padding: 22,
  },
  contactLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 14,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  contactValueSmall: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  socialCards: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 12,
  },
  socialCard: {
    flex: 1,
    alignItems: 'center',
    padding: 18,
  },
  socialIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  socialHandle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 70,
    paddingTop: 45,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    width: 70,
    height: 70,
  },
  footerLogoGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  footerLogoImage: {
    width: 52,
    height: 52,
  },
  footerText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: 3,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  copyright: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 26,
  },
  merchSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 22,
    letterSpacing: 1,
  },
  merchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  merchCard: {
    width: (width - 52) / 2,
    padding: 0,
    overflow: 'hidden',
  },
  merchImageContainer: {
    width: '100%',
    height: 190,
    backgroundColor: Colors.backgroundElevated,
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  merchImage: {
    width: '100%',
    height: '100%',
  },
  merchImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  merchBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  merchName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  merchPrice: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.primary,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
  },
  merchContactCard: {
    marginTop: 22,
    alignItems: 'center',
  },
  merchContactText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  merchContactSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  heroesSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 22,
    letterSpacing: 1,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  playerCard: {
    width: (width - 70) / 3,
    padding: 0,
    overflow: 'hidden',
    marginBottom: 4,
  },
  playerImageContainer: {
    width: '100%',
    height: 105,
    backgroundColor: Colors.backgroundElevated,
    position: 'relative',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  playerImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  playerNumber: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  playerNumberText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  playerInfo: {
    padding: 10,
  },
  playerName: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  uploadSlipButton: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadSlipContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  uploadSlipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  uploadSlipSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  uploadedSlipContainer: {
    position: 'relative',
  },
  uploadedSlipImage: {
    width: '100%',
    height: 160,
  },
  removeSlipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayDark,
  },
  modalContent: {
    width: width - 32,
    maxHeight: height * 0.85,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalProductPreview: {
    alignItems: 'center',
    marginBottom: 18,
  },
  modalProductImage: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    backgroundColor: Colors.backgroundElevated,
  },
  modalProductPrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginTop: 14,
  },
  sizeGuideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sizeGuideToggleText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIndicatorActive: {
    backgroundColor: Colors.primary,
  },
  toggleIndicatorText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  sizeGuideContainer: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sizeGuideTable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  sizeGuideHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  sizeGuideRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  sizeGuideLastRow: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  sizeGuideCell: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 6,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sizeGuideHeaderCell: {
    color: Colors.textPrimary,
    fontWeight: '700' as const,
    fontSize: 12,
  },
  sizeLabelCell: {
    flex: 0.7,
  },
  sizeLabelText: {
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  sizeGuideNote: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  sizeGuideSubtitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 18,
    marginBottom: 10,
  },
  sizeSection: {
    marginBottom: 22,
  },
  sizeSectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizeButton: {
    width: (width - 32 - 44 - 50) / 6,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sizeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  sizeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  sizeButtonTextSelected: {
    color: Colors.textPrimary,
  },
  sizeCheckmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderForm: {
    marginBottom: 22,
  },
  orderFormTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  submitButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  orderNote: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  sizeCategoryToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sizeCategoryButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 14,
  },
  sizeCategoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  sizeCategoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  sizeCategoryTextActive: {
    color: Colors.textPrimary,
  },
  sleeveSection: {
    marginBottom: 22,
  },
  sleeveToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sleeveButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  sleeveButtonActive: {
    backgroundColor: Colors.primary,
  },
  sleeveButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  sleeveButtonTextActive: {
    color: Colors.textPrimary,
  },
  bankTransferSection: {
    marginBottom: 22,
  },
  bankTransferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bankTransferTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  bankInfoCard: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bankInfoRowAccount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  bankInfoAccountLeft: {
    flex: 1,
  },
  bankInfoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  bankInfoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  bankAccountNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 6,
  },
  copyButtonSuccess: {
    backgroundColor: Colors.success,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  transferReferenceContainer: {
    marginTop: 16,
  },
  transferReferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  transferReferenceLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  transferReferenceNote: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 10,
    lineHeight: 16,
  },
  jerseyNameSection: {
    marginBottom: 22,
  },
  addToCartButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 22,
  },
  cartSection: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  cartTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cartItemDetails: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  removeCartItemButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cartTotalLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  
});
