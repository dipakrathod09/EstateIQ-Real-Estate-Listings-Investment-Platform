import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Maximize2, Heart } from 'lucide-react';
import { Badge } from './Badge';
import { toggleFavorite } from '../../api/listings';

export const PropertyCard = ({ property, listingId, isFavoritedInitial = false, onToggleFavorite }) => {
  const {
    id = '1',
    title = '3 BHK Modern Apartment',
    locality = 'Bodakdev',
    city = 'Ahmedabad',
    price = 8500000,
    bhk = 3,
    area_sqft = 1850,
    listing_type = 'buy',
    is_verified = true,
    rera_number,
    deal_tag,
    primary_image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
  } = property || {};

  const targetDetailId = listingId || property?.listing_id || property?.id || id;

  const [isFavorited, setIsFavorited] = useState(isFavoritedInitial);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavLoading(true);

    const newFavState = !isFavorited;
    setIsFavorited(newFavState);

    toggleFavorite(id)
      .then(() => {
        setFavLoading(false);
        if (onToggleFavorite) onToggleFavorite(id, newFavState);
      })
      .catch(() => {
        // Fallback optimistic toggle
        setFavLoading(false);
        if (onToggleFavorite) onToggleFavorite(id, newFavState);
      });
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  // Compute ML deal tag if not explicitly supplied
  const cityBasePsf = {
    Mumbai: 24000,
    'Delhi NCR': 13000,
    Bengaluru: 10000,
    Pune: 8500,
    Ahmedabad: 6500,
  };
  const basePsf = cityBasePsf[city] || 6500;
  const estimatedValuation = area_sqft * basePsf + bhk * 250000;
  const priceRatio = price / estimatedValuation;

  const computedDealTag = deal_tag || (priceRatio <= 0.90 ? 'Good Deal' : priceRatio >= 1.12 ? 'Overpriced' : 'Fair Price');

  return (
    <div className="group bg-white rounded-lg border border-surface-variant shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative folded-corner">
      {/* Property Image Container */}
      <div className="relative h-48 w-full bg-surface-container overflow-hidden">
        <img
          src={primary_image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pr-12">
          <span className="px-2.5 py-1 rounded bg-ink-navy/90 text-soft-ivory text-xs font-label-caps uppercase">
            For {listing_type === 'rent' ? 'Rent' : 'Sale'}
          </span>
          {(is_verified || rera_number) && <Badge variant="verified" />}
          <Badge variant="deal" dealTag={computedDealTag} />
        </div>

        {/* Heart Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={favLoading}
          aria-label="Save Favorite"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md text-ink-navy transition-all cursor-pointer hover:scale-110 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-alert-coral text-alert-coral' : 'text-slate-grey hover:text-alert-coral'
            }`}
          />
        </button>
      </div>

      {/* Property Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy line-clamp-1 group-hover:text-warm-brass transition-colors">
              {title}
            </h3>
          </div>
          <div className="flex items-center space-x-1 text-slate-grey text-xs mt-1">
            <MapPin className="w-3.5 h-3.5 text-warm-brass shrink-0" />
            <span className="line-clamp-1">{locality}, {city}</span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="flex items-center justify-between py-2 border-y border-surface-container text-xs text-slate-grey font-body-md">
          <div className="flex items-center space-x-1.5">
            <Bed className="w-4 h-4 text-ink-navy/70" />
            <span>{bhk} BHK</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Maximize2 className="w-4 h-4 text-ink-navy/70" />
            <span>{area_sqft} sq ft</span>
          </div>
        </div>

        {/* Price & Action Link */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs text-slate-grey block">Price</span>
            <span className="text-lg font-data-price font-semibold text-ink-navy">
              {formattedPrice}
            </span>
          </div>
          <Link
            to={`/property/${targetDetailId}`}
            className="px-3.5 py-1.5 rounded bg-surface-container-high hover:bg-warm-brass hover:text-white text-ink-navy text-xs font-label-caps uppercase transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
