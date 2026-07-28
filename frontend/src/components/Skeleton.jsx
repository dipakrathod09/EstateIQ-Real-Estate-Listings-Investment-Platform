import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-surface-variant p-4 space-y-3 shadow-sm">
    <div className="skeleton-pulse h-40 w-full rounded" />
    <div className="space-y-2">
      <div className="skeleton-pulse h-4 w-3/4" />
      <div className="skeleton-pulse h-3 w-1/2" />
      <div className="flex items-center space-x-2 pt-1">
        <div className="skeleton-pulse h-3 w-16" />
        <div className="skeleton-pulse h-3 w-16" />
        <div className="skeleton-pulse h-3 w-16" />
      </div>
      <div className="skeleton-pulse h-5 w-1/3 mt-2" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="bg-white rounded-lg border border-surface-variant p-4 flex items-center space-x-4 shadow-sm">
    <div className="skeleton-pulse h-12 w-12 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton-pulse h-4 w-2/3" />
      <div className="skeleton-pulse h-3 w-1/3" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
