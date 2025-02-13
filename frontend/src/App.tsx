import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Navbar from "./Layout/Navbar";
import Header from "./Layout/Header";
import { Fragment } from "react/jsx-runtime";
import Billings from "./components/Billings";
import Templates from "./components/Templates";
import NewInvoice from "./components/NewInvoice";

export function App() {
  const routes = [
    {
      path: "/",
      comp: <Dashboard />,
    },

    {
      path: "/billings",
      comp: <Billings />,
    },
    {
      path: "/template",
      comp: <Templates />,
    },
    {
      path: "/new-template",
      comp: <NewInvoice />,
    },
  ];
  return (
    <BrowserRouter>
      <div className="flex">
        <Navbar />

        <main className="bg-cbg flex-1 ml-64 overflow-y-auto h-screen">
          {/* <Header /> */}
          <Routes>
            {routes.map((route, i) => {
              return (
                <Fragment key={i}>
                  <Route path={route.path} element={route.comp} />
                </Fragment>
              );
            })}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
