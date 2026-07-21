import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: "12px", padding: "14px 16px", color: "#314252" },
          success: { iconTheme: { primary: "#16a34a", secondary: "#ffffff" } },
        }}
      />
    </>
  );
}

export default App;
