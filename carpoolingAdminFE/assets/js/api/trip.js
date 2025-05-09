// API liên quan đến chuyến đi

function getAvailableRides() {
  console.log("API call: getAvailableRides - starting...");
  const token = localStorage.getItem('token');
  
  return $.ajax({
    url: 'http://localhost:8080/api/ride/available',
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    beforeSend: function() {
      console.log("API call: getAvailableRides - sending request to server");
    },
    success: function(response) {
      console.log("API call: getAvailableRides - received response", response);
      return response;
    },
    error: function(xhr, status, error) {
      console.error("API call: getAvailableRides - error occurred", status, error);
      console.error("Response:", xhr.responseText);
      return null;
    }
  });
}

function countActiveTrips() {
  return getAvailableRides()
    .then(function(response) {
      if (response && response.success && Array.isArray(response.data)) {
        return response.data.length;
      }
      return 0;
    })
    .catch(function(error) {
      console.error("Error counting active trips:", error);
      return 0;
    });
}


