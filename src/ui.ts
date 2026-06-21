import { getState, filterAndSearchProducts } from './state';
import { debounce } from './utils';

const appDiv = document.getElementById('app');

export function render(): void {
  if (!appDiv) return;

  const state = getState();

  switch (state.status) {
    case 'idle':
      appDiv.innerHTML = `<div class="info" style="text-align:center; padding:50px; color:#64748b;">Hệ thống đang chờ kích hoạt...</div>`;
      break;

    case 'loading':
      appDiv.innerHTML = `
        <div class="loader-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px 0;">
          <div class="spinner" style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #3b82f6; border-radius:50%; animation: spin 1s linear infinite; margin-bottom:15px;"></div>
          <p style="color:#64748b; font-weight:500;">🔄 Đang tải dữ liệu sản phẩm, vui lòng đợi...</p>
        </div>
      `;
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
      appDiv.innerHTML = `
        <header class="app-header">
          <div class="header-content">
            <h1><span class="logo-icon">🛍️</span> DevDash</h1>
            <p class="subtitle">Hệ thống Quản lý & Bộ lọc Sản phẩm Cao cấp</p>
          </div>
        </header>

        <section class="filter-bar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="search-input" placeholder="Tìm sản phẩm theo tên hoặc nhãn hiệu..." />
          </div>
          
          <div class="filter-group">
            <select id="category-filter">
              <option value="all">📁 Tất cả danh mục</option>
              ${state.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            </select>

            <select id="price-sort">
              <option value="default">↕️ Sắp xếp mặc định</option>
              <option value="price-low-to-high">Giá: Thấp đến Cao</option>
              <option value="price-high-to-low">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </section>

        <main class="dashboard-layout">
          <section class="product-list-section">
            <div class="list-header">
              <h2>Tất cả sản phẩm</h2>
              <span class="results-count">${state.filteredProducts.length} kết quả</span>
            </div>
            
            <div class="products-grid">
              ${state.filteredProducts.map(product => `
                <div class="product-card" data-id="${product.id}" style="cursor: pointer;">
                  <div class="card-img-wrapper" style="pointer-events: none;">
                    <img src="${product.image}" alt="${product.title}" />
                  </div>
                  <div class="product-info" style="pointer-events: none;">
                    <span class="badge">${product.category}</span>
                    <h4>${product.title}</h4>
                    <div class="card-footer">
                      <p class="price">$${product.price.toFixed(2)}</p>
                      <span class="card-rating">⭐ ${product.rating.rate}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>

          <section class="product-detail-section" id="detail-panel">
            <div class="empty-detail">
              <div class="empty-icon">🛍️</div>
              <p>Bấm vào một sản phẩm ở danh sách bên trái để xem thông tin chi tiết đầy đủ.</p>
            </div>
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
    console.log("Bạn vừa click vào thẻ:", e.target);
    const card = (e.target as HTMLElement).closest('.product-card');
    console.log("Thẻ cha tìm được là:", card);

    if (card) {
      const id = Number(card.getAttribute('data-id'));
      console.log("ID sản phẩm tìm được là:", id); // 3. Kiểm tra ID
      renderDetailById(id);

      document.querySelectorAll('.product-card').forEach(c => c.classList.remove('active-card'));
      card.classList.add('active-card');
    }
  });
}

function renderProductListOnly(): void {
  const state = getState();
  if (state.status !== 'success') return;

  const grid = document.querySelector('.products-grid');
  if (grid) {
    grid.innerHTML = state.filteredProducts.map(product => `
      <div class="product-card" data-id="${product.id}" style="cursor: pointer;">
        <div class="card-img-wrapper" style="pointer-events: none;">
          <img src="${product.image}" alt="${product.title}" />
        </div>
        <div class="product-info" style="pointer-events: none;">
          <span class="badge">${product.category}</span>
          <h4>${product.title}</h4>
          <div class="card-footer">
            <p class="price">$${product.price.toFixed(2)}</p>
            <span class="card-rating">⭐ ${product.rating.rate}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  const countHeader = document.querySelector('.results-count');
  if (countHeader) {
    countHeader.textContent = `${state.filteredProducts.length} kết quả`;
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
      <div class="detail-card animate-fade-in">
        <div class="detail-badge-row">
          <span class="badge spec-badge">${targetProduct.category}</span>
          <span class="product-id-tag">ID: #${targetProduct.id}</span>
        </div>
        
        <div class="detail-img-container">
          <img src="${targetProduct.image}" alt="${targetProduct.title}" />
        </div>
        
        <h3>${targetProduct.title}</h3>
        
        <div class="detail-rating-row">
          <span class="stars">⭐ <strong>${targetProduct.rating.rate}</strong> / 5.0</span>
          <span class="review-count">(${targetProduct.rating.count} lượt đánh giá)</span>
        </div>

        <p class="detail-price">$${targetProduct.price.toFixed(2)}</p>
        
        <div class="detail-desc-box">
          <h5>Mô tả sản phẩm</h5>
          <p class="detail-desc">${targetProduct.description}</p>
        </div>
        
        <button class="buy-now-btn" onclick="alert('Tính năng mua hàng đang được phát triển!')">
          🛒 Thêm Vào Giỏ Hàng
        </button>
      </div>
    `;
  }
}