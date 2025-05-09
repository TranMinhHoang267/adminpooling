// JavaScript xử lý tài xế
$(document).ready(function() {
  console.log("Document ready - Loading drivers...");
  // Tải danh sách tài xế khi trang được tải
  loadDrivers();
  
  // Gắn sự kiện làm mới
  $('#refreshDriversBtn').on('click', function() {
      loadDrivers();
  });
  
  // Gắn sự kiện thêm tài xế mới
  $('#addDriverBtn').on('click', function() {
      alert("Tính năng đang được phát triển");
  });
  
  // Gắn sự kiện xác nhận từ chối
  $(document).on('click', '#confirmReject', function() {
      console.log("confirmReject clicked");
      const id = $('#rejectDriverId').val();
      const reason = $('#rejectionReason').val();
      
      console.log(`Reject confirmation - ID: ${id}, Reason: ${reason}`);
      
      if (!reason) {
          showAlert('danger', 'Vui lòng nhập lý do từ chối');
          return;
      }
      
      handleRejectDriver(id, reason);
  });
  
  // Gắn sự kiện tìm kiếm
  $('#searchDrivers').on('keyup', function() {
      const value = $(this).val().toLowerCase();
      $("#driversTableBody tr").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
  });
  
  // Gắn sự kiện lọc
  $('#applyFilterBtn').on('click', function() {
      const status = $('#statusFilter').val();
      console.log("Áp dụng lọc theo trạng thái:", status);
      
      if (!status) {
          // Nếu không chọn trạng thái, hiển thị tất cả
          $(".driver-row").show();
      } else {
          // Lọc theo trạng thái
          $(".driver-row").each(function() {
              const rowStatus = $(this).attr('data-status');
              console.log("Row status:", rowStatus, "Looking for:", status);
              
              if (rowStatus === status) {
                  $(this).show();
              } else {
                  $(this).hide();
              }
          });
      }
  });

  // Gắn sự kiện đặt lại lọc
  $('#resetFilterBtn').on('click', function() {
      console.log("Đặt lại bộ lọc");
      $('#statusFilter').val('');
      $('#searchDrivers').val('');
      $(".driver-row").show();
  });

  initializeEventHandlers();
});

// Hàm tải danh sách tài xế
function loadDrivers() {
  console.log("Calling loadDrivers function");
  $('#driversTableBody').html('<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div><p>Đang tải danh sách tài xế...</p></td></tr>');
  
  // Kiểm tra token
  const token = localStorage.getItem('token');
  console.log("Token exists:", !!token);
  
  // Gọi API lấy danh sách tài xế
  getDrivers()
      .done(function(response) {
          console.log("API success response:", response);
          
          if (response.success) {
              const drivers = response.data;
              renderDriversTable(drivers);
          } else {
              $('#driversTableBody').html('<tr><td colspan="6" class="text-center text-danger">Lỗi: ' + response.message + '</td></tr>');
          }
      })
      .fail(function(xhr, status, error) {
          console.error('API error:', status, error);
          console.error('Response:', xhr.responseText);
          $('#driversTableBody').html('<tr><td colspan="6" class="text-center text-danger">Lỗi khi tải dữ liệu. Vui lòng thử lại sau.</td></tr>');
      });
}

// Hiển thị danh sách tài xế lên bảng
function renderDriversTable(drivers) {
  if (!drivers || drivers.length === 0) {
      $('#driversTableBody').html('<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>');
      $('#driversPageInfo').text('Hiển thị 0 mục');
      return;
  }
  
  let html = '';
  drivers.forEach(driver => {
      let actionButtons = '';
      
      // Luôn hiển thị nút Chi tiết cho tất cả trạng thái
      actionButtons = `<button class="btn btn-sm btn-info view-driver" data-id="${driver.id}"><i class="fas fa-eye"></i> Chi tiết</button> `;
      
      if (driver.status === 'PENDING') {
          actionButtons += `
              <button class="btn btn-sm btn-success approve-driver" data-id="${driver.id}"><i class="fas fa-check"></i> Phê duyệt</button>
              <button class="btn btn-sm btn-danger reject-driver" data-id="${driver.id}"><i class="fas fa-times"></i> Từ chối</button>
          `;
      } else if (driver.status === 'APPROVED') {
          actionButtons += `
              <button class="btn btn-sm btn-danger delete-driver" data-id="${driver.id}"><i class="fas fa-trash"></i> Xóa</button>
          `;
      } else if (driver.status === 'REJECTED') {
          actionButtons += `
              <button class="btn btn-sm btn-success approve-driver" data-id="${driver.id}"><i class="fas fa-check"></i> Phê duyệt</button>
          `;
      }
      
      html += `
      <tr id="driver-${driver.id}" class="driver-row" data-status="${driver.status}">
          <td>${driver.id}</td>
          <td>${driver.fullName}</td>
          <td>${driver.email}</td>
          <td>${driver.phoneNumber}</td>
          <td class="status">${formatStatus(driver.status)}</td>
          <td class="action-buttons">${actionButtons}</td>
      </tr>
      `;
  });
  
  $('#driversTableBody').html(html);
  $('#driversPageInfo').text(`Hiển thị 1 đến ${drivers.length} của ${drivers.length} mục`);
  
  // Gắn sự kiện cho các nút
  $('.view-driver').on('click', function() {
      const driverId = $(this).data('id');
      handleViewDriver(driverId);
  });
  
  $('.approve-driver').on('click', function() {
      const driverId = $(this).data('id');
      handleApproveDriver(driverId);
  });
  
  $('.reject-driver').on('click', function() {
      const driverId = $(this).data('id');
      showRejectModal(driverId);
  });
  
  $('.delete-driver').on('click', function() {
      const driverId = $(this).data('id');
      handleDeleteDriver(driverId);
  });
}

