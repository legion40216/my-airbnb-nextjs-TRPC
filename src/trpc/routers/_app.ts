// trpc/routers/_app.ts
import { favouriteRouter } from '@/modules/favourites/server/procedures';
import { createTRPCRouter } from '../init';
import { listingsRouter } from '@/modules/listings/server/procedures'; // Add this import
import { usersRouter } from '@/modules/users/server/procedures';
import { reservationsRouter } from '@/modules/reservations/server/procedures';
import { propertiesRouter } from '@/modules/properties/server/procedures';

export const appRouter = createTRPCRouter({
  listings: listingsRouter, // Add this line
  favourites: favouriteRouter,
  users: usersRouter,
  reservations: reservationsRouter,
  properties: propertiesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
