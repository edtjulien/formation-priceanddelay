import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  BrowserRouter as Router, Route, Routes
} from "react-router-dom";
import './App.css';
import Menu from './components/Menu';
import Header from './Header';
import Board from './views/Board';
import Prices from './views/Prices';

const queryClient = new QueryClient()

function App() {
  useEffect(() => {
    document.title = "Dashboard Getaround";
    var link = document.querySelector("link[rel~='icon']");
    link.href = 'https://www.getaround.com/favicon.ico';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <>
          <div className="app-container">
            <div id='menu-icon'><button id="menu-icon-link">|||</button></div>
            <section id="app-menu" className="app-menu">
              <Menu />
            </section>
            <div id="app-main" className="app-main">
              <header className="app-header">
                <Header />
              </header>
              <Routes>
                <Route path="/prices" element={<Prices />} />
                <Route path="/" element={<Board />} />
              </Routes>
            </div>
          </div>
        </>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
