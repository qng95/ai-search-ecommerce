import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import webllmService from "../services/webllmService";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(data);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState({ isLoading: false, isLoaded: false });

  const componentMounted = useRef(true);

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
  };

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const response = await fetch("https://fakestoreapi.com/products/");
      if (componentMounted.current) {
        setData(await response.clone().json());
        setFilter(await response.json());
        setLoading(false);
      }
    };

    getProducts();

    // Cleanup function - runs when component unmounts
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Initialize WebLLM when component mounts
  useEffect(() => {
    const initializeAI = async () => {
      setAiStatus({ isLoading: true, isLoaded: false });
      try {
        await webllmService.initializeEngine();
        setAiStatus({ isLoading: false, isLoaded: true });
      } catch (error) {
        console.error("Failed to initialize AI:", error);
        setAiStatus({ isLoading: false, isLoaded: false });
      }
    };

    initializeAI();
  }, []);

  const Loading = () => {
    return (
      <>
        <div className="col-12 py-5 text-center">
          <Skeleton height={40} width={560} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      </>
    );
  };

  const handleAISearch = useCallback(async (searchText) => {
    if (searchText.trim() === "") {
      setFilter(data);
      return;
    }

    // Check if AI is available for advanced search
    if (aiStatus.isLoaded && searchText.length > 3) {
      setAiLoading(true);
      try {
        const filteredProducts = await webllmService.filterProducts(searchText, data);
        setFilter(filteredProducts);
      } catch (error) {
        console.error("AI search failed, falling back to basic search:", error);
        // Fallback to basic search
        const filteredData = data.filter((item) =>
          item.title.toLowerCase().includes(searchText.toLowerCase()) ||
          item.description.toLowerCase().includes(searchText.toLowerCase()) ||
          item.category.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilter(filteredData);
      } finally {
        setAiLoading(false);
      }
    } else {
      // Basic search for short queries or when AI is not available
      const filteredData = data.filter((item) =>
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilter(filteredData);
    }
  }, [data, aiStatus.isLoaded]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAISearch(searchTerm);
    }
  }, [searchTerm, handleAISearch]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Only do basic filtering while typing (no AI)
    if (value.trim() === "") {
      setFilter(data);
    } else {
      // Basic text search while typing
      const filteredData = data.filter((item) =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase()) ||
        item.category.toLowerCase().includes(value.toLowerCase())
      );
      setFilter(filteredData);
    }
  }, [data]);

  const ShowProducts = () => {
    return (
      <>
        {filter.map((product) => {
          return (
            <div
              id={product.id}
              key={product.id}
              className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4"
            >
              <div className="card text-center h-100" key={product.id}>
                <img
                  className="card-img-top p-3"
                  src={product.image}
                  alt="Card"
                  height={300}
                />
                <div className="card-body">
                  <h5 className="card-title">
                    {product.title.substring(0, 12)}...
                  </h5>
                  <p className="card-text">
                    {product.description.substring(0, 90)}...
                  </p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item lead">$ {product.price}</li>
                  {/* <li className="list-group-item">Dapibus ac facilisis in</li>
                    <li className="list-group-item">Vestibulum at eros</li> */}
                </ul>
                <div className="card-body">
                  <Link
                    to={"/product/" + product.id}
                    className="btn btn-dark m-1"
                  >
                    Buy Now
                  </Link>
                  <button
                    className="btn btn-dark m-1"
                    onClick={() => {
                      toast.success("Added to cart");
                      addProduct(product);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      <div className="container my-3 py-3">
        <div className="row">
          <div className="col-12">
            <h2 className="display-5 text-center">Latest Products</h2>
            <hr />
          </div>
        </div>
        <div className="text-center py-4">
          <div className="mb-3">
            <h5 className="text-muted mb-2">
              <i className="fas fa-robot me-2"></i>
              AI-Powered Product Assistant
              {aiStatus.isLoading && (
                <span className="ms-2">
                  <small className="text-info">
                    <i className="fas fa-spinner fa-spin"></i> Initializing AI...
                  </small>
                </span>
              )}
            </h5>
            <p className="text-muted small mb-3">
              {aiStatus.isLoaded 
                ? "Type to search instantly, or press Enter for AI-powered smart search!"
                : "Type to search... AI is loading for advanced features!"
              }
            </p>
          </div>
          <div className="position-relative d-inline-block w-50">
            <input
              type="text"
              className="form-control form-control-lg border-primary shadow-sm"
              placeholder={aiStatus.isLoaded 
                ? "💬 Ask AI: 'Find me a comfortable laptop for work' or just search... (Press Enter for AI)"
                : "🔍 Search products... (Press Enter to search)"
              }
              value={searchTerm}
              onChange={handleInputChange}
              onKeyUp={handleKeyPress}
              disabled={aiLoading}
              style={{
                borderRadius: '25px',
                paddingLeft: '50px',
                paddingRight: '50px',
                fontSize: '16px',
                background: aiLoading 
                  ? 'linear-gradient(145deg, #e9ecef, #f8f9fa)'
                  : 'linear-gradient(145deg, #f8f9fa, #ffffff)',
                border: '2px solid #007bff',
                opacity: aiLoading ? 0.7 : 1
              }}
            />
            <i 
              className={`fas ${aiLoading ? 'fa-spinner fa-spin' : 'fa-search'} position-absolute text-primary`}
              style={{
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px'
              }}
            ></i>
            <i 
              className={`fas ${aiStatus.isLoaded ? 'fa-brain' : 'fa-cog'} position-absolute text-info`}
              style={{
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px'
              }}
            ></i>
          </div>
          <div className="mt-2">
            <small className="text-muted">
              <i className="fas fa-magic me-1"></i>
              {aiStatus.isLoaded 
                ? "Powered by AI • Natural language search • Smart recommendations"
                : "AI is loading... Basic search available"
              }
            </small>
          </div>
        </div>
        <div className="row justify-content-center">
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>
    </>
  );
};

export default Products;
