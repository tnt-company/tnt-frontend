import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Carousel, Empty } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './ImagePreviewModal.css';
import { S3_BASE_URL } from '../constants';

const ImagePreviewModal = ({ visible, imageUrl, imageUrls = [], onClose, title }) => {
  // If imageUrl is provided (for backward compatibility), include it in the array
  const allImages = imageUrl
    ? Array.isArray(imageUrls)
      ? [imageUrl, ...imageUrls.filter(url => url !== imageUrl)]
      : [imageUrl]
    : Array.isArray(imageUrls)
      ? imageUrls
      : [];

  // Remove duplicates
  const uniqueImages = [...new Set(allImages.filter(url => url))];
  const hasImages = uniqueImages.length > 0;
  const isSingleImage = uniqueImages.length === 1;
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  // Reset to first slide when modal opens
  useEffect(() => {
    if (visible && carouselRef.current) {
      setCurrentSlide(0);
      carouselRef.current.goTo(0);
    }
  }, [visible]);

  // Function to get the full S3 URL
  const getFullImageUrl = useCallback(url => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${S3_BASE_URL}${url}`;
  }, []);

  // Handle next/prev navigation
  const goToNext = useCallback(() => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  }, []);

  const goToPrev = useCallback(() => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  }, []);

  const renderImageContent = useCallback(() => {
    if (!hasImages) {
      return <Empty description="No images available for this product" />;
    }

    if (isSingleImage) {
      return (
        <div className="single-image-container">
          <img
            src={getFullImageUrl(uniqueImages[0])}
            alt={title || 'Product Image'}
            className="preview-image"
          />
        </div>
      );
    }

    return (
      <div className="carousel-container">
        <Carousel dots afterChange={setCurrentSlide} ref={carouselRef}>
          {uniqueImages.map((img, index) => (
            <div key={index}>
              <div className="carousel-item">
                <img
                  src={getFullImageUrl(img)}
                  alt={`${title || 'Product'} - Image ${index + 1}`}
                  className="preview-image"
                />
              </div>
            </div>
          ))}
        </Carousel>

        {/* Custom Navigation Arrows */}
        <div className="custom-arrow prev-arrow" onClick={goToPrev}>
          <LeftOutlined />
        </div>
        <div className="custom-arrow next-arrow" onClick={goToNext}>
          <RightOutlined />
        </div>

        <div className="carousel-counter">
          {currentSlide + 1} / {uniqueImages.length}
        </div>
      </div>
    );
  }, [
    hasImages,
    isSingleImage,
    uniqueImages,
    title,
    getFullImageUrl,
    setCurrentSlide,
    currentSlide,
    goToPrev,
    goToNext,
  ]);

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      title={null}
      centered
      className="image-preview-modal"
      destroyOnClose={true}
      width="auto"
      zIndex={1500}
      maskClosable={true}
    >
      {renderImageContent()}
    </Modal>
  );
};

export default ImagePreviewModal;
