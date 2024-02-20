import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductsFull.css';

function ProductsFull() {
  const { id, count } = useParams();
  const Id = id?.includes('id') ? +id?.match(/\d+/)[0] : '';
  const Page = count?.includes('page') ? +count?.split('=')[1] : 1;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); // Current page
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [currentItems, setCurrentItems] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [trueSearch, setTrueSearch] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visiblePageCount, setVisiblePageCount] = useState(3);
  const [totalPages, setTotalPages] = useState(15);

  useEffect(() => {
    fetchData(selectedCategory);
    fetchCategories();
    const newUrl = `/Products${selectedCategory ? '/c_id=' + selectedCategory : ''}/page=${page}`;
    window.history.pushState(null, '', newUrl);
  }, [page, id, count, selectedCategory]);

  useEffect(() => {
    setTrueSearch(false);
  }, [selectedCategory]);

  useEffect(() => {
    setPage(Page);
    setSelectedCategory(Id);
  }, [count, Id]);

  const fetchData = async (id) => {
    try {
      ///Category
      const response = await axios.get(`http://${process.env.API_HOST? process.env.API_HOST : "localhost" }:4001/Products/${id}`);
      setData(response.data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setError('Error fetching data from Products');
      setLoading(false);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    let visiblePages = [];
    if (totalPages <= visiblePageCount) {
      visiblePages = pages;
    } else {
      const halfVisibleCount = Math.floor(visiblePageCount / 2);
      const leftVisible = Math.min(page - 1, halfVisibleCount);
      const rightVisible = Math.min(totalPages - page, halfVisibleCount);
      console.log(leftVisible, rightVisible);
      const firstVisible = page - leftVisible;
      const lastVisible = page + rightVisible;

      visiblePages = pages.slice(firstVisible - 1, lastVisible);
    }

    return visiblePages.map((pageNumber) => (
      <li
        key={pageNumber}
        onClick={() => setPage(pageNumber)}
        style={{
          margin: '0 5px',
          cursor: 'pointer',
          color: pageNumber === page ? 'blue' : 'black',
        }}
      >
        {pageNumber}
      </li>
    ));
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`http://${process.env.API_HOST? process.env.API_HOST : "localhost" }:4001/Category`);
      setCategories(response.data);
    } catch (error) {
      console.error(error);
      setError('Error fetching category names');
    }
  };

  useEffect(() => {
    if (searchQuery === '') {
      setTrueSearch(false);
    } else {
      setTrueSearch(true);
    }
  }, [searchQuery]);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setPage(1);
      const response = await axios.get(`http://${process.env.API_HOST? process.env.API_HOST : "localhost" }:4001/search?query=${searchQuery}&page=${page}`);
      setSearchData(response.data);
      setTrueSearch(true);
      setLoading(false);
      if (response.data.length === 0) {
        setError('No results found');
      } else {
        setError('');
      }
      // Update the URL with the search query
      const newUrl = `/Products/search=${searchQuery}`;
      window.history.pushState(null, '', newUrl);
    } catch (error) {
      console.error(error);
      setError('Error fetching search results');
      setLoading(false);
    }
  };
  

  const handleCategoryChange = (event) => {
    const selectedCategoryID = +event.target.value;
    if (selectedCategoryID > 0) {
      setSelectedCategory(selectedCategoryID);
    } else {
      fetchData('');
      window.history.pushState(null, '', `/Products/page=1`);
    }
  };

  useEffect(() => {
    let startIndex = (page - 1) * itemsPerPage;
    let endIndex = page * itemsPerPage;
    if (trueSearch) {
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setCurrentItems(data.slice(startIndex, endIndex));
    } else {
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setCurrentItems(data.slice(startIndex, endIndex));
    }
  }, [data, trueSearch, page, itemsPerPage]);

  if (loading) return <div className="container">Loading Products data...</div>;
  if (error) return <div className="container">{error}</div>;

  return (
    <>
      <div className='navbar bg-dark text-white p-2'>
        <button onClick={() => navigate('/Category')} className="btn btn-dark">Home</button>
        <div className='dropdown-container'>
          <select onChange={(e) => handleCategoryChange(e)} className='filter-dropdown form-select-sm'>
            <option value=''>All Categories</option>
            {categories.map((category) => (
              <option key={category.CategoryID} value={category.CategoryID}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className='search-container'>
          <form onSubmit={handleSearch} className="form-inline">
            <input type='text' placeholder='Search...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-control-sm" />
            <button type="submit" className="btn btn-dark btn-sm">Search</button>
          </form>
        </div>
        <h1 className="m-0">Available Products</h1>
      </div>
      <div className='container'>
        {!trueSearch ? (
          <>
            <table className='table table-striped'>
              <thead>
                <tr>
                  <th>ProductID</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>MRP</th>
                  <th>discountPrice</th>
                  <th>createdDate</th>
                  <th>categoryID</th>
                  <th>categoryName</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, index) => (
                  <tr key={index}>
                    <td>{row.ProductID || row._source.ProductID}</td>
                    <td>{row.name || row._source.name}</td>
                    <td>{row.brand || row._source.brand}</td>
                    <td>{row.MRP || row._source.MRP}</td>
                    <td>{row.discountPrice || row._source.discountPrice}</td>
                    <td>{row.createdDate ? new Date(row.createdDate).toLocaleDateString() : row._source.createdDate}</td>
                    <td>{row.CatID || row._source.CatID}</td>
                    <td>{row.catName || row._source.catName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='pagination' style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1} className="btn btn-dark btn-sm">Prev</button>
              <span style={{ margin: "10px", overflow: "hidden" }}>
                {" "}
                <ul style={{ display: "flex", listStyle: "none", padding: 0 }}>
                  {page > Math.floor(visiblePageCount / 2) + 1 && (
                    <>
                      <li
                        onClick={() => setPage(1)}
                        style={{ margin: "0 5px", cursor: "pointer" }}
                      >
                        1
                      </li>
                      <li style={{ margin: "0 5px" }}>...</li>
                    </>
                  )}
                  {renderPageNumbers()}
                  {page < totalPages - Math.floor(visiblePageCount / 2) && (
                    <>
                      <li style={{ margin: "0 5px" }}>...</li>
                      <li
                        onClick={() => setPage(totalPages)}
                        style={{ margin: "0 5px", cursor: "pointer" }}
                      >
                        {totalPages}
                      </li>
                    </>
                  )}
                </ul>
              </span>{" "}
              <button onClick={() => setPage(Math.min(page + 1, Math.ceil(data.length / itemsPerPage)))} disabled={page === totalPages} className="btn btn-dark btn-sm">Next</button>
            </div>
          </>
        ) : (
          <>
            <table className='table table-striped'>
              <thead>
                <tr>
                  <th>ProductID</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>MRP</th>
                  <th>discountPrice</th>
                  <th>createdDate</th>
                  <th>categoryID</th>
                  <th>categoryName</th>
                </tr>
              </thead>
              <tbody>
                {searchData.map((row, index) => (
                  <tr key={index}>
                    <td>{row._source.ProductID}</td>
                    <td>{row._source.name}</td>
                    <td>{row._source.brand}</td>
                    <td>{row._source.MRP}</td>
                    <td>{row._source.discountPrice}</td>
                    <td>{row.createdDate ? new Date(row.createdDate).toLocaleDateString() : row._source.createdDate}</td>
                    <td>{row._source.CatID}</td>
                    <td>{row._source.catName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='pagination' style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1} className="btn btn-dark btn-sm">Prev</button>
              {Array.from({ length: Math.ceil(searchData.length / itemsPerPage) }, (_, index) => (
                <button key={index} onClick={() => setPage(index + 1)} className="btn btn-dark">{index + 1}</button>
              ))}
              <button onClick={() => setPage(Math.min(page + 1, Math.ceil(searchData.length / itemsPerPage)))} disabled={page === totalPages} className="btn btn-dark btn-sm">Next</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ProductsFull;
