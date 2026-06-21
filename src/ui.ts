import { getState, filterAndSearchProducts } from './state';
import { debounce } from './utils';

const appDiv = document.getElementById('app');

export function render(): void {
  if (!appDiv) return;

  const state = getState();

  // Thu hẹp kiểu triệt để dựa vào thuộc tính 'status' của Discriminated Union
  switch (state.status) {
    case 'idle':
      appDiv.innerHTML = `<div class="info">Hệ thống đang chờ kích hoạt...</div>`;
      break;

    case 'loading':
      appDiv.innerHTML = `<div class="loader">🔄 Đang tải dữ liệu sản phẩm, vui lòng đợi...</div>`;
      break;

    case 'error':
      appDiv.innerHTML = `
        <div class="error-box">
          <h3>⚠️ Đã xảy ra lỗi kết nối!</h3>
          <p>${state.message}</p>
          <button id="retry-btn" class="btn">Thử lại</button>
        </div>
      `;
      // Gắn sự kiện nút thử lại để tải lại trang
      document.getElementById('retry-btn')?.addEventListener('click', () => {
        window.location.reload();
      });
      break;

    case 'success':
      // Giao diện Dashboard chính khi dữ liệu đã tải về thành công
      appDiv.innerHTML = `
        <header>
          <h1> DevDash — Dashboard Quản Lý Sản Phẩm</h1>
        </header>

        <section class="filter-bar">
          <input type="text" id="search-input" placeholder="Tìm sản phẩm theo tên..." />
          
          <select id="category-filter">
            <option value="all">Tất cả danh mục</option>
            ${state.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>

          <select id="price-sort">
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-low-to-high">Giá: Thấp đến Cao</option>
            <option value="price-high-to-low">Giá: Cao đến Thấp</option>
          </select>
        </section>

        <main class="dashboard-layout">
          <section class="product-list-section">
            <h2>Danh sách sản phẩm (${state.filteredProducts.length})</h2>
            <div class="products-grid">
              ${state.filteredProducts.map(product => `
                <div class="product-card" data-id="${product.id}">
                  <img src="${product.image}" alt="${product.title}" />
                  <div class="product-info">
                    <h4>${product.title}</h4>
                    <p class="price">$${product.price}</p>
                    <span class="badge">${product.category}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>

          <section class="product-detail-section" id="detail-panel">
            <div class="empty-detail">💡 Bấm vào một sản phẩm ở bên trái để xem thông tin chi tiết.</div>
          </section>
        </main>
      `;
      setupEventListeners();
      break;
  }
}

function setupEventListeners(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement | null;
  const priceSort = document.getElementById('price-sort') as HTMLSelectElement | null;

  // xử lý trung gian khi có bất kỳ bộ lọc nào thay đổi
  const triggerFilter = () => {
    const searchTerm = searchInput?.value || '';
    const selectedCategory = categoryFilter?.value || 'all';
    const selectedSort = priceSort?.value || 'default';

    // Gọi hàm HOF từ state.ts để xử lý dữ liệu mảng
    filterAndSearchProducts(searchTerm, selectedCategory, selectedSort);
    
    // Chỉ render lại danh sách sản phẩm để giữ nguyên focus con trỏ chuột ở ô input
    renderProductListOnly();
  };

  // Áp dụng DEBOUNCE: Bọc hàm triggerFilter lại, chỉ cho chạy sau khi ngừng gõ 300ms
  const debouncedSearch = debounce(triggerFilter, 300);

  searchInput?.addEventListener('input', debouncedSearch);
  categoryFilter?.addEventListener('change', triggerFilter);
  priceSort?.addEventListener('change', triggerFilter);

  // Sự kiện Click xem chi tiết sản phẩm sản phẩm (Event Delegation)
  const grid = document.querySelector('.products-grid');
  grid?.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('.product-card');
    if (card) {
      const id = Number(card.getAttribute('data-id'));
      renderDetailById(id);
    }
  });
}

function renderProductListOnly(): void {
  const state = getState();
  if (state.status !== 'success') return;

  const grid = document.querySelector('.products-grid');
  if (grid) {
    grid.innerHTML = state.filteredProducts.map(product => `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.title}" />
        <div class="product-info">
          <h4>${product.title}</h4>
          <p class="price">$${product.price}</p>
          <span class="badge">${product.category}</span>
        </div>
      </div>
    `).join('');
  }

  // Cập nhật lại số lượng sản phẩm hiển thị trên tiêu đề
  const countHeader = document.querySelector('.product-list-section h2');
  if (countHeader) {
    countHeader.textContent = `Danh sách sản phẩm (${state.filteredProducts.length})`;
  }
}

function renderDetailById(id: number): void {
  const state = getState();
  if (state.status !== 'success') return;

  // Dùng hàm tìm kiếm phần tử trong mảng sản phẩm gốc
  const targetProduct = state.products.find(p => p.id === id);
  const detailPanel = document.getElementById('detail-panel');

  if (targetProduct && detailPanel) {
    detailPanel.innerHTML = `
      <div class="detail-card">
        <img src="${targetProduct.image}" alt="${targetProduct.title}" />
        <h3>${targetProduct.title}</h3>
        <span class="badge">${targetProduct.category}</span>
        <p class="detail-price">$${targetProduct.price}</p>
        <p class="detail-desc">${targetProduct.description}</p>
        <hr class="divider" />
        <div class="detail-rating">
          <span>⭐ <strong>${targetProduct.rating.rate}</strong> / 5</span>
          <span class="review-count">(${targetProduct.rating.count} đánh giá từ người dùng)</span>
        </div>
      </div>
    `;
  }
}