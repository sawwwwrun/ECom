import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Category.css';

function Category() {
  const { count } = useParams();
  const Page = count?.includes('page') ? +count?.split('=')[1] : 1;
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchProduct();
  }, [page]);

  useEffect(() => {
    setPage(Page);
  }, [count]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get('http://localhost:5000/Category');
      const { data } = response;
      const startIndex = (page - 1) * itemsPerPage;
      const slicedproduct = data.slice(startIndex, startIndex + itemsPerPage);
      setProduct(slicedproduct);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setLoading(false);
    } catch (error) {
      setError('Error fetching product from Category');
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    setPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setPage(prevPage => Math.max(prevPage - 1, 1));
  };

  if (loading) return <div className="container">Loading Table 1 product...</div>;
  if (error) return <div className="container">{error}</div>;

  return (
    <div className='container d-flex flex-column align-items-center'>
      <h1>Categories</h1>
      <div className='viewpro mb-3'>
        <Link to='/Products'>
          <button className="btn btn-dark">View Products</button>
        </Link>
      </div>
      <div className='container'>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>CatID</th>
              <th>Name</th>
              <th>Stock</th>
              <th>createdDate</th>
            </tr>
          </thead>
          <tbody>
            {product.map((row, index) => (
              <tr key={index}>
                <td>{row.CategoryID}</td>
                <td>
                  <Link className='link' to={`/Products/c_id=${row.CategoryID}/page=1`}>{row.name}</Link>
                </td>
                <td>{row.stock}</td>
                <td>{new Date(row.createdDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='pagination d-flex justify-content-center'>
        <button className="btn btn-dark mr-1 pagination-btn" onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setPage(index + 1)}
            className={page === index + 1 ? 'btn btn-dark mr-1 pagination-btn active' : 'btn btn-dark mr-1 pagination-btn'}
          >
            {index + 1}
          </button>
        ))}
        <button className="btn btn-dark pagination-btn" onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Category;
