import Headings from "@/components/global-ui/headings";
import React from "react";
import { PropertiesSection } from "../sections/properties-section";

export default function PropertiesView() {
  return (
    <div className="space-y-4">
      <Headings 
      title="Properties" 
      subtitle="List of your properties" 
      />

      <div>
        <PropertiesSection />
      </div>
    </div>
  );
}
