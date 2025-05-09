// Các hàm format dữ liệu
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

function getDefaultImage(type) {
  switch(type) {
    case 'avatar':
      return 'assets/images/default-avatar.png';
    case 'license':
      return 'assets/images/default-license.png';
    case 'vehicle':
      return 'assets/images/default-vehicle.png';
    default:
      return 'assets/images/image-not-found.png';
  }
}
