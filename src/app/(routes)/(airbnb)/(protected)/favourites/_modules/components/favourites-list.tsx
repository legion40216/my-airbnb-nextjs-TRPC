'use client';
import React from 'react'
import PropertyCard from './favourites-list/favourites-card';

type FavouritesItem = {
  id: string;
  locationRegion: string;
  locationLabel: string;
  imgSrc: string;
  category: string;
  price: string;
};

type FavouritesListProps = {
  data: FavouritesItem[];
};

export default function FavouritesList({ data }: FavouritesListProps) {
  
  return (
      <div>
        {data && data.length > 0 ? (
          <div
            className="grid grid-cols-2 gap-3 
              sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]"
          >
            {data?.map((item) => (
              <PropertyCard
                key={item.id}
                id={item.id}
                locationRegion= {item.locationRegion}
                locationLabel= {item.locationLabel}
                imgSrc={item.imgSrc}
                category={item.category}
                price={item.price}
              />
            ))}
          </div>
        ) : (
          <div>No results found</div>
        )}
      </div>
  )
}
