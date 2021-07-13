import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import Register from "./routes/Register";
import Login from "./routes/Login";
import NotFound from "./routes/NotFound";

import './App.css';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();
function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:roomID" component={Room} />
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/login" component={Login} />
        <Route path="*"><NotFound /></Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
