import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './components/App.jsx';
import Navbar from './components/Navbar.jsx';
import AddFriends from './components/createMeal/AddFriends.jsx';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {path:"/", element:<App/>},
  {path:"/addfriends", element:<AddFriends />},
  // {path:"/signup", element:<SignUp />},
  //{path:"/login", element:<LogIn />},
  {path:"/dashboard", element:<Navbar />}
])

createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)