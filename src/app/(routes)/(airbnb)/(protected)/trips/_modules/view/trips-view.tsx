import React from "react";

import Headings from "@/components/global-ui/headings";
import { TripsSection } from "../sections/trips-section";

export default function TripsView() {
  return (
    <div className="space-y-4">
      <Headings 
      title="Trips" 
      subtitle="List of your trips" 
      />

      <div>
        <TripsSection />
      </div>
    </div>
  );
}
