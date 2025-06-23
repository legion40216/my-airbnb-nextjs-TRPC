import Headings from "@/components/global-ui/headings";
import React from "react";

export default function FavouritesView() {
  return (
    <div className="space-y-4">
      <Headings 
      title="Favourites" 
      subtitle="List of your favourites" 
      />

      <div>
        <FavouritesSection />
      </div>
    </div>
  );
}
