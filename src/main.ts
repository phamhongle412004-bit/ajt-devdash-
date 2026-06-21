import { getProducts, getCategories } from './api';
import { setState } from './state';
import { render } from './ui';


async function initApp(): Promise<void> {
  // 1. Chuyển trạng thái sang 'loading' để màn hình hiển thị chữ "Đang tải..."
  setState({ status: 'loading' }, render);

  try {
    // 2. FEATURE 4: Chạy song song 2 luồng fetch dữ liệu cùng lúc cho nhanh
    const [productsData, categoriesData] = await Promise.all([
      getProducts(),
      getCategories()
    ]);

    // 3. Tải thành công -> Đổ dữ liệu vào state và ra lệnh cho ui.ts vẽ giao diện
    setState({
      status: 'success',
      products: productsData,
      filteredProducts: productsData, 
      categories: categoriesData,
      selectedProduct: null
    }, render);

  } catch (error) {
    // 4. Nếu mất mạng hoặc lỗi API -> Chuyển sang trạng thái lỗi
    const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi xảy ra từ máy chủ.';
    setState({
      status: 'error',
      message: errorMessage
    }, render);
  }
}

// Chạy hàm khởi tạo ngay khi trình duyệt đọc file main.ts
initApp();