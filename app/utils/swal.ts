// app/utils/swal.ts
import Swal from "sweetalert2";

const MySwal = Swal.mixin({
  confirmButtonColor: "#d32f2f",
  cancelButtonColor: "#6b7280",
  buttonsStyling: true,
  customClass: {
    confirmButton: 'swal-confirm-button',
    cancelButton: 'swal-cancel-button',
    popup: 'swal-popup',
  },
});

// Add this to ensure buttons are visible
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .swal-confirm-button {
      background-color: #d32f2f !important;
      color: white !important;
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 9999 !important;
    }
    .swal-cancel-button {
      background-color: #6b7280 !important;
      color: white !important;
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 9999 !important;
    }
    .swal-popup {
      z-index: 9998 !important;
    }
  `;
  document.head.appendChild(style);
}

export default MySwal;