import { useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

export interface OrderItem {
  productName: string;
  productImage: string;
  price: string;
  size: string;
  sizeCategory: 'adult' | 'kids';
  sleeveType: 'short' | 'long';
  jerseyName: string;
  jerseyNumber: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: string;
  transferSlipUri: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export const [OrdersProvider, useOrders] = createContextHook(() => {
  const queryClient = useQueryClient();
  
  const ordersQuery = trpc.orders.getAll.useQuery(undefined, {
    staleTime: 1000 * 60,
    retry: 0,
    retryDelay: 500,
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['orders', 'getAll']] });
    },
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['orders', 'getAll']] });
    },
  });

  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['orders', 'getAll']] });
    },
  });

  const addOrder = useCallback((order: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    createOrderMutation.mutate(order);
  }, [createOrderMutation]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    updateStatusMutation.mutate({ id: orderId, status });
  }, [updateStatusMutation]);

  const deleteOrder = useCallback((orderId: string) => {
    deleteOrderMutation.mutate({ id: orderId });
  }, [deleteOrderMutation]);

  const orders = ordersQuery.data ?? [];

  return {
    orders,
    isLoading: ordersQuery.isLoading,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    refetch: () => ordersQuery.refetch(),
  };
});
