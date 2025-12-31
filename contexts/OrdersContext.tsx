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
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    await createOrderMutation.mutateAsync(order);
  }, [createOrderMutation]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    await updateStatusMutation.mutateAsync({ id: orderId, status });
  }, [updateStatusMutation]);

  const deleteOrder = useCallback(async (orderId: string) => {
    await deleteOrderMutation.mutateAsync({ id: orderId });
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
