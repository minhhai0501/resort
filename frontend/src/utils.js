export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || "Đã có lỗi xảy ra";
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
};

export const formatDateInput = (value) => {
  if (!value) return "";
  return String(value).split("T")[0];
};
