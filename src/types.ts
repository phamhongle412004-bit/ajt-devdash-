export interface Rating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating;
}

export type CreateProductDTO = Omit<Product, 'id' | 'rating'>;

export type UpdateProductPayload = Partial<CreateProductDTO>;

export interface StateIdle {
  status: 'idle';
}

export interface StateLoading {
  status: 'loading';
}

export interface StateSuccess {
  status: 'success';
  products: Product[];            // Danh sách sản phẩm gốc tải về từ API
  filteredProducts: Product[];    // Danh sách sau khi người dùng tìm kiếm/lọc
  categories: string[];           // Danh sách các danh mục sản phẩm (phục vụ bộ lọc)
  selectedProduct: Product | null; // Sản phẩm đang được chọn để xem chi tiết
}

export interface StateError {
  status: 'error';
  message: string;
}

export type AppState = StateIdle | StateLoading | StateSuccess | StateError;