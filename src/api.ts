import type { Product } from './types';

// Bản doanh của Fake Store API
const BASE_URL = 'https://fakestoreapi.com';

export async function fetchJson<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Lỗi kết nối API: ${response.status} ${response.statusText}`);
    }
    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Đã xảy ra lỗi không xác định khi tải dữ liệu.');
  }
}

export async function getProducts(): Promise<Product[]> {
  return fetchJson<Product[]>('/products');
}

export async function getProductById(id: number): Promise<Product> {
  return fetchJson<Product>(`/products/${id}`);
}

export async function getCategories(): Promise<string[]> {
  return fetchJson<string[]>('/products/categories');
}