// Xem chi tiết tài xế
function handleViewDriver(id) {
  // Hiển thị modal và thiết lập tiêu đề đang tải
  $('#driverDetailModalLabel').text('Đang tải thông tin tài xế...');
  $('#driverDetailModal').modal('show');
  
  // Hiển thị hiệu ứng loading cho thông tin cơ bản
  $('#driverId').html('<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="sr-only">Loading...</span></div>');
  $('#driverName').html('<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="sr-only">Loading...</span></div>');
  $('#driverEmail').html('<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="sr-only">Loading...</span></div>');
  $('#driverPhone').html('<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="sr-only">Loading...</span></div>');
  $('#driverStatus').html('<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="sr-only">Loading...</span></div>');
  
  // Hiển thị loading cho ảnh
  const loadingGif = 'https://i.gifer.com/ZKZx.gif'; // URL hình ảnh loading online
  $('#avatarImage').attr('src', loadingGif);
  $('#licenseImage').attr('src', loadingGif);
  $('#vehicleImage').attr('src', loadingGif);
  
  // Xử lý lỗi hình ảnh
  $('#avatarImage').on('error', function() {
      $(this).attr('src', 'https://via.placeholder.com/200x200.png?text=No+Avatar');
  });
  
  $('#licenseImage').on('error', function() {
      $(this).attr('src', 'https://via.placeholder.com/200x150.png?text=No+License+Image');
  });
  
  $('#vehicleImage').on('error', function() {
      $(this).attr('src', 'https://via.placeholder.com/200x150.png?text=No+Vehicle+Image');
  });
  
  // Gọi API để lấy thông tin chi tiết
  getDriverById(id)
      .done(function(response) {
          if (response.success) {
              const driver = response.data;
              console.log("Driver details:", driver);
              
              // Cập nhật tiêu đề modal
              $('#driverDetailModalLabel').text('Chi Tiết Tài Xế: ' + driver.fullName);
              
              // Cập nhật thông tin cơ bản
              $('#driverId').text(driver.id || 'N/A');
              $('#driverName').text(driver.fullName || 'N/A');
              $('#driverEmail').text(driver.email || 'N/A');
              $('#driverPhone').text(driver.phoneNumber || 'Không có');
              $('#driverStatus').html(formatStatus(driver.status || 'N/A'));
              
              // Cập nhật hình ảnh - Xử lý các trường ảnh khác nhau có thể có trong API
              const avatarSrc = driver.avatarUrl || driver.avatarImage || driver.avatar || '';
              const licenseSrc = driver.licenseUrl || driver.licenseImageUrl || driver.licenseImage || '';
              const vehicleSrc = driver.vehicleUrl || driver.vehicleImageUrl || driver.vehicleImage || '';
              
              if (avatarSrc) {
                  $('#avatarImage').attr('src', avatarSrc);
              } else {
                  $('#avatarImage').attr('src', 'https://via.placeholder.com/200x200.png?text=No+Avatar');
              }
              
              if (licenseSrc) {
                  $('#licenseImage').attr('src', licenseSrc);
              } else {
                  $('#licenseImage').attr('src', 'https://via.placeholder.com/200x150.png?text=No+License+Image');
              }
              
              if (vehicleSrc) {
                  $('#vehicleImage').attr('src', vehicleSrc);
              } else {
                  $('#vehicleImage').attr('src', 'https://via.placeholder.com/200x150.png?text=No+Vehicle+Image');
              }
          } else {
              alert('Không thể tải thông tin chi tiết: ' + response.message);
              $('#driverDetailModal').modal('hide');
          }
      })
      .fail(function(xhr, status, error) {
          console.error('Lỗi khi tải thông tin chi tiết:', error);
          alert('Đã xảy ra lỗi khi tải thông tin chi tiết. Vui lòng thử lại sau.');
          $('#driverDetailModal').modal('hide');
      });
}

