//Day 3
import type { AppState } from './types';

let currentState: AppState = { status: 'idle' };

export function getState(): AppState {
  return currentState;
}

export function setState(newState: AppState, renderFn: () => void): void {
  currentState = newState;
  renderFn();
}
//Day 4
export function filterAndSearchProducts(
  searchTerm: string,
  category: string,
  sortBy: string,
): void {

  if (currentState.status !== 'success') return;
  let result = [...currentState.products];

  // Tìm kiếm sản phẩm theo tên (không phân biệt chữ hoa, chữ thường)
  if (searchTerm.trim() !== '') {
    result = result.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Lọc sản phẩm theo đúng danh mục được chọn
  if (category !== 'all') {
    result = result.filter(product => product.category === category);
  }

  // Sắp xếp danh sách theo giá tiền tăng hoặc giảm dần
  if (sortBy === 'price-low-to-high') {
    // Giá từ thấp đến cao (a - b)
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high-to-low') {
    // Giá từ cao đến thấp (b - a)
    result.sort((a, b) => b.price - a.price);
  }
  currentState.filteredProducts = result;
}