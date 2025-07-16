import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addCart } from '../redux/action';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Products = () => {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState(data);

    const [loading, setLoading] = useState(false);
    const [aiSearchLoading, setAiSearchLoading] = useState(false);
    const [showNoResultsModal, setShowNoResultsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const componentMounted = useRef(true);

    const dispatch = useDispatch();

    const addProduct = (product) => {
        dispatch(addCart(product));
    };

    useEffect(() => {
        const getProducts = async () => {
            setLoading(true);
            const response = await fetch('https://fakestoreapi.com/products/');
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

    const AILoadingModal = () => {
        if (!aiSearchLoading) return null;

        return (
            <div
                className="modal fade show d-block"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body text-center py-4">
                            <div className="mb-3">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                    style={{ width: '3rem', height: '3rem' }}
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                            </div>
                            <h5 className="mb-3">
                                <i className="fas fa-brain text-info me-2"></i>
                                AI is analyzing your search...
                            </h5>
                            <p className="text-muted mb-0">
                                Our AI is finding the best products for you.
                                This may take a few seconds.
                            </p>
                            <div className="mt-3">
                                <div
                                    className="progress"
                                    style={{ height: '4px' }}
                                >
                                    <div
                                        className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                                        style={{ width: '100%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const NoResultsModal = () => {
        if (!showNoResultsModal) return null;

        return (
            <div
                className="modal fade show d-block"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowNoResultsModal(false)}
                            ></button>
                        </div>
                        <div className="modal-body text-center py-4">
                            <div className="mb-3">
                                <i
                                    className="fas fa-search text-muted"
                                    style={{ fontSize: '3rem' }}
                                ></i>
                            </div>
                            <h5 className="mb-3 text-dark">
                                <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                No Products Found
                            </h5>
                            <p className="text-muted mb-4">
                                Sorry, we couldn't find any products that match
                                your search criteria.
                                <br />
                                <strong>"{searchTerm}"</strong>
                            </p>
                            <div className="mb-3">
                                <p className="text-muted small mb-2">
                                    <i className="fas fa-lightbulb text-warning me-1"></i>
                                    Try these suggestions:
                                </p>
                                <ul className="text-muted small text-start d-inline-block">
                                    <li>Use different keywords</li>
                                    <li>Check your spelling</li>
                                    <li>Try more general terms</li>
                                    <li>Browse our categories instead</li>
                                </ul>
                            </div>
                            <div className="d-flex gap-2 justify-content-center">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowNoResultsModal(false);
                                        setSearchTerm('');
                                        setFilter(data);
                                    }}
                                >
                                    <i className="fas fa-th-large me-2"></i>
                                    Show All Products
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowNoResultsModal(false)}
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleAISearch = useCallback(
        async (searchText) => {
            if (searchText.trim() === '') {
                setFilter(data);
                return;
            }

            // Check if AI is available for advanced search
            if (searchText.length > 5) {
                setAiSearchLoading(true); // Start loading
                try {
                    // request to /api/v1/ai/filter to get AI filtered products
                    const response = await fetch(
                        'http://localhost:4000/api/v1/ai/filter',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                searchTerm: searchText,
                                data: data,
                            }),
                        }
                    );

                    const result = await response.json();
                    if (result.success) {
                        if (result.data && result.data.length > 0) {
                            setFilter(result.data);
                            toast.success('AI search completed successfully!');
                        } else {
                            // No results found
                            setFilter([]);
                            setShowNoResultsModal(true);
                        }
                    } else {
                        toast.error('AI search failed: ' + result.error);
                    }
                } catch (error) {
                    console.error(
                        'AI search failed, falling back to basic search:',
                        error
                    );
                    toast.error('AI search failed. Please try again.');
                } finally {
                    setAiSearchLoading(false); // Stop loading
                }
            } else {
                // Show error dialog if AI is not available
                toast.error(
                    'AI search requires at least 6 characters. Please try a different search term.'
                );
                return;
            }
        },
        [data]
    );

    const handleKeyPress = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                handleAISearch(searchTerm);
            }
        },
        [searchTerm, handleAISearch]
    );

    const handleInputChange = useCallback(
        (e) => {
            const value = e.target.value;
            setSearchTerm(value);

            if (value.trim() === '') {
                setFilter(data);
            }
        },
        [data]
    );

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
                            <div
                                className="card text-center h-100"
                                key={product.id}
                            >
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
                                        {product.description.substring(0, 90)}
                                        ...
                                    </p>
                                </div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item lead">
                                        $ {product.price}
                                    </li>
                                    {/* <li className="list-group-item">Dapibus ac facilisis in</li>
                    <li className="list-group-item">Vestibulum at eros</li> */}
                                </ul>
                                <div className="card-body">
                                    <Link
                                        to={'/product/' + product.id}
                                        className="btn btn-dark m-1"
                                    >
                                        Buy Now
                                    </Link>
                                    <button
                                        className="btn btn-dark m-1"
                                        onClick={() => {
                                            toast.success('Added to cart');
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
            <AILoadingModal />
            <NoResultsModal />
            <div className="container my-3 py-3">
                <div className="row">
                    <div className="col-12">
                        <h2 className="display-5 text-center">
                            Latest Products
                        </h2>
                        <hr />
                    </div>
                </div>
                <div className="text-center py-4">
                    <div className="mb-3">
                        <h5 className="text-muted mb-2">
                            <i className="fas fa-robot me-2"></i>
                            AI-Powered Product Assistant
                        </h5>
                        <p className="text-muted small mb-3">
                            Type and press Enter for AI-powered smart search!
                        </p>
                    </div>
                    <div className="position-relative d-inline-block w-50">
                        <input
                            type="text"
                            className="form-control form-control-lg border-primary shadow-sm"
                            placeholder="💬 Ask AI: 'Find me a comfortable laptop for work' or just search... (Press Enter for AI)"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onKeyUp={handleKeyPress}
                            disabled={aiSearchLoading}
                            style={{
                                borderRadius: '25px',
                                paddingLeft: '50px',
                                paddingRight: '50px',
                                fontSize: '16px',
                                background:
                                    'linear-gradient(145deg, #f8f9fa, #ffffff)',
                                border: '2px solid #007bff',
                                opacity: aiSearchLoading ? 0.7 : 1,
                            }}
                        />
                        <i
                            className={`fas fa-search position-absolute text-primary`}
                            style={{
                                left: '18px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '18px',
                            }}
                        ></i>
                        {aiSearchLoading ? (
                            <div
                                className="spinner-border spinner-border-sm position-absolute text-info"
                                style={{
                                    right: '18px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '18px',
                                    height: '18px',
                                }}
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>
                        ) : (
                            <i
                                className={`fas fa-brain position-absolute text-info`}
                                style={{
                                    right: '18px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '18px',
                                }}
                            ></i>
                        )}
                    </div>
                    <div className="mt-2">
                        <small className="text-muted">
                            <i className="fas fa-magic me-1"></i>
                            Powered by AI • Natural language search • Smart
                            recommendations
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