// Xử lý phê duyệt tài xế
function handleApproveDriver(id) {
  if (!confirm('Bạn có chắc chắn muốn phê duyệt tài xế này?')) {
    return;
  }

  const $row = $(`#driver-${id}`);
  const $actionCell = $row.find('.action-buttons');
  const originalContent = $actionCell.html();
  
  $actionCell.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>');
  
  approveDriver(id)
    .then(() => {
      $row.find('.status').html(formatStatus('APPROVED'));
      $actionCell.html(`
        <button class="btn btn-sm btn-info view-driver" data-id="${id}"><i class="fas fa-eye"></i> Chi tiết</button>
        <button class="btn btn-sm btn-danger delete-driver" data-id="${id}">
          <i class="fas fa-trash"></i> Xóa
        </button>
      `);
      
      // Reattach event handlers
      $actionCell.find('.view-driver').on('click', function() {
        handleViewDriver($(this).data('id'));
      });
      
      $actionCell.find('.delete-driver').on('click', function() {
        handleDeleteDriver($(this).data('id'));
      });
      
      showAlert('success', 'Phê duyệt tài xế thành công!');
    })
    .catch(error => {
      $actionCell.html(originalContent);
      showAlert('danger', error.message);
      console.error('Error in approveDriver:', error);
    });
}

// Hiển thị modal từ chối
function showRejectModal(id) {
  $('#rejectDriverId').val(id);
  $('#rejectionReason').val('');
  $('#rejectModal').modal('show');
}

