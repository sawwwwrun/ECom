import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Products.css';
 
function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();
  const {id} = useParams();

  useEffect(() => {
    fetchData();
  }, [id, page]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/Products/${id}`);
      const {data} = response;
      const startIndex = (page - 1) * itemsPerPage;
      const slicedData = data.slice(startIndex, startIndex+itemsPerPage);
      setData(slicedData);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setLoading(false);
      // setPage(Page);
    } catch (error) {
    console.log(error)
      setError('Error fetching data from Products');
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    setPage(prevPage => {
      const nextPage = Math.min(prevPage + 1, totalPages);
      window.history.pushState(null, "",`/Products/${id}/page=${nextPage}`);
      return nextPage;
    });
  };

  const handlePrevPage = () => {
    setPage(prevPage => {
      const prevPageNum = Math.max(prevPage - 1, 1);
      window.history.pushState(null,"",`/Products/${id}/page=${prevPageNum}`);
      return prevPageNum;
    });
  };

  const hStyle = {
    fontFamily: 'Georgia',
    textAlign: 'center'
  }

  if (loading) return <div>Loading Products data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <h1 style={hStyle}>Products related to this category</h1>
    <div className='button-container'>
            <button onClick={() => navigate('/Category')}>Home</button>
        </div>
    <div className='container'>
      <table className='table-container'>
        <thead>
            <tr>
                <th>ProductID</th>
                <th>Name</th>
                <th>Brand</th>
                <th>MRP</th>
                <th>discountPrice</th>
                <th>createdDate</th>
                <th>categoryID</th>
            </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.ProductID}</td> 
              <td>{row.name}</td>
              <td>{row.brand}</td>
              <td>{row.MRP}</td>
              <td>{row.discountPrice}</td>
              <td>{row.createdDate}</td>
              <td>{row.CatID}</td> 
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className='pagination'>
        <button onClick={() => handlePrevPage()} disabled={page === 1}>
          backward
        </button>
        <span style={{fontFamily: 'Georgia'}}>Page {page} of {totalPages}</span>
        <button onClick={() => handleNextPage()} disabled={page === totalPages}>
          forward
        </button>
      </div>
    </>
  );
}

export default Products;