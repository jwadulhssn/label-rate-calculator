import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context";
import Layout from "./components/Layout";
import Calculator from "./pages/Calculator";
import Customers from "./pages/Customers";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/customers" element={<Customers />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
