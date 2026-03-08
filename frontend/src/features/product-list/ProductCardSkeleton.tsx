import './ProductCardSkeleton.css';

export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      {/* Image Skeleton */}
      <div className="skeleton-image" />
      
      <div className="skeleton-body">
        {/* Category */}
        <div className="skeleton-text skeleton-category" />
        
        {/* Title */}
        <div className="skeleton-text skeleton-title" />
        <div className="skeleton-text skeleton-title" style={{ width: '70%' }} />
        
        {/* Description */}
        <div className="skeleton-text" />
        <div className="skeleton-text" style={{ width: '80%' }} />
        
        {/* Spacer */}
        <div className="skeleton-spacer" />
        
        {/* Sizes */}
        <div className="skeleton-sizes">
          <div className="skeleton-tag" />
          <div className="skeleton-tag" />
          <div className="skeleton-tag" />
        </div>
        
        {/* Price and Button */}
        <div className="skeleton-footer">
          <div className="skeleton-price" />
          <div className="skeleton-button" />
        </div>
      </div>
    </div>
  );
}
