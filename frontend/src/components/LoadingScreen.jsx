export default function LoadingScreen({ message = "Đang tải dữ liệu..." }) {
  return (
    <div className="fullscreen-center">
      <div className="loading-card">
        <div className="spinner" />
        <p>{message}</p>
      </div>
    </div>
  );
}
