// API liên quan đến tài xế
function getDrivers() {
  console.log("API call: getDrivers - starting...");
  const token = localStorage.getItem('token');
  console.log("Token used for API:", token ? "Token exists" : "No token");
  
  return $.ajax({
    url: 'http://localhost:8080/api/admin/user/role?role=DRIVER',
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    beforeSend: function() {
      console.log("API call: getDrivers - sending request to server");
    },
    success: function(response) {
      console.log("API call: getDrivers - received response", response);
    },
    error: function(xhr, status, error) {
      console.error("API call: getDrivers - error occurred", status, error);
      console.error("Response:", xhr.responseText);
    }
  });
}

function getDriverById(id) {
  console.log(`API call: getDriverById(${id}) - starting...`);
  const token = localStorage.getItem('token');
  
  return $.ajax({
    url: `http://localhost:8080/api/admin/user/${id}`,
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    beforeSend: function() {
      console.log(`API call: getDriverById(${id}) - sending request`);
    },
    success: function(response) {
      console.log(`API call: getDriverById(${id}) - response received:`, response);
      // Log các trường dữ liệu liên quan đến ảnh
      if (response.success && response.data) {
        console.log("Driver image fields:", {
          avatarImage: response.data.avatarImage,
          licenseImageUrl: response.data.licenseImageUrl,
          vehicleImageUrl: response.data.vehicleImageUrl
        });
      }
    },
    error: function(xhr, status, error) {
      console.error(`API call: getDriverById(${id}) - error:`, status, error);
    }
  });
}

function approveDriver(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('Vui lòng đăng nhập lại'));
  }
  
  return $.ajax({
    url: `http://localhost:8080/api/admin/user/approved/${id}`,
    type: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: function(response) {
      console.log('Driver approved successfully:', response);
      return response;
    },
    error: function(xhr, status, error) {
      console.error('Error approving driver:', error);
      console.error('Status:', status);
      
      if (xhr.status === 401 || xhr.status === 403) {
        return Promise.reject(new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'));
      }
      
      return Promise.reject(new Error(xhr.responseJSON?.message || 'Không thể phê duyệt tài xế. Vui lòng thử lại.'));
    }
  });
}

function rejectDriver(id, reason) {
  console.log(`API rejectDriver called for id:${id} with reason:"${reason}"`);
  
  if (!reason) {
    console.error('Reject reason missing');
    return $.Deferred().reject(new Error('Vui lòng nhập lý do từ chối')).promise();
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token missing when calling rejectDriver');
    return $.Deferred().reject(new Error('Vui lòng đăng nhập lại')).promise();
  }
  
  // Log chi tiết token để debug
  const tokenPreview = token.substring(0, 10) + '...';
  console.log('Token preview:', tokenPreview);
  
  console.log('Gửi request từ chối tài xế với query parameter');
  console.log('URL:', `http://localhost:8080/api/admin/user/reject/${id}?rejectionReason=${encodeURIComponent(reason)}`);
  
  // Sử dụng query parameter thay vì JSON body
  return $.ajax({
    url: `http://localhost:8080/api/admin/user/reject/${id}?rejectionReason=${encodeURIComponent(reason)}`,
    type: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    beforeSend: function(xhr) {
      console.log('rejectDriver POST with query parameter: Request about to be sent');
    }
  })
  .done(function(response) {
    console.log('Driver rejected successfully:', response);
  })
  .fail(function(xhr, status, error) {
    console.error('Error rejecting driver - Status:', xhr.status);
    console.error('Error rejecting driver - Response:', xhr.responseText);
    console.error('Error rejecting driver - Error:', error);
    console.error('Error rejecting driver - Status text:', xhr.statusText);
    
    let errorMessage = 'Không thể từ chối tài xế. Vui lòng thử lại sau.';
    
    if (xhr.status === 401 || xhr.status === 403) {
      console.warn('Authentication error in rejectDriver');
      errorMessage = 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
    } else {
      try {
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        } else if (xhr.responseText && xhr.responseText.trim() !== '') {
          const response = JSON.parse(xhr.responseText);
          if (response.message) {
            errorMessage = response.message;
          }
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    }
    
    return $.Deferred().reject(new Error(errorMessage)).promise();
  });
}

function deleteDriver(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('Vui lòng đăng nhập lại'));
  }
  
  return $.ajax({
    url: `http://localhost:8080/api/admin/user/delete/${id}`,
    type: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: function(response) {
      console.log('Driver deleted successfully:', response);
      return response;
    },
    error: function(xhr, status, error) {
      console.error('Error deleting driver:', error);
      console.error('Status:', status);
      
      if (xhr.status === 401 || xhr.status === 403) {
        return Promise.reject(new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'));
      }
      
      return Promise.reject(new Error(xhr.responseJSON?.message || 'Không thể xóa tài xế. Vui lòng thử lại.'));
    }
  });
}

function getPendingDrivers() {
    return getDrivers().then(function(response) {
        if (response && response.success && Array.isArray(response.data)) {
            // Lọc ra các tài xế có trạng thái PENDING
            return response.data.filter(driver => driver.status === 'PENDING');
        }
        return [];
    });
}
