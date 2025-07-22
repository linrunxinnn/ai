import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Home from "../pages/Home.jsx";
import Sign from "../pages/Sign.jsx";
import Collect from "../pages/Collect.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Sign />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/collect",
        element: <Collect />,
      },
    ],
  },
]);
