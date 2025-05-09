// API liên quan đến khách hàng
function getCustomers() {
  console.log("API call: getCustomers - starting...");
  const token = localStorage.getItem('token');
  console.log("Token used for API:", token ? "Token exists" : "No token");
  
  return $.ajax({
    url: 'http://localhost:8080/api/admin/user/role?role=PASSENGER',
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    beforeSend: function() {
      console.log("API call: getCustomers - sending request to server");
    },
    success: function(response) {
      console.log("API call: getCustomers - received response", response);
    },
    error: function(xhr, status, error) {
      console.error("API call: getCustomers - error occurred", status, error);
      console.error("Response:", xhr.responseText);
    }
  });
}

function getCustomerById(id) {
  console.log(`API call: getCustomerById(${id}) - starting...`);
  const token = localStorage.getItem('token');
  
  return $.ajax({
    url: `http://localhost:8080/api/admin/user/${id}`,
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    beforeSend: function() {
      console.log(`API call: getCustomerById(${id}) - sending request`);
    },
    success: function(response) {
      console.log(`API call: getCustomerById(${id}) - response received:`, response);
    },
    error: function(xhr, status, error) {
      console.error(`API call: getCustomerById(${id}) - error:`, status, error);
    }
  });
}

function approveCustomer(id) {
  return $.ajax({
    url: `http://localhost:8080/api/admin/user/approved/${id}`,
    type: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
}

function rejectCustomer(id, reason) {
  return $.ajax({
    url: `http://localhost:8080/api/admin/user/reject/${id}?rejectionReason=${encodeURIComponent(reason)}`,
    type: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
}

function deleteCustomer(id) {
  return $.ajax({
    url: `http://localhost:8080/api/admin/user/delete/${id}`,
    type: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
} 