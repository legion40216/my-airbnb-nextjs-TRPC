import Headings from '@/components/global-ui/headings'
import React from 'react'
import { ReservationsSection } from '../sections/reservations-section'

export default function ReservationsView() {
  return (
    <div className="space-y-4">
      {/* Headings */}
      <Headings 
      title='Reservations'
      subtitle='List of your reservations'
      />   

      {/* Section */}
      <ReservationsSection />
    </div>
  )
}
