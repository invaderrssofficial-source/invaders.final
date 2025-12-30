import { useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';

export interface Order {
  id: string;
  productName: string;
  productImage: string;
  price: string;
  customerName: string;
  customerPhone: string;
  size: string;
  sizeCategory: 'adult' | 'kids';
  sleeveType: 'short' | 'long';
  transferSlipUri: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export const [OrdersProvider, useOrders] = createContextHook(() => {
  const utils = trpc.useUtils();
  
  const ordersQuery = trpc.orders.getAll.useQuery(undefined, {
    staleTime: 1000 * 60,
  });

  const createMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      utils.orders.getAll.invalidate();
    },
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.getAll.invalidate();
    },
  });

  const deleteMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      utils.orders.getAll.invalidate();
    },
  });

  const addOrder = useCallback((order: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    createMutation.mutate({
      productName: order.productName,
      productImage: order.productImage,
      price: order.price,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      size: order.size,
      sizeCategory: order.sizeCategory,
      sleeveType: order.sleeveType,
      transferSlipUri: order.transferSlipUri,
    });
  }, [createMutation]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    updateStatusMutation.mutate({ id: orderId, status });
  }, [updateStatusMutation]);

  const deleteOrder = useCallback((orderId: string) => {
    deleteMutation.mutate({ id: orderId });
  }, [deleteMutation]);

  const orders: Order[] = (ordersQuery.data ?? []).map((order: any) => ({
    id: order.id,
    productName: order.productName,
    productImage: order.productImage,
    price: order.price,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    size: order.size,
    sizeCategory: order.sizeCategory as 'adult' | 'kids',
    sleeveType: (order.sleeveType as 'short' | 'long') || 'short',
    transferSlipUri: order.transferSlipUri,
    status: order.status as Order['status'],
    createdAt: order.createdAt,
  }));

  return {
    orders,
    isLoading: ordersQuery.isLoading,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    refetch: ordersQuery.refetch,
  };
});