// Xử lý từ chối tài xế
function handleRejectDriver(id, reason) {
  console.log(`Handling reject for driver: ${id} with reason: ${reason}`);
  
  const $row = $(`#driver-${id}`);
  const $actionCell = $row.find('.action-buttons');
  const originalContent = $actionCell.html();
  const $modal = $('#rejectModal');
  const method = $('#rejectMethod').val();
  const customEndpoint = $('#customEndpoint').val();
  const isDebugMode = $('#debugMode').is(':checked');
  
  console.log(`Selected method: ${method}, Custom endpoint: ${customEndpoint || 'none'}, Debug mode: ${isDebugMode}`);
  
  // Hiển thị loading
  $actionCell.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>');
  
  // Hiển thị loading trong modal nếu nó vẫn đang mở
  $('#confirmReject').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...').prop('disabled', true);
  
  // Lưu trữ cài đặt AJAX toàn cục
  const originalAjaxSettings = $.ajaxSettings.complete;
  
  // Tạm thời vô hiệu hóa xử lý AJAX toàn cục cho 401/403
  $.ajaxSetup({
    complete: function() {} // Tạm thời bỏ qua xử lý complete
  });
  
  // Gọi API từ chối theo phương thức được chọn
  let rejectPromise;
  
  if (method === 'custom' && customEndpoint) {
    // Sử dụng endpoint tùy chỉnh
    console.log('Using custom endpoint:', customEndpoint);
    
    // Thêm query parameter rejectionReason nếu URL không có sẵn
    let url = customEndpoint;
    if (!url.includes('rejectionReason=')) {
      url += url.includes('?') ? '&' : '?';
      url += `rejectionReason=${encodeURIComponent(reason)}`;
    }
    console.log('Final custom URL:', url);
    
    rejectPromise = $.ajax({
      url: url,
      type: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  } else if (method === 'put') {
    // Sử dụng phương thức PUT với query parameter
    console.log('Using PUT method with query parameter');
    
    rejectPromise = $.ajax({
      url: `http://localhost:8080/api/admin/user/reject/${id}?rejectionReason=${encodeURIComponent(reason)}`,
      type: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  } else if (method === 'post') {
    // Sử dụng phương thức POST với query parameter
    console.log('Using POST method with query parameter');
    
    rejectPromise = $.ajax({
      url: `http://localhost:8080/api/admin/user/reject/${id}?rejectionReason=${encodeURIComponent(reason)}`,
      type: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      error: function(xhr, status, error) {
        if (isDebugMode) {
          console.log('XHR details:', xhr);
          
          // Hiển thị lỗi chi tiết trong modal
          const errorDetail = xhr.status + ' ' + xhr.statusText + (xhr.responseText ? ': ' + xhr.responseText : '');
          $('#rejectApiErrorMessage').text(errorDetail);
          $('#rejectApiError').show();
        }
      }
    });
  } else {
    // Phương thức auto - sử dụng API đã được khai báo
    console.log('Using auto method from API');
    rejectPromise = rejectDriver(id, reason);
  }
  
  // Xử lý kết quả
  rejectPromise
    .then(function(response) {
      console.log('Reject driver success:', response);
      
      // Khôi phục cài đặt AJAX toàn cục
      $.ajaxSetup({
        complete: originalAjaxSettings
      });
      
      $row.find('.status').html(formatStatus('REJECTED'));
      $actionCell.html(`
        <button class="btn btn-sm btn-info view-driver" data-id="${id}"><i class="fas fa-eye"></i> Chi tiết</button>
        <button class="btn btn-sm btn-success approve-driver" data-id="${id}">
          <i class="fas fa-check"></i> Phê duyệt
        </button>
      `);
      
      // Gắn lại event handlers
      $actionCell.find('.view-driver').on('click', function() {
        handleViewDriver($(this).data('id'));
      });
      
      $actionCell.find('.approve-driver').on('click', function() {
        handleApproveDriver($(this).data('id'));
      });
      
      // Đặt lại nút submit
      $('#confirmReject').html('Xác nhận từ chối').prop('disabled', false);
      
      $modal.modal('hide');
      showAlert('success', 'Từ chối tài xế thành công!');
    })
    .catch(function(error) {
      console.error('Error in rejectDriver:', error);
      
      // Khôi phục cài đặt AJAX toàn cục
      $.ajaxSetup({
        complete: originalAjaxSettings
      });
      
      // Đặt lại nút submit
      $('#confirmReject').html('Xác nhận từ chối').prop('disabled', false);
      
      // Hiển thị lỗi chi tiết trong modal nếu đang ở chế độ debug
      if (isDebugMode) {
        $('#rejectApiErrorMessage').text(error.message || 'Unknown error');
        $('#rejectApiError').show();
      }
      
      // Kiểm tra nếu lỗi xác thực
      if (error && error.message && error.message.includes('Phiên làm việc đã hết hạn')) {
        showAlert('warning', 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại sau 3 giây...');
        
        // Khôi phục UI
        $actionCell.html(originalContent);
        
        // Nếu không ở chế độ debug, đóng modal
        if (!isDebugMode) {
          $modal.modal('hide');
        }
        
        // Chuyển hướng sau 3 giây
        setTimeout(function() {
          window.location.href = 'login.html';
        }, 3000);
      } else {
        // Xử lý các lỗi khác
        $actionCell.html(originalContent);
        
        // Hiển thị thông báo lỗi
        showAlert('danger', error && error.message ? error.message : 'Đã xảy ra lỗi khi từ chối tài xế');
        
        // Nếu không ở chế độ debug, đóng modal
        if (!isDebugMode) {
          $modal.modal('hide');
        }
      }
    });
}

// Xử lý xóa tài xế
function handleDeleteDriver(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa tài xế này?')) {
    return;
  }

  const $row = $(`#driver-${id}`);
  const $actionCell = $row.find('.action-buttons');
  const originalContent = $actionCell.html();
  
  $actionCell.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>');
  
  deleteDriver(id)
    .then(() => {
      $row.fadeOut(400, function() {
        $(this).remove();
      });
      showAlert('success', 'Xóa tài xế thành công!');
    })
    .catch(error => {
      console.error('Error in deleteDriver:', error);
      $actionCell.html(originalContent);
      showAlert('danger', error.message);
    });
}

// Hàm format trạng thái tài xế
function formatStatus(status) {
  switch(status) {
      case 'APPROVED':
          return '<span class="badge badge-success">Đã phê duyệt</span>';
      case 'REJECTED':
          return '<span class="badge badge-danger">Từ chối</span>';
      case 'PENDING':
          return '<span class="badge badge-warning">Đang chờ</span>';
      default:
          return '<span class="badge badge-secondary">Không xác định</span>';
  }
}

// Hàm hiển thị thông báo
function showAlert(type, message) {
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  $('#alertContainer').append(alertHtml);
  
  // Auto close after 5 seconds
  setTimeout(() => {
    $('.alert').alert('close');
  }, 5000);
}

// Khởi tạo event handlers
function initializeEventHandlers() {
  // Approve driver
  $(document).on('click', '.approve-driver', function() {
    handleApproveDriver($(this).data('id'));
  });

  // Reject driver
  $(document).on('click', '.reject-driver', function() {
    const driverId = $(this).data('id');
    showRejectModal(driverId);
  });

  // Delete driver
  $(document).on('click', '.delete-driver', function() {
    handleDeleteDriver($(this).data('id'));
  });
  
  // View driver
  $(document).on('click', '.view-driver', function() {
    handleViewDriver($(this).data('id'));
  });
}