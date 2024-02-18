import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom'; 
import Category from './Category';
import ProductsFull from './ProductsFull';
import NotFound from './NotFound';

function App() {
  return (
    <div className='contain'>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Category />}></Route>
        <Route path='/Category' element={<Category />}></Route>
        <Route path="/search" element={<ProductsFull />} />
        <Route path='/Category/:count' element={<Category />}></Route>
        <Route path='/Products' element={<ProductsFull />}></Route>
        <Route path='/Products/:count' element={<ProductsFull />}></Route>
        <Route path='/Products/:id/:count' element={<ProductsFull />}></Route>
        <Route path='*' element={<NotFound />}></Route>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
