import React from "react";

import Headings from "@/components/global-ui/headings";
import { FavouritesSection } from "../sections/favourites-section";

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
