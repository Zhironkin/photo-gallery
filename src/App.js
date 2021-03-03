import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Home from './pages/home';
import Album from './pages/album';

const App = () => {
  return (
    <Router>
      <div id="App-customer">
        <Switch>
          <Route path="/album/:id" component={Album}></Route>
          <Route path="/" component={Home}></Route>
        </Switch>
        <div className="author">Zhironkin N.</div>
      </div>
    </Router>
  )
}

export default App;